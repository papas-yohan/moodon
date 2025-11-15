import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
  UploadImageDto,
} from "./dto";
import { Product } from "./entities/product.entity";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: "상품 등록" })
  @ApiResponse({
    status: 201,
    description: "상품이 성공적으로 등록되었습니다.",
    type: Product,
  })
  @ApiResponse({ status: 400, description: "잘못된 요청 데이터" })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: "상품 목록 조회" })
  @ApiResponse({
    status: 200,
    description: "상품 목록이 성공적으로 조회되었습니다.",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/Product" },
        },
        meta: {
          type: "object",
          properties: {
            total: { type: "number" },
            page: { type: "number" },
            limit: { type: "number" },
            totalPages: { type: "number" },
          },
        },
      },
    },
  })
  @ApiQuery({ name: "page", required: false, description: "페이지 번호" })
  @ApiQuery({ name: "limit", required: false, description: "페이지당 항목 수" })
  @ApiQuery({ name: "search", required: false, description: "검색어" })
  @ApiQuery({ name: "status", required: false, description: "상품 상태" })
  @ApiQuery({
    name: "sort",
    required: false,
    description: "정렬 (예: createdAt:desc)",
  })
  async findAll(@Query() queryDto: QueryProductDto) {
    return this.productsService.findAll(queryDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "상품 통계 조회" })
  @ApiResponse({
    status: 200,
    description: "상품 통계가 성공적으로 조회되었습니다.",
    schema: {
      type: "object",
      properties: {
        total: { type: "number", description: "전체 상품 수" },
        draft: { type: "number", description: "초안 상품 수" },
        ready: { type: "number", description: "준비된 상품 수" },
        archived: { type: "number", description: "보관된 상품 수" },
      },
    },
  })
  async getStats() {
    return this.productsService.getStats();
  }

  @Get(":id")
  @ApiOperation({ summary: "상품 상세 조회" })
  @ApiParam({ name: "id", description: "상품 ID" })
  @ApiResponse({
    status: 200,
    description: "상품이 성공적으로 조회되었습니다.",
    type: Product,
  })
  @ApiResponse({ status: 404, description: "상품을 찾을 수 없습니다." })
  async findOne(@Param("id") id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "상품 수정" })
  @ApiParam({ name: "id", description: "상품 ID" })
  @ApiResponse({
    status: 200,
    description: "상품이 성공적으로 수정되었습니다.",
    type: Product,
  })
  @ApiResponse({ status: 404, description: "상품을 찾을 수 없습니다." })
  @ApiResponse({ status: 400, description: "잘못된 요청 데이터" })
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "상품 삭제" })
  @ApiParam({ name: "id", description: "상품 ID" })
  @ApiResponse({
    status: 204,
    description: "상품이 성공적으로 삭제되었습니다.",
  })
  @ApiResponse({ status: 404, description: "상품을 찾을 수 없습니다." })
  async remove(@Param("id") id: string): Promise<void> {
    return this.productsService.remove(id);
  }

  // 이미지 업로드 엔드포인트들
  @Post(":id/images")
  @UseInterceptors(FileInterceptor("image"))
  @ApiOperation({ summary: "상품 이미지 업로드" })
  @ApiConsumes("multipart/form-data")
  @ApiParam({ name: "id", description: "상품 ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        image: {
          type: "string",
          format: "binary",
          description: "업로드할 이미지 파일",
        },
        sequence: {
          type: "number",
          description: "이미지 순서",
          example: 1,
        },
        width: {
          type: "number",
          description: "리사이즈 너비",
          example: 800,
        },
        height: {
          type: "number",
          description: "리사이즈 높이",
          example: 800,
        },
        quality: {
          type: "number",
          description: "이미지 품질 (1-100)",
          example: 80,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "이미지가 성공적으로 업로드되었습니다.",
    schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        imageUrl: { type: "string" },
        sequence: { type: "number" },
        size: { type: "number" },
        mimeType: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "잘못된 파일 형식 또는 크기" })
  @ApiResponse({ status: 404, description: "상품을 찾을 수 없습니다." })
  async uploadImage(
    @Param("id") productId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadDto: UploadImageDto,
  ) {
    return this.productsService.uploadImage(productId, file, uploadDto);
  }

  @Post(":id/images/multiple")
  @UseInterceptors(FilesInterceptor("images", 10)) // 최대 10개 파일
  @ApiOperation({ summary: "상품 다중 이미지 업로드" })
  @ApiConsumes("multipart/form-data")
  @ApiParam({ name: "id", description: "상품 ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        images: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
          description: "업로드할 이미지 파일들",
        },
        width: {
          type: "number",
          description: "리사이즈 너비",
          example: 800,
        },
        height: {
          type: "number",
          description: "리사이즈 높이",
          example: 800,
        },
        quality: {
          type: "number",
          description: "이미지 품질 (1-100)",
          example: 80,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "이미지들이 성공적으로 업로드되었습니다.",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          imageUrl: { type: "string" },
          sequence: { type: "number" },
          size: { type: "number" },
          mimeType: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  })
  async uploadMultipleImages(
    @Param("id") productId: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB per file
        ],
      }),
    )
    files: Express.Multer.File[],
    @Body() uploadDto: UploadImageDto,
  ) {
    return this.productsService.uploadMultipleImages(
      productId,
      files,
      uploadDto,
    );
  }

  @Get(":id/images")
  @ApiOperation({ summary: "상품 이미지 목록 조회" })
  @ApiParam({ name: "id", description: "상품 ID" })
  @ApiResponse({
    status: 200,
    description: "이미지 목록이 성공적으로 조회되었습니다.",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          imageUrl: { type: "string" },
          sequence: { type: "number" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  })
  async getImages(@Param("id") productId: string) {
    return this.productsService.getImages(productId);
  }

  @Delete(":id/images/:imageId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "상품 이미지 삭제" })
  @ApiParam({ name: "id", description: "상품 ID" })
  @ApiParam({ name: "imageId", description: "이미지 ID" })
  @ApiResponse({
    status: 204,
    description: "이미지가 성공적으로 삭제되었습니다.",
  })
  @ApiResponse({
    status: 404,
    description: "상품 또는 이미지를 찾을 수 없습니다.",
  })
  async deleteImage(
    @Param("id") productId: string,
    @Param("imageId") imageId: string,
  ) {
    return this.productsService.deleteImage(productId, imageId);
  }

  @Patch(":id/images/reorder")
  @ApiOperation({ summary: "상품 이미지 순서 변경" })
  @ApiParam({ name: "id", description: "상품 ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        imageIds: {
          type: "array",
          items: { type: "string" },
          description: "새로운 순서의 이미지 ID 배열",
          example: ["img1", "img2", "img3"],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "이미지 순서가 성공적으로 변경되었습니다.",
    schema: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  })
  async reorderImages(
    @Param("id") productId: string,
    @Body("imageIds") imageIds: string[],
  ) {
    return this.productsService.reorderImages(productId, imageIds);
  }
}
