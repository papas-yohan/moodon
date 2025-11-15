import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { ComposerService } from "./composer.service";
import { CreateComposeJobDto } from "./dto";
import { ComposeJob } from "./entities/compose-job.entity";

@ApiTags("Composer")
@Controller("composer")
export class ComposerController {
  constructor(private readonly composerService: ComposerService) {}

  @Post("jobs")
  @ApiOperation({ summary: "이미지 합성 작업 생성" })
  @ApiResponse({
    status: 201,
    description: "합성 작업이 성공적으로 생성되었습니다.",
    type: ComposeJob,
  })
  @ApiResponse({ status: 400, description: "잘못된 요청 데이터" })
  @ApiResponse({ status: 404, description: "상품을 찾을 수 없습니다." })
  async createComposeJob(
    @Body() createDto: CreateComposeJobDto,
  ): Promise<ComposeJob> {
    return this.composerService.createComposeJob(createDto);
  }

  @Get("jobs")
  @ApiOperation({ summary: "합성 작업 목록 조회" })
  @ApiQuery({
    name: "productId",
    required: false,
    description: "특정 상품의 합성 작업만 조회",
  })
  @ApiResponse({
    status: 200,
    description: "합성 작업 목록이 성공적으로 조회되었습니다.",
    type: [ComposeJob],
  })
  async findAll(@Query("productId") productId?: string) {
    return this.composerService.findAll(productId);
  }

  @Get("jobs/stats")
  @ApiOperation({ summary: "합성 작업 통계 조회" })
  @ApiResponse({
    status: 200,
    description: "합성 작업 통계가 성공적으로 조회되었습니다.",
    schema: {
      type: "object",
      properties: {
        total: { type: "number", description: "전체 작업 수" },
        pending: { type: "number", description: "대기 중인 작업 수" },
        processing: { type: "number", description: "처리 중인 작업 수" },
        completed: { type: "number", description: "완료된 작업 수" },
        failed: { type: "number", description: "실패한 작업 수" },
      },
    },
  })
  async getJobStats() {
    return this.composerService.getJobStats();
  }

  @Get("jobs/:id")
  @ApiOperation({ summary: "합성 작업 상세 조회" })
  @ApiParam({ name: "id", description: "합성 작업 ID" })
  @ApiResponse({
    status: 200,
    description: "합성 작업이 성공적으로 조회되었습니다.",
    type: ComposeJob,
  })
  @ApiResponse({ status: 404, description: "합성 작업을 찾을 수 없습니다." })
  async findOne(@Param("id") id: string): Promise<ComposeJob> {
    return this.composerService.findOne(id);
  }

  @Post("jobs/:id/retry")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "합성 작업 재시도" })
  @ApiParam({ name: "id", description: "합성 작업 ID" })
  @ApiResponse({
    status: 200,
    description: "합성 작업 재시도가 시작되었습니다.",
    type: ComposeJob,
  })
  @ApiResponse({ status: 400, description: "재시도할 수 없는 상태입니다." })
  @ApiResponse({ status: 404, description: "합성 작업을 찾을 수 없습니다." })
  async retryComposeJob(@Param("id") id: string): Promise<ComposeJob> {
    return this.composerService.retryComposeJob(id);
  }

  // 편의 메서드: 상품 ID로 직접 합성 작업 생성
  @Post("products/:productId/compose")
  @ApiOperation({ summary: "상품 이미지 합성 (편의 메서드)" })
  @ApiParam({ name: "productId", description: "상품 ID" })
  @ApiResponse({
    status: 201,
    description: "합성 작업이 성공적으로 생성되었습니다.",
    type: ComposeJob,
  })
  @ApiResponse({ status: 400, description: "잘못된 요청 데이터" })
  @ApiResponse({ status: 404, description: "상품을 찾을 수 없습니다." })
  async composeProductImages(
    @Param("productId") productId: string,
    @Body() body: { templateType?: "grid" | "highlight" | "simple" },
  ): Promise<ComposeJob> {
    return this.composerService.createComposeJob({
      productId,
      templateType: body.templateType || "grid",
    });
  }
}
