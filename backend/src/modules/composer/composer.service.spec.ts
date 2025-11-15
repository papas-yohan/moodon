import { Test, TestingModule } from "@nestjs/testing";
import { ComposerService } from "./composer.service";
import { ImageComposerService } from "./image-composer.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { CreateComposeJobDto } from "./dto";

describe("ComposerService", () => {
  let service: ComposerService;
  let prisma: PrismaService;
  let imageComposer: ImageComposerService;

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    composeJob: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockImageComposerService = {
    composeImages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComposerService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ImageComposerService,
          useValue: mockImageComposerService,
        },
      ],
    }).compile();

    service = module.get<ComposerService>(ComposerService);
    prisma = module.get<PrismaService>(PrismaService);
    imageComposer = module.get<ImageComposerService>(ImageComposerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createComposeJob", () => {
    it("합성 작업을 성공적으로 생성해야 함", async () => {
      // Arrange
      const createDto: CreateComposeJobDto = {
        productId: "product-1",
        templateType: "grid",
      };
      const product = {
        id: "product-1",
        name: "테스트 상품",
        images: [
          { id: "img-1", imageUrl: "url1", sequence: 1 },
          { id: "img-2", imageUrl: "url2", sequence: 2 },
        ],
      };
      const composeJob = {
        id: "job-1",
        productId: "product-1",
        templateType: "grid",
        status: "PENDING",
        resultUrl: null,
        errorMessage: null,
        retryCount: 0,
        startedAt: null,
        completedAt: null,
        createdAt: new Date(),
      };

      mockPrismaService.product.findUnique.mockResolvedValue(product);
      mockPrismaService.composeJob.create.mockResolvedValue(composeJob);

      // Act
      const result = await service.createComposeJob(createDto);

      // Assert
      expect(result).toEqual(composeJob);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: "product-1" },
        include: {
          images: {
            orderBy: { sequence: "asc" },
          },
        },
      });
      expect(mockPrismaService.composeJob.create).toHaveBeenCalledWith({
        data: {
          productId: "product-1",
          templateType: "grid",
          status: "PENDING",
        },
      });
    });

    it("존재하지 않는 상품일 때 NotFoundException을 던져야 함", async () => {
      // Arrange
      const createDto: CreateComposeJobDto = {
        productId: "non-existent",
        templateType: "grid",
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createComposeJob(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("이미지가 없는 상품일 때 BadRequestException을 던져야 함", async () => {
      // Arrange
      const createDto: CreateComposeJobDto = {
        productId: "product-1",
        templateType: "grid",
      };
      const product = {
        id: "product-1",
        name: "테스트 상품",
        images: [],
      };

      mockPrismaService.product.findUnique.mockResolvedValue(product);

      // Act & Assert
      await expect(service.createComposeJob(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("findAll", () => {
    it("모든 합성 작업을 반환해야 함", async () => {
      // Arrange
      const jobs = [
        {
          id: "job-1",
          productId: "product-1",
          status: "COMPLETED",
          product: { id: "product-1", name: "상품1" },
        },
        {
          id: "job-2",
          productId: "product-2",
          status: "PENDING",
          product: { id: "product-2", name: "상품2" },
        },
      ];

      mockPrismaService.composeJob.findMany.mockResolvedValue(jobs);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(jobs);
      expect(mockPrismaService.composeJob.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it("특정 상품의 합성 작업만 반환해야 함", async () => {
      // Arrange
      const productId = "product-1";
      const jobs = [
        {
          id: "job-1",
          productId: "product-1",
          status: "COMPLETED",
          product: { id: "product-1", name: "상품1" },
        },
      ];

      mockPrismaService.composeJob.findMany.mockResolvedValue(jobs);

      // Act
      const result = await service.findAll(productId);

      // Assert
      expect(result).toEqual(jobs);
      expect(mockPrismaService.composeJob.findMany).toHaveBeenCalledWith({
        where: { productId },
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });
  });

  describe("findOne", () => {
    it("ID로 합성 작업을 찾아 반환해야 함", async () => {
      // Arrange
      const jobId = "job-1";
      const job = {
        id: jobId,
        productId: "product-1",
        status: "COMPLETED",
        product: { id: "product-1", name: "상품1" },
      };

      mockPrismaService.composeJob.findUnique.mockResolvedValue(job);

      // Act
      const result = await service.findOne(jobId);

      // Assert
      expect(result).toEqual(job);
      expect(mockPrismaService.composeJob.findUnique).toHaveBeenCalledWith({
        where: { id: jobId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it("존재하지 않는 작업일 때 NotFoundException을 던져야 함", async () => {
      // Arrange
      const jobId = "non-existent";
      mockPrismaService.composeJob.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(jobId)).rejects.toThrow(NotFoundException);
    });
  });

  describe("retryComposeJob", () => {
    it("실패한 작업을 성공적으로 재시도해야 함", async () => {
      // Arrange
      const jobId = "job-1";
      const existingJob = {
        id: jobId,
        productId: "product-1",
        status: "FAILED",
        retryCount: 1,
        product: { id: "product-1", name: "상품1" },
      };
      const updatedJob = {
        ...existingJob,
        status: "PENDING",
        retryCount: 2,
        errorMessage: null,
        startedAt: null,
        completedAt: null,
      };

      mockPrismaService.composeJob.findUnique.mockResolvedValue(existingJob);
      mockPrismaService.composeJob.update.mockResolvedValue(updatedJob);

      // Act
      const result = await service.retryComposeJob(jobId);

      // Assert
      expect(result).toEqual(updatedJob);
      expect(mockPrismaService.composeJob.update).toHaveBeenCalledWith({
        where: { id: jobId },
        data: {
          status: "PENDING",
          retryCount: { increment: 1 },
          errorMessage: null,
          startedAt: null,
          completedAt: null,
        },
      });
    });

    it("처리 중인 작업 재시도 시 BadRequestException을 던져야 함", async () => {
      // Arrange
      const jobId = "job-1";
      const existingJob = {
        id: jobId,
        productId: "product-1",
        status: "PROCESSING",
        retryCount: 0,
        product: { id: "product-1", name: "상품1" },
      };

      mockPrismaService.composeJob.findUnique.mockResolvedValue(existingJob);

      // Act & Assert
      await expect(service.retryComposeJob(jobId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("최대 재시도 횟수 초과 시 BadRequestException을 던져야 함", async () => {
      // Arrange
      const jobId = "job-1";
      const existingJob = {
        id: jobId,
        productId: "product-1",
        status: "FAILED",
        retryCount: 3,
        product: { id: "product-1", name: "상품1" },
      };

      mockPrismaService.composeJob.findUnique.mockResolvedValue(existingJob);

      // Act & Assert
      await expect(service.retryComposeJob(jobId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("getJobStats", () => {
    it("합성 작업 통계를 반환해야 함", async () => {
      // Arrange
      mockPrismaService.composeJob.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(2) // pending
        .mockResolvedValueOnce(1) // processing
        .mockResolvedValueOnce(6) // completed
        .mockResolvedValueOnce(1); // failed

      // Act
      const result = await service.getJobStats();

      // Assert
      expect(result).toEqual({
        total: 10,
        pending: 2,
        processing: 1,
        completed: 6,
        failed: 1,
      });
    });
  });
});
