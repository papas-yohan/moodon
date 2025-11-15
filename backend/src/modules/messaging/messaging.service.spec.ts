import { Test, TestingModule } from "@nestjs/testing";
import { MessagingService } from "./messaging.service";
import { MessageTemplateService } from "./message-template.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { CreateSendJobDto } from "./dto";

describe("MessagingService", () => {
  let service: MessagingService;
  let prisma: PrismaService;
  let messageTemplate: MessageTemplateService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
    },
    contact: {
      findMany: jest.fn(),
    },
    sendJob: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    sendLog: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockMessageTemplateService = {
    generateMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: MessageTemplateService,
          useValue: mockMessageTemplateService,
        },
      ],
    }).compile();

    service = module.get<MessagingService>(MessagingService);
    prisma = module.get<PrismaService>(PrismaService);
    messageTemplate = module.get<MessageTemplateService>(
      MessageTemplateService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createSendJob", () => {
    it("발송 작업을 성공적으로 생성해야 함", async () => {
      // Arrange
      const createDto: CreateSendJobDto = {
        productIds: ["product-1"],
        contactIds: ["contact-1", "contact-2"],
        channel: "SMS",
      };

      const products = [
        {
          id: "product-1",
          name: "테스트 상품",
          price: 10000,
          images: [],
        },
      ];

      const contacts = [
        {
          id: "contact-1",
          name: "홍길동",
          phone: "01012345678",
          kakaoId: null,
          isActive: true,
        },
        {
          id: "contact-2",
          name: "김철수",
          phone: "01087654321",
          kakaoId: "kim123",
          isActive: true,
        },
      ];

      const sendJob = {
        id: "job-1",
        productIds: JSON.stringify(["product-1"]),
        channel: "SMS",
        recipientCount: 2,
        status: "PENDING",
        createdAt: new Date(),
      };

      mockPrismaService.product.findMany.mockResolvedValue(products);
      mockPrismaService.contact.findMany.mockResolvedValue(contacts);
      mockPrismaService.sendJob.create.mockResolvedValue(sendJob);
      mockPrismaService.sendLog.createMany.mockResolvedValue({ count: 2 });

      // Act
      const result = await service.createSendJob(createDto);

      // Assert
      expect(result).toEqual(sendJob);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { id: { in: ["product-1"] } },
        include: { images: { take: 1, orderBy: { sequence: "asc" } } },
      });
      expect(mockPrismaService.contact.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ["contact-1", "contact-2"] },
          isActive: true,
        },
      });
      expect(mockPrismaService.sendJob.create).toHaveBeenCalled();
    });

    it("존재하지 않는 상품이 있을 때 BadRequestException을 던져야 함", async () => {
      // Arrange
      const createDto: CreateSendJobDto = {
        productIds: ["product-1", "product-2"],
        contactIds: ["contact-1"],
        channel: "SMS",
      };

      mockPrismaService.product.findMany.mockResolvedValue([
        { id: "product-1", name: "상품1" },
      ]); // product-2가 없음

      // Act & Assert
      await expect(service.createSendJob(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("활성화된 연락처가 없을 때 BadRequestException을 던져야 함", async () => {
      // Arrange
      const createDto: CreateSendJobDto = {
        productIds: ["product-1"],
        contactIds: ["contact-1"],
        channel: "SMS",
      };

      mockPrismaService.product.findMany.mockResolvedValue([
        { id: "product-1", name: "상품1" },
      ]);
      mockPrismaService.contact.findMany.mockResolvedValue([]); // 활성 연락처 없음

      // Act & Assert
      await expect(service.createSendJob(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("findAll", () => {
    it("발송 작업 목록을 반환해야 함", async () => {
      // Arrange
      const queryDto = { page: 1, limit: 10 };
      const sendJobs = [
        {
          id: "job-1",
          channel: "SMS",
          status: "COMPLETED",
          recipientCount: 5,
          successCount: 5,
          failCount: 0,
        },
        {
          id: "job-2",
          channel: "KAKAO",
          status: "PENDING",
          recipientCount: 3,
          successCount: 0,
          failCount: 0,
        },
      ];

      mockPrismaService.sendJob.findMany.mockResolvedValue(sendJobs);
      mockPrismaService.sendJob.count.mockResolvedValue(2);

      // Act
      const result = await service.findAll(queryDto);

      // Assert
      expect(result).toEqual({
        data: sendJobs,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("상태 필터가 적용되어야 함", async () => {
      // Arrange
      const queryDto = { status: "COMPLETED" };

      mockPrismaService.sendJob.findMany.mockResolvedValue([]);
      mockPrismaService.sendJob.count.mockResolvedValue(0);

      // Act
      await service.findAll(queryDto);

      // Assert
      expect(mockPrismaService.sendJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: "COMPLETED" },
        }),
      );
    });
  });

  describe("findOne", () => {
    it("ID로 발송 작업을 찾아 반환해야 함", async () => {
      // Arrange
      const jobId = "job-1";
      const sendJob = {
        id: jobId,
        channel: "SMS",
        status: "COMPLETED",
        recipientCount: 5,
      };

      mockPrismaService.sendJob.findUnique.mockResolvedValue(sendJob);

      // Act
      const result = await service.findOne(jobId);

      // Assert
      expect(result).toEqual(sendJob);
      expect(mockPrismaService.sendJob.findUnique).toHaveBeenCalledWith({
        where: { id: jobId },
      });
    });

    it("존재하지 않는 작업일 때 NotFoundException을 던져야 함", async () => {
      // Arrange
      const jobId = "non-existent";
      mockPrismaService.sendJob.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(jobId)).rejects.toThrow(NotFoundException);
    });
  });

  describe("getStats", () => {
    it("발송 통계를 반환해야 함", async () => {
      // Arrange
      mockPrismaService.sendJob.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(2) // pending
        .mockResolvedValueOnce(1) // processing
        .mockResolvedValueOnce(6) // completed
        .mockResolvedValueOnce(1); // failed

      mockPrismaService.sendLog.count
        .mockResolvedValueOnce(100) // total messages
        .mockResolvedValueOnce(95) // success messages
        .mockResolvedValueOnce(5); // failed messages

      // Act
      const result = await service.getStats();

      // Assert
      expect(result).toEqual({
        jobs: {
          total: 10,
          pending: 2,
          processing: 1,
          completed: 6,
          failed: 1,
        },
        messages: {
          total: 100,
          success: 95,
          failed: 5,
          successRate: "95.00",
        },
      });
    });
  });

  describe("getSendLogs", () => {
    it("발송 로그를 반환해야 함", async () => {
      // Arrange
      const sendJobId = "job-1";
      const logs = [
        {
          id: "log-1",
          sendJobId,
          channel: "SMS",
          status: "SUCCESS",
          product: { id: "product-1", name: "상품1" },
          contact: { id: "contact-1", name: "홍길동", phone: "01012345678" },
        },
      ];

      mockPrismaService.sendLog.findMany.mockResolvedValue(logs);
      mockPrismaService.sendLog.count.mockResolvedValue(1);

      // Act
      const result = await service.getSendLogs(sendJobId);

      // Assert
      expect(result).toEqual({
        data: logs,
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });
    });
  });
});
