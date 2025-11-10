import { Test, TestingModule } from '@nestjs/testing';
import { ComposerController } from './composer.controller';
import { ComposerService } from './composer.service';
import { CreateComposeJobDto } from './dto';

describe('ComposerController', () => {
  let controller: ComposerController;
  let service: ComposerService;

  const mockComposerService = {
    createComposeJob: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    retryComposeJob: jest.fn(),
    getJobStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComposerController],
      providers: [
        {
          provide: ComposerService,
          useValue: mockComposerService,
        },
      ],
    }).compile();

    controller = module.get<ComposerController>(ComposerController);
    service = module.get<ComposerService>(ComposerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createComposeJob', () => {
    it('합성 작업을 생성하고 결과를 반환해야 함', async () => {
      // Arrange
      const createDto: CreateComposeJobDto = {
        productId: 'product-1',
        templateType: 'grid',
      };
      const expectedResult = {
        id: 'job-1',
        productId: 'product-1',
        status: 'PENDING',
        templateType: 'grid',
        resultUrl: null,
        errorMessage: null,
        retryCount: 0,
        startedAt: null,
        completedAt: null,
        createdAt: new Date(),
      };

      mockComposerService.createComposeJob.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.createComposeJob(createDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.createComposeJob).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('모든 합성 작업 목록을 반환해야 함', async () => {
      // Arrange
      const expectedResult = [
        {
          id: 'job-1',
          productId: 'product-1',
          status: 'COMPLETED',
          product: { id: 'product-1', name: '상품1' },
        },
        {
          id: 'job-2',
          productId: 'product-2',
          status: 'PENDING',
          product: { id: 'product-2', name: '상품2' },
        },
      ];

      mockComposerService.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(undefined);
    });

    it('특정 상품의 합성 작업 목록을 반환해야 함', async () => {
      // Arrange
      const productId = 'product-1';
      const expectedResult = [
        {
          id: 'job-1',
          productId: 'product-1',
          status: 'COMPLETED',
          product: { id: 'product-1', name: '상품1' },
        },
      ];

      mockComposerService.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findAll(productId);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(productId);
    });
  });

  describe('getJobStats', () => {
    it('합성 작업 통계를 반환해야 함', async () => {
      // Arrange
      const expectedStats = {
        total: 10,
        pending: 2,
        processing: 1,
        completed: 6,
        failed: 1,
      };

      mockComposerService.getJobStats.mockResolvedValue(expectedStats);

      // Act
      const result = await controller.getJobStats();

      // Assert
      expect(result).toEqual(expectedStats);
      expect(service.getJobStats).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('ID로 합성 작업을 조회해야 함', async () => {
      // Arrange
      const jobId = 'job-1';
      const expectedResult = {
        id: jobId,
        productId: 'product-1',
        status: 'COMPLETED',
        templateType: 'grid',
        resultUrl: 'http://localhost:3000/uploads/composed/result.jpg',
        product: { id: 'product-1', name: '상품1' },
      };

      mockComposerService.findOne.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findOne(jobId);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(jobId);
    });
  });

  describe('retryComposeJob', () => {
    it('합성 작업을 재시도해야 함', async () => {
      // Arrange
      const jobId = 'job-1';
      const expectedResult = {
        id: jobId,
        productId: 'product-1',
        status: 'PENDING',
        retryCount: 1,
      };

      mockComposerService.retryComposeJob.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.retryComposeJob(jobId);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.retryComposeJob).toHaveBeenCalledWith(jobId);
    });
  });

  describe('composeProductImages', () => {
    it('상품 이미지 합성을 시작해야 함', async () => {
      // Arrange
      const productId = 'product-1';
      const templateType = 'highlight';
      const expectedResult = {
        id: 'job-1',
        productId,
        status: 'PENDING',
        templateType,
      };

      mockComposerService.createComposeJob.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.composeProductImages(productId, { templateType });

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.createComposeJob).toHaveBeenCalledWith({
        productId,
        templateType,
      });
    });

    it('템플릿 타입이 없을 때 기본값(grid)으로 합성해야 함', async () => {
      // Arrange
      const productId = 'product-1';
      const expectedResult = {
        id: 'job-1',
        productId,
        status: 'PENDING',
        templateType: 'grid',
      };

      mockComposerService.createComposeJob.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.composeProductImages(productId, {});

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.createComposeJob).toHaveBeenCalledWith({
        productId,
        templateType: 'grid',
      });
    });
  });
});