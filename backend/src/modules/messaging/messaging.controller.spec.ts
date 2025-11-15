import { Test, TestingModule } from "@nestjs/testing";
import { MessagingController } from "./messaging.controller";
import { MessagingService } from "./messaging.service";
import { CreateSendJobDto } from "./dto";

describe("MessagingController", () => {
  let controller: MessagingController;
  let service: MessagingService;

  const mockMessagingService = {
    createSendJob: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getSendLogs: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagingController],
      providers: [
        {
          provide: MessagingService,
          useValue: mockMessagingService,
        },
      ],
    }).compile();

    controller = module.get<MessagingController>(MessagingController);
    service = module.get<MessagingService>(MessagingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createSendJob", () => {
    it("발송 작업을 생성하고 결과를 반환해야 함", async () => {
      // Arrange
      const createDto: CreateSendJobDto = {
        productIds: ["product-1"],
        contactIds: ["contact-1", "contact-2"],
        channel: "SMS",
      };
      const expectedResult = {
        id: "job-1",
        productIds: JSON.stringify(["product-1"]),
        channel: "SMS",
        recipientCount: 2,
        status: "PENDING",
        createdAt: new Date(),
      };

      mockMessagingService.createSendJob.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.createSendJob(createDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.createSendJob).toHaveBeenCalledWith(createDto);
    });
  });

  describe("findAll", () => {
    it("발송 작업 목록을 반환해야 함", async () => {
      // Arrange
      const queryDto = { page: 1, limit: 10 };
      const expectedResult = {
        data: [
          {
            id: "job-1",
            channel: "SMS",
            status: "COMPLETED",
            recipientCount: 5,
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockMessagingService.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findAll(queryDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe("getStats", () => {
    it("발송 통계를 반환해야 함", async () => {
      // Arrange
      const expectedStats = {
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
      };

      mockMessagingService.getStats.mockResolvedValue(expectedStats);

      // Act
      const result = await controller.getStats();

      // Assert
      expect(result).toEqual(expectedStats);
      expect(service.getStats).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("ID로 발송 작업을 조회해야 함", async () => {
      // Arrange
      const jobId = "job-1";
      const expectedResult = {
        id: jobId,
        channel: "SMS",
        status: "COMPLETED",
        recipientCount: 5,
      };

      mockMessagingService.findOne.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findOne(jobId);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(jobId);
    });
  });

  describe("getSendLogs", () => {
    it("발송 로그를 조회해야 함", async () => {
      // Arrange
      const sendJobId = "job-1";
      const page = 1;
      const limit = 20;
      const expectedResult = {
        data: [
          {
            id: "log-1",
            sendJobId,
            channel: "SMS",
            status: "SUCCESS",
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };

      mockMessagingService.getSendLogs.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getSendLogs(sendJobId, page, limit);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.getSendLogs).toHaveBeenCalledWith(sendJobId, page, limit);
    });
  });

  describe("sendProductMessage", () => {
    it("특정 상품 발송을 처리해야 함", async () => {
      // Arrange
      const productId = "product-1";
      const body = {
        contactIds: ["contact-1", "contact-2"],
        channel: "SMS" as const,
        customMessage: "특별 할인!",
      };
      const expectedResult = {
        id: "job-1",
        productIds: JSON.stringify([productId]),
        channel: "SMS",
        recipientCount: 2,
        status: "PENDING",
      };

      mockMessagingService.createSendJob.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.sendProductMessage(productId, body);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.createSendJob).toHaveBeenCalledWith({
        productIds: [productId],
        contactIds: body.contactIds,
        channel: body.channel,
        customMessage: body.customMessage,
        scheduledAt: undefined,
      });
    });
  });

  describe("sendGroupMessage", () => {
    it("특정 그룹 발송을 처리해야 함", async () => {
      // Arrange
      const groupName = "VIP고객";
      const body = {
        productIds: ["product-1", "product-2"],
        channel: "BOTH" as const,
        customMessage: "신상품 출시!",
      };
      const expectedResult = {
        id: "job-1",
        productIds: JSON.stringify(body.productIds),
        channel: "BOTH",
        recipientCount: 0, // 현재는 빈 배열로 처리
        status: "PENDING",
      };

      mockMessagingService.createSendJob.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.sendGroupMessage(groupName, body);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.createSendJob).toHaveBeenCalledWith({
        productIds: body.productIds,
        contactIds: [], // 현재는 빈 배열
        channel: body.channel,
        customMessage: body.customMessage,
        scheduledAt: undefined,
      });
    });
  });
});
