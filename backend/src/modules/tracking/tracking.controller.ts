import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { AnalyticsService } from './analytics.service';
import { CreateTrackingEventDto, QueryTrackingEventDto } from './dto';
import { TrackingEvent } from './entities';

@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(
    private readonly trackingService: TrackingService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post('events')
  @ApiOperation({ summary: '추적 이벤트 생성' })
  @ApiResponse({
    status: 201,
    description: '추적 이벤트가 성공적으로 생성되었습니다.',
    type: TrackingEvent,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  async createTrackingEvent(
    @Body() createDto: CreateTrackingEventDto,
    @Req() req: Request,
  ): Promise<TrackingEvent> {
    // IP 주소와 User Agent 자동 추출
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.trackingService.createTrackingEvent({
      ...createDto,
      ipAddress: createDto.ipAddress || ipAddress,
      userAgent: createDto.userAgent || userAgent,
    });
  }

  @Get('events')
  @ApiOperation({ summary: '추적 이벤트 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '추적 이벤트 목록이 성공적으로 조회되었습니다.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/TrackingEvent' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수' })
  @ApiQuery({ name: 'productId', required: false, description: '상품 ID 필터' })
  @ApiQuery({ name: 'contactId', required: false, description: '연락처 ID 필터' })
  @ApiQuery({ name: 'eventType', required: false, description: '이벤트 타입 필터' })
  @ApiQuery({ name: 'startDate', required: false, description: '시작 날짜' })
  @ApiQuery({ name: 'endDate', required: false, description: '종료 날짜' })
  async findAll(@Query() queryDto: QueryTrackingEventDto) {
    return this.trackingService.findAll(queryDto);
  }

  @Get('stats')
  @ApiOperation({ summary: '추적 통계 조회' })
  @ApiResponse({
    status: 200,
    description: '추적 통계가 성공적으로 조회되었습니다.',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: '전체 이벤트 수' },
        clicks: { type: 'number', description: '클릭 이벤트 수' },
        reads: { type: 'number', description: '읽음 이벤트 수' },
        delivered: { type: 'number', description: '전달 이벤트 수' },
        recent24h: { type: 'number', description: '최근 24시간 이벤트 수' },
      },
    },
  })
  async getTrackingStats() {
    return this.trackingService.getTrackingStats();
  }

  @Get('click/:trackingCode')
  @ApiOperation({ summary: '클릭 추적 및 리다이렉트' })
  @ApiParam({ name: 'trackingCode', description: '추적 코드' })
  @ApiResponse({ status: 302, description: '상품 페이지로 리다이렉트' })
  @ApiResponse({ status: 400, description: '유효하지 않은 추적 코드' })
  async handleClick(
    @Param('trackingCode') trackingCode: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      const result = await this.trackingService.handleClick(
        trackingCode,
        ipAddress,
        userAgent,
      );

      if (!result) {
        return res.status(404).send('추적 코드를 찾을 수 없습니다.');
      }

      // 상품 페이지로 리다이렉트
      return res.redirect(302, result.redirectUrl);
    } catch (error) {
      return res.status(400).send('유효하지 않은 추적 코드입니다.');
    }
  }

  @Post('webhooks/kakao/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '카카오톡 읽음 콜백 처리' })
  @ApiResponse({ status: 200, description: '콜백이 성공적으로 처리되었습니다.' })
  async handleKakaoReadCallback(@Body() body: any) {
    try {
      // 카카오톡 콜백 데이터 파싱
      const { messageId, status, timestamp, trackingCode } = body;

      if (!trackingCode) {
        return { success: false, message: '추적 코드가 없습니다.' };
      }

      await this.trackingService.handleReadCallback({
        trackingCode,
        messageId,
        status,
        timestamp,
      });

      return { success: true, message: '읽음 이벤트가 처리되었습니다.' };
    } catch (error) {
      return { success: false, message: '콜백 처리에 실패했습니다.' };
    }
  }

  // Analytics 엔드포인트들
  @Get('analytics/dashboard')
  @ApiOperation({ summary: '대시보드 통계 조회' })
  @ApiResponse({
    status: 200,
    description: '대시보드 통계가 성공적으로 조회되었습니다.',
  })
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('analytics/products/:productId')
  @ApiOperation({ summary: '상품별 분석 데이터 조회' })
  @ApiParam({ name: 'productId', description: '상품 ID' })
  @ApiResponse({
    status: 200,
    description: '상품 분석 데이터가 성공적으로 조회되었습니다.',
  })
  async getProductAnalytics(@Param('productId') productId: string) {
    return this.analyticsService.getProductAnalytics(productId);
  }

  @Get('analytics/time-range')
  @ApiOperation({ summary: '기간별 통계 조회' })
  @ApiQuery({ name: 'startDate', description: '시작 날짜 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', description: '종료 날짜 (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: '기간별 통계가 성공적으로 조회되었습니다.',
  })
  async getTimeRangeStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.analyticsService.getTimeRangeStats(start, end);
  }

  @Get('analytics/hourly/:date')
  @ApiOperation({ summary: '시간별 통계 조회' })
  @ApiParam({ name: 'date', description: '날짜 (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: '시간별 통계가 성공적으로 조회되었습니다.',
  })
  async getHourlyStats(@Param('date') date: string) {
    const targetDate = new Date(date);
    return this.analyticsService.getHourlyStats(targetDate);
  }
}