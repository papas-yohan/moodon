import { Test, TestingModule } from "@nestjs/testing";
import { ProductsService } from "./products.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import { ComposerService } from "../composer/composer.service";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
  UploadImageDto,
} from "./dto";

describe("ProductsService", () => {
  let service: ProductsService;
  let prisma: PrismaService;
  let storage: StorageService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    productImage: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockStorageService = {
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
  };

  const mockComposerService = {
    createComposeJob: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    retryComposeJob: jest.fn(),
    getJobStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
        {
          provide: ComposerService,
          useValue: mockComposerService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
    storage = module.get<StorageService>(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("상품을 성공적으로 생성해야 함", async () => {
      // Arrange
      const createDto: CreateProductDto = {
        name: "봄 원피스",
        price: 45000,
        size: "Free",
        color: "베이지",
      };
      const expectedProduct = {
        id: "uuid-1",
        ...createDto,
        status: "DRAFT",
        sendCount: 0,
        readCount: 0,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        images: [],
      };

      mockPrismaService.product.create.mockResolvedValue(expectedProduct);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(expectedProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          status: "DRAFT",
        },
        include: {
          images: {
            orderBy: { sequence: "asc" },
          },
        },
      });
    });

    it("생성 실패 시 BadRequestException을 던져야 함", async () => {
      // Arrange
      const createDto: CreateProductDto = {
        name: "봄 원피스",
        price: 45000,
      };
      mockPrismaService.product.create.mockRejectedValue(new Error("DB Error"));

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("findAll", () => {
    it("페이지네이션된 상품 목록을 반환해야 함", async () => {
      // Arrange
      const queryDto: QueryProductDto = { page: 1, limit: 10 };
      const products = [
        { id: "1", name: "상품1", price: 10000, images: [] },
        { id: "2", name: "상품2", price: 20000, images: [] },
      ];
      const total = 2;

      mockPrismaService.product.findMany.mockResolvedValue(products);
      mockPrismaService.product.count.mockResolvedValue(total);

      // Act
      const result = await service.findAll(queryDto);

      // Assert
      expect(result).toEqual({
        data: products,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("검색 조건이 있을 때 필터링된 결과를 반환해야 함", async () => {
      // Arrange
      const queryDto: QueryProductDto = { search: "원피스", status: "READY" };
      const products = [
        { id: "1", name: "봄 원피스", price: 45000, images: [] },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(products);
      mockPrismaService.product.count.mockResolvedValue(1);

      // Act
      await service.findAll(queryDto);

      // Assert
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            name: {
              contains: "원피스",
              mode: "insensitive",
            },
            status: "READY",
          },
        }),
      );
    });
  });

  describe("findOne", () => {
    it("ID로 상품을 찾아 반환해야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      const expectedProduct = {
        id: productId,
        name: "봄 원피스",
        price: 45000,
        images: [],
      };

      mockPrismaService.product.findUnique.mockResolvedValue(expectedProduct);

      // Act
      const result = await service.findOne(productId);

      // Assert
      expect(result).toEqual(expectedProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: {
          images: {
            orderBy: { sequence: "asc" },
          },
        },
      });
    });

    it("상품을 찾을 수 없을 때 NotFoundException을 던져야 함", async () => {
      // Arrange
      const productId = "non-existent-id";
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(productId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("상품을 성공적으로 수정해야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      const updateDto: UpdateProductDto = { name: "수정된 상품명" };
      const existingProduct = { id: productId, name: "기존 상품명" };
      const updatedProduct = { ...existingProduct, ...updateDto };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.update(productId, updateDto);

      // Assert
      expect(result).toEqual(updatedProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: {
          ...updateDto,
          updatedAt: expect.any(Date),
        },
        include: {
          images: {
            orderBy: { sequence: "asc" },
          },
        },
      });
    });
  });

  describe("remove", () => {
    it("상품을 성공적으로 삭제해야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      const existingProduct = { id: productId, name: "상품명" };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.delete.mockResolvedValue(existingProduct);

      // Act
      await service.remove(productId);

      // Assert
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });

  describe("getStats", () => {
    it("상품 통계를 반환해야 함", async () => {
      // Arrange
      mockPrismaService.product.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3) // draft
        .mockResolvedValueOnce(5) // ready
        .mockResolvedValueOnce(2); // archived

      // Act
      const result = await service.getStats();

      // Assert
      expect(result).toEqual({
        total: 10,
        draft: 3,
        ready: 5,
        archived: 2,
      });
    });
  });

  describe("uploadImage", () => {
    it("이미지를 성공적으로 업로드해야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      const file = {
        originalname: "test.jpg",
        mimetype: "image/jpeg",
        buffer: Buffer.from("test"),
        size: 1000,
      } as Express.Multer.File;
      const uploadDto: UploadImageDto = { sequence: 1 };

      const existingProduct = { id: productId, name: "상품명" };
      const uploadResult = {
        url: "http://localhost:3000/uploads/products/test.jpg",
        key: "products/test.jpg",
        size: 1000,
        mimeType: "image/jpeg",
      };
      const productImage = {
        id: "image-1",
        productId,
        imageUrl: uploadResult.url,
        sequence: 1,
        createdAt: new Date(),
      };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockStorageService.uploadImage.mockResolvedValue(uploadResult);
      mockPrismaService.productImage.create.mockResolvedValue(productImage);

      // Act
      const result = await service.uploadImage(productId, file, uploadDto);

      // Assert
      expect(result).toEqual({
        id: productImage.id,
        imageUrl: productImage.imageUrl,
        sequence: productImage.sequence,
        size: uploadResult.size,
        mimeType: uploadResult.mimeType,
        createdAt: productImage.createdAt,
      });
      expect(mockStorageService.uploadImage).toHaveBeenCalledWith(
        file,
        "products",
        { resize: undefined, quality: undefined },
      );
    });

    it("지원하지 않는 파일 형식일 때 BadRequestException을 던져야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      const file = {
        originalname: "test.txt",
        mimetype: "text/plain",
        buffer: Buffer.from("test"),
        size: 1000,
      } as Express.Multer.File;
      const uploadDto: UploadImageDto = {};

      const existingProduct = { id: productId, name: "상품명" };
      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(
        service.uploadImage(productId, file, uploadDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getImages", () => {
    it("상품의 이미지 목록을 반환해야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      const existingProduct = { id: productId, name: "상품명" };
      const images = [
        { id: "img-1", productId, imageUrl: "url1", sequence: 1 },
        { id: "img-2", productId, imageUrl: "url2", sequence: 2 },
      ];

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.productImage.findMany.mockResolvedValue(images);

      // Act
      const result = await service.getImages(productId);

      // Assert
      expect(result).toEqual(images);
      expect(mockPrismaService.productImage.findMany).toHaveBeenCalledWith({
        where: { productId },
        orderBy: { sequence: "asc" },
      });
    });
  });

  describe("deleteImage", () => {
    it("이미지를 성공적으로 삭제해야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      const imageId = "img-1";
      const existingProduct = { id: productId, name: "상품명" };
      const existingImage = {
        id: imageId,
        productId,
        imageUrl: "http://localhost:3000/uploads/products/test.jpg",
        sequence: 1,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.productImage.findFirst.mockResolvedValue(existingImage);
      mockStorageService.deleteImage.mockResolvedValue(undefined);
      mockPrismaService.productImage.delete.mockResolvedValue(existingImage);

      // Act
      const result = await service.deleteImage(productId, imageId);

      // Assert
      expect(result).toEqual({ message: "이미지가 삭제되었습니다." });
      expect(mockStorageService.deleteImage).toHaveBeenCalledWith(
        "products/test.jpg",
      );
      expect(mockPrismaService.productImage.delete).toHaveBeenCalledWith({
        where: { id: imageId },
      });
    });

    it("존재하지 않는 이미지 삭제 시 NotFoundException을 던져야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      const imageId = "non-existent-img";
      const existingProduct = { id: productId, name: "상품명" };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.productImage.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteImage(productId, imageId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("reorderImages", () => {
    it("이미지 순서를 성공적으로 변경해야 함", async () => {
      // Arrange
      const productId = "uuid-1";
      const imageIds = ["img-2", "img-1"];
      const existingProduct = { id: productId, name: "상품명" };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.$transaction.mockResolvedValue([]);

      // Act
      const result = await service.reorderImages(productId, imageIds);

      // Assert
      expect(result).toEqual({ message: "이미지 순서가 변경되었습니다." });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });
});
