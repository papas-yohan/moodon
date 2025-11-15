import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import { ComposerService } from "../composer/composer.service";
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
  UploadImageDto,
} from "./dto";
import { Product } from "./entities/product.entity";

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    @Inject(forwardRef(() => ComposerService))
    private readonly composerService: ComposerService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const product = await this.prisma.product.create({
        data: {
          ...createProductDto,
          status: "DRAFT",
        },
        include: {
          images: {
            orderBy: { sequence: "asc" },
          },
        },
      });

      return product as Product;
    } catch (error) {
      throw new BadRequestException("상품 생성에 실패했습니다.");
    }
  }

  async findAll(queryDto: QueryProductDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sort = "createdAt:desc",
    } = queryDto;
    const skip = (page - 1) * limit;

    // 정렬 파싱
    const [sortField, sortOrder] = sort.split(":");
    const orderBy = { [sortField]: sortOrder || "desc" };

    // 검색 조건 구성
    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (status) {
      where.status = status;
    }

    try {
      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            images: {
              orderBy: { sequence: "asc" },
              take: 1, // 썸네일용으로 첫 번째 이미지만
            },
          },
        }),
        this.prisma.product.count({ where }),
      ]);

      return {
        data: products as Product[],
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException("상품 목록 조회에 실패했습니다.");
    }
  }

  async findOne(id: string): Promise<Product> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          images: {
            orderBy: { sequence: "asc" },
          },
        },
      });

      if (!product) {
        throw new NotFoundException("상품을 찾을 수 없습니다.");
      }

      return product as Product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException("상품 조회에 실패했습니다.");
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    // 상품 존재 확인
    await this.findOne(id);

    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          ...updateProductDto,
          updatedAt: new Date(),
        },
        include: {
          images: {
            orderBy: { sequence: "asc" },
          },
        },
      });

      return product as Product;
    } catch (error) {
      throw new BadRequestException("상품 수정에 실패했습니다.");
    }
  }

  async remove(id: string): Promise<void> {
    // 상품 존재 확인
    await this.findOne(id);

    try {
      await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException("상품 삭제에 실패했습니다.");
    }
  }

  async updateSendCount(id: string): Promise<void> {
    try {
      await this.prisma.product.update({
        where: { id },
        data: {
          sendCount: { increment: 1 },
        },
      });
    } catch (error) {
      // 발송 횟수 업데이트 실패는 로그만 남기고 에러를 던지지 않음
      console.error(`Failed to update send count for product ${id}:`, error);
    }
  }

  async updateReadCount(id: string): Promise<void> {
    try {
      await this.prisma.product.update({
        where: { id },
        data: {
          readCount: { increment: 1 },
        },
      });
    } catch (error) {
      console.error(`Failed to update read count for product ${id}:`, error);
    }
  }

  async updateClickCount(id: string): Promise<void> {
    try {
      await this.prisma.product.update({
        where: { id },
        data: {
          clickCount: { increment: 1 },
        },
      });
    } catch (error) {
      console.error(`Failed to update click count for product ${id}:`, error);
    }
  }

  async getStats() {
    try {
      const [total, draft, ready, archived] = await Promise.all([
        this.prisma.product.count(),
        this.prisma.product.count({ where: { status: "DRAFT" } }),
        this.prisma.product.count({ where: { status: "READY" } }),
        this.prisma.product.count({ where: { status: "ARCHIVED" } }),
      ]);

      return {
        total,
        draft,
        ready,
        archived,
      };
    } catch (error) {
      throw new BadRequestException("상품 통계 조회에 실패했습니다.");
    }
  }

  // 이미지 업로드
  async uploadImage(
    productId: string,
    file: Express.Multer.File,
    uploadDto: UploadImageDto,
  ) {
    // 상품 존재 확인
    await this.findOne(productId);

    // 파일 존재 확인
    if (!file) {
      throw new BadRequestException("업로드할 파일이 없습니다.");
    }

    // 파일 타입 검증
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        "지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WebP만 지원)",
      );
    }

    try {
      // 이미지 업로드
      const uploadResult = await this.storageService.uploadImage(
        file,
        "products",
        {
          resize:
            uploadDto.width && uploadDto.height
              ? { width: uploadDto.width, height: uploadDto.height }
              : undefined,
          quality: uploadDto.quality,
        },
      );

      // 시퀀스 결정
      let sequence = uploadDto.sequence;
      if (!sequence) {
        const lastImage = await this.prisma.productImage.findFirst({
          where: { productId },
          orderBy: { sequence: "desc" },
        });
        sequence = (lastImage?.sequence || 0) + 1;
      }

      // 데이터베이스에 이미지 정보 저장
      const productImage = await this.prisma.productImage.create({
        data: {
          productId,
          imageUrl: uploadResult.url,
          sequence,
        },
      });

      return {
        id: productImage.id,
        imageUrl: productImage.imageUrl,
        sequence: productImage.sequence,
        size: uploadResult.size,
        mimeType: uploadResult.mimeType,
        createdAt: productImage.createdAt,
      };
    } catch (error) {
      throw new BadRequestException("이미지 업로드에 실패했습니다.");
    }
  }

  // 이미지 목록 조회
  async getImages(productId: string) {
    // 상품 존재 확인
    await this.findOne(productId);

    try {
      const images = await this.prisma.productImage.findMany({
        where: { productId },
        orderBy: { sequence: "asc" },
      });

      return images;
    } catch (error) {
      throw new BadRequestException("이미지 목록 조회에 실패했습니다.");
    }
  }

  // 이미지 삭제
  async deleteImage(productId: string, imageId: string) {
    // 상품 존재 확인
    await this.findOne(productId);

    try {
      const image = await this.prisma.productImage.findFirst({
        where: { id: imageId, productId },
      });

      if (!image) {
        throw new NotFoundException("이미지를 찾을 수 없습니다.");
      }

      // 스토리지에서 이미지 삭제
      const key = image.imageUrl.split("/").pop(); // URL에서 키 추출
      if (key) {
        await this.storageService.deleteImage(`products/${key}`);
      }

      // 데이터베이스에서 이미지 삭제
      await this.prisma.productImage.delete({
        where: { id: imageId },
      });

      return { message: "이미지가 삭제되었습니다." };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException("이미지 삭제에 실패했습니다.");
    }
  }

  // 이미지 순서 변경
  async reorderImages(productId: string, imageIds: string[]) {
    // 상품 존재 확인
    await this.findOne(productId);

    try {
      // 트랜잭션으로 순서 업데이트
      await this.prisma.$transaction(
        imageIds.map((imageId, index) =>
          this.prisma.productImage.update({
            where: { id: imageId, productId },
            data: { sequence: index + 1 },
          }),
        ),
      );

      return { message: "이미지 순서가 변경되었습니다." };
    } catch (error) {
      throw new BadRequestException("이미지 순서 변경에 실패했습니다.");
    }
  }

  // 다중 이미지 업로드
  async uploadMultipleImages(
    productId: string,
    files: Express.Multer.File[],
    uploadDto: UploadImageDto,
  ) {
    // 상품 존재 확인
    await this.findOne(productId);

    // 파일 타입 검증
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `지원하지 않는 이미지 형식입니다: ${file.originalname}`,
        );
      }
    }

    try {
      const results = [];

      // 시작 시퀀스 결정
      const lastImage = await this.prisma.productImage.findFirst({
        where: { productId },
        orderBy: { sequence: "desc" },
      });
      const startSequence = (lastImage?.sequence || 0) + 1;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 이미지 업로드
        const uploadResult = await this.storageService.uploadImage(
          file,
          "products",
          {
            resize:
              uploadDto.width && uploadDto.height
                ? { width: uploadDto.width, height: uploadDto.height }
                : undefined,
            quality: uploadDto.quality,
          },
        );

        // 데이터베이스에 이미지 정보 저장
        const productImage = await this.prisma.productImage.create({
          data: {
            productId,
            imageUrl: uploadResult.url,
            sequence: startSequence + i,
          },
        });

        results.push({
          id: productImage.id,
          imageUrl: productImage.imageUrl,
          sequence: productImage.sequence,
          size: uploadResult.size,
          mimeType: uploadResult.mimeType,
          createdAt: productImage.createdAt,
        });
      }

      // 이미지 업로드 완료 후 전체 이미지 개수 확인하여 합성 작업 트리거
      const totalImages = await this.prisma.productImage.count({
        where: { productId },
      });

      if (totalImages >= 2) {
        this.logger.log(
          `Triggering auto-compose for product ${productId} with ${totalImages} total images`,
        );
        this.composerService
          .createComposeJob({
            productId,
            templateType: "grid",
          })
          .catch((error) => {
            this.logger.error(
              `Auto-compose failed for product ${productId}`,
              error,
            );
          });
      }

      return results;
    } catch (error) {
      throw new BadRequestException("다중 이미지 업로드에 실패했습니다.");
    }
  }
}
