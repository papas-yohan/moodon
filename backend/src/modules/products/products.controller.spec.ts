import { Test, TestingModule } from "@nestjs/testing";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
  UploadImageDto,
} from "./dto";

describe("ProductsController", () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
    uploadImage: jest.fn(),
    uploadMultipleImages: jest.fn(),
    getImages: jest.fn(),
    deleteImage: jest.fn(),
    reorderImages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("상품을 생성하고 결과를 반환해야 함", async () => {
      // Arrange
      const createDto: CreateProductDto = {
        name: "봄 원피스",
        price: 45000,
        size: "Free",
        color: "베이지",
      };
      const expectedResult = {
        id: "uuid-1",
        ...createDto,
        status: "DRAFT",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductsService.create.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("findAll", () => {
    it("쿼리 파라미터로 상품 목록을 조회해야 함", async () => {
      // Arrange
      const queryDto: QueryProductDto = {
        page: 1,
        limit: 10,
        search: "원피스",
      };
      const expectedResult = {
        data: [
          { id: "1", name: "봄 원피스", price: 45000 },
          { id: "2", name: "여름 원피스", price: 35000 },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockProductsService.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findAll(queryDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe("findOne", () => {
    it("ID로 상품을 조회해야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      const expectedResult = {
        id: productId,
        name: "봄 원피스",
        price: 45000,
        status: "DRAFT",
      };

      mockProductsService.findOne.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findOne(productId);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(productId);
    });
  });

  describe("update", () => {
    it("상품을 수정하고 결과를 반환해야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      const updateDto: UpdateProductDto = {
        name: "수정된 상품명",
        price: 50000,
      };
      const expectedResult = {
        id: productId,
        ...updateDto,
        status: "DRAFT",
        updatedAt: new Date(),
      };

      mockProductsService.update.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.update(productId, updateDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(productId, updateDto);
    });
  });

  describe("remove", () => {
    it("상품을 삭제해야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      mockProductsService.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(productId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(productId);
    });
  });

  describe("getStats", () => {
    it("상품 통계를 반환해야 함", async () => {
      // Arrange
      const expectedStats = {
        total: 10,
        draft: 3,
        ready: 5,
        archived: 2,
      };

      mockProductsService.getStats.mockResolvedValue(expectedStats);

      // Act
      const result = await controller.getStats();

      // Assert
      expect(result).toEqual(expectedStats);
      expect(service.getStats).toHaveBeenCalled();
    });
  });

  describe("uploadImage", () => {
    it("이미지를 업로드하고 결과를 반환해야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      const file = {
        originalname: "test.jpg",
        mimetype: "image/jpeg",
        buffer: Buffer.from("test"),
        size: 1000,
      } as Express.Multer.File;
      const uploadDto: UploadImageDto = { sequence: 1 };
      const expectedResult = {
        id: "img-1",
        imageUrl: "http://localhost:3000/uploads/products/test.jpg",
        sequence: 1,
        size: 1000,
        mimeType: "image/jpeg",
        createdAt: new Date(),
      };

      mockProductsService.uploadImage.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.uploadImage(productId, file, uploadDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.uploadImage).toHaveBeenCalledWith(
        productId,
        file,
        uploadDto,
      );
    });
  });

  describe("uploadMultipleImages", () => {
    it("다중 이미지를 업로드하고 결과를 반환해야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      const files = [
        {
          originalname: "test1.jpg",
          mimetype: "image/jpeg",
          buffer: Buffer.from("test1"),
          size: 1000,
        },
        {
          originalname: "test2.jpg",
          mimetype: "image/jpeg",
          buffer: Buffer.from("test2"),
          size: 1000,
        },
      ] as Express.Multer.File[];
      const uploadDto: UploadImageDto = {};
      const expectedResult = [
        {
          id: "img-1",
          imageUrl: "http://localhost:3000/uploads/products/test1.jpg",
          sequence: 1,
          size: 1000,
          mimeType: "image/jpeg",
          createdAt: new Date(),
        },
        {
          id: "img-2",
          imageUrl: "http://localhost:3000/uploads/products/test2.jpg",
          sequence: 2,
          size: 1000,
          mimeType: "image/jpeg",
          createdAt: new Date(),
        },
      ];

      mockProductsService.uploadMultipleImages.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await controller.uploadMultipleImages(
        productId,
        files,
        uploadDto,
      );

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.uploadMultipleImages).toHaveBeenCalledWith(
        productId,
        files,
        uploadDto,
      );
    });
  });

  describe("getImages", () => {
    it("상품의 이미지 목록을 반환해야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      const expectedResult = [
        {
          id: "img-1",
          productId,
          imageUrl: "http://localhost:3000/uploads/products/test1.jpg",
          sequence: 1,
          createdAt: new Date(),
        },
        {
          id: "img-2",
          productId,
          imageUrl: "http://localhost:3000/uploads/products/test2.jpg",
          sequence: 2,
          createdAt: new Date(),
        },
      ];

      mockProductsService.getImages.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getImages(productId);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.getImages).toHaveBeenCalledWith(productId);
    });
  });

  describe("deleteImage", () => {
    it("이미지를 삭제해야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      const imageId = "img-1";
      const expectedResult = { message: "이미지가 삭제되었습니다." };

      mockProductsService.deleteImage.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.deleteImage(productId, imageId);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.deleteImage).toHaveBeenCalledWith(productId, imageId);
    });
  });

  describe("reorderImages", () => {
    it("이미지 순서를 변경해야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      const imageIds = ["img-2", "img-1"];
      const expectedResult = { message: "이미지 순서가 변경되었습니다." };

      mockProductsService.reorderImages.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.reorderImages(productId, imageIds);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.reorderImages).toHaveBeenCalledWith(productId, imageIds);
    });
  });
});
