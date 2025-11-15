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
import { MessagingService } from "./messaging.service";
import { SendJobMonitorService } from "./send-job-monitor.service";
import { CreateSendJobDto, QuerySendJobDto } from "./dto";
import { SendJob, SendLog } from "./entities";

@ApiTags("Messaging")
@Controller("messaging")
export class MessagingController {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly monitorService: SendJobMonitorService,
  ) {}

  @Post("send-jobs")
  @ApiOperation({ summary: "발송 작업 생성" })
  @ApiResponse({
    status: 201,
    description: "발송 작업이 성공적으로 생성되었습니다.",
    type: SendJob,
  })
  @ApiResponse({ status: 400, description: "잘못된 요청 데이터" })
  async createSendJob(@Body() createDto: CreateSendJobDto): Promise<SendJob> {
    return this.messagingService.createSendJob(createDto);
  }

  @Get("send-jobs")
  @ApiOperation({ summary: "발송 작업 목록 조회" })
  @ApiResponse({
    status: 200,
    description: "발송 작업 목록이 성공적으로 조회되었습니다.",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/SendJob" },
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
  @ApiQuery({ name: "status", required: false, description: "발송 상태 필터" })
  @ApiQuery({ name: "channel", required: false, description: "발송 채널 필터" })
  @ApiQuery({
    name: "sort",
    required: false,
    description: "정렬 (예: createdAt:desc)",
  })
  async findAll(@Query() queryDto: QuerySendJobDto) {
    return this.messagingService.findAll(queryDto);
  }

  @Get("send-jobs/stats")
  @ApiOperation({ summary: "발송 통계 조회" })
  @ApiResponse({
    status: 200,
    description: "발송 통계가 성공적으로 조회되었습니다.",
    schema: {
      type: "object",
      properties: {
        jobs: {
          type: "object",
          properties: {
            total: { type: "number", description: "전체 작업 수" },
            pending: { type: "number", description: "대기 중인 작업 수" },
            processing: { type: "number", description: "처리 중인 작업 수" },
            completed: { type: "number", description: "완료된 작업 수" },
            failed: { type: "number", description: "실패한 작업 수" },
          },
        },
        messages: {
          type: "object",
          properties: {
            total: { type: "number", description: "전체 메시지 수" },
            success: { type: "number", description: "성공한 메시지 수" },
            failed: { type: "number", description: "실패한 메시지 수" },
            successRate: { type: "string", description: "성공률 (%)" },
          },
        },
      },
    },
  })
  async getStats() {
    return this.messagingService.getStats();
  }

  @Get("send-jobs/:id")
  @ApiOperation({ summary: "발송 작업 상세 조회" })
  @ApiParam({ name: "id", description: "발송 작업 ID" })
  @ApiResponse({
    status: 200,
    description: "발송 작업이 성공적으로 조회되었습니다.",
    type: SendJob,
  })
  @ApiResponse({ status: 404, description: "발송 작업을 찾을 수 없습니다." })
  async findOne(@Param("id") id: string): Promise<SendJob> {
    return this.messagingService.findOne(id);
  }

  @Get("send-jobs/:id/logs")
  @ApiOperation({ summary: "발송 로그 조회" })
  @ApiParam({ name: "id", description: "발송 작업 ID" })
  @ApiQuery({ name: "page", required: false, description: "페이지 번호" })
  @ApiQuery({ name: "limit", required: false, description: "페이지당 항목 수" })
  @ApiResponse({
    status: 200,
    description: "발송 로그가 성공적으로 조회되었습니다.",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/SendLog" },
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
  async getSendLogs(
    @Param("id") sendJobId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.messagingService.getSendLogs(sendJobId, page, limit);
  }

  // 편의 메서드: 상품별 발송
  @Post("products/:productId/send")
  @ApiOperation({ summary: "특정 상품 발송 (편의 메서드)" })
  @ApiParam({ name: "productId", description: "상품 ID" })
  @ApiResponse({
    status: 201,
    description: "발송 작업이 성공적으로 생성되었습니다.",
    type: SendJob,
  })
  async sendProductMessage(
    @Param("productId") productId: string,
    @Body()
    body: {
      contactIds: string[];
      channel: "SMS" | "KAKAO" | "BOTH";
      customMessage?: string;
      scheduledAt?: string;
    },
  ): Promise<SendJob> {
    const createDto: CreateSendJobDto = {
      productIds: [productId],
      contactIds: body.contactIds,
      channel: body.channel,
      customMessage: body.customMessage,
      scheduledAt: body.scheduledAt,
    };

    return this.messagingService.createSendJob(createDto);
  }

  // 편의 메서드: 그룹별 발송
  @Post("groups/:groupName/send")
  @ApiOperation({ summary: "특정 그룹 발송 (편의 메서드)" })
  @ApiParam({ name: "groupName", description: "그룹명" })
  @ApiResponse({
    status: 201,
    description: "발송 작업이 성공적으로 생성되었습니다.",
    type: SendJob,
  })
  async sendGroupMessage(
    @Param("groupName") groupName: string,
    @Body()
    body: {
      productIds: string[];
      channel: "SMS" | "KAKAO" | "BOTH";
      customMessage?: string;
      scheduledAt?: string;
    },
  ): Promise<SendJob> {
    // 그룹에 속한 연락처 조회 (실제 구현에서는 ContactsService 사용)
    // 현재는 임시로 빈 배열 반환
    const contactIds: string[] = [];

    const createDto: CreateSendJobDto = {
      productIds: body.productIds,
      contactIds,
      channel: body.channel,
      customMessage: body.customMessage,
      scheduledAt: body.scheduledAt,
    };

    return this.messagingService.createSendJob(createDto);
  }

  // 모니터링 엔드포인트들
  @Get("send-jobs/:id/monitor")
  @ApiOperation({ summary: "발송 작업 실시간 진행률 조회" })
  @ApiParam({ name: "id", description: "발송 작업 ID" })
  @ApiResponse({ status: 200, description: "진행률 정보" })
  async getJobProgress(@Param("id") jobId: string) {
    return this.monitorService.getJobProgress(jobId);
  }

  @Get("send-jobs/:id/logs/live")
  @ApiOperation({ summary: "발송 로그 실시간 조회" })
  @ApiParam({ name: "id", description: "발송 작업 ID" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "조회할 로그 수 (기본: 50)",
  })
  @ApiResponse({ status: 200, description: "실시간 로그 목록" })
  async getJobLogs(@Param("id") jobId: string, @Query("limit") limit?: number) {
    return this.monitorService.getJobLogs(jobId, limit);
  }

  @Post("send-jobs/:id/pause")
  @ApiOperation({ summary: "발송 작업 일시정지" })
  @ApiParam({ name: "id", description: "발송 작업 ID" })
  @HttpCode(HttpStatus.OK)
  async pauseJob(@Param("id") jobId: string) {
    return this.monitorService.pauseJob(jobId);
  }

  @Post("send-jobs/:id/resume")
  @ApiOperation({ summary: "발송 작업 재개" })
  @ApiParam({ name: "id", description: "발송 작업 ID" })
  @HttpCode(HttpStatus.OK)
  async resumeJob(@Param("id") jobId: string) {
    return this.monitorService.resumeJob(jobId);
  }

  @Get("monitor/live-stats")
  @ApiOperation({ summary: "실시간 발송 통계" })
  @ApiResponse({
    status: 200,
    description: "진행 중인 모든 작업의 실시간 통계",
  })
  async getLiveStats() {
    return this.monitorService.getLiveStats();
  }
}
