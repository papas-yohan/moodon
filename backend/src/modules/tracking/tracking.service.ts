import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TrackingCodeService } from './tracking-code.service';
import { CreateTrackingEventDto, QueryTrackingEventDto } from './dto';
import { TrackingEvent } from './entities';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    private prisma: PrismaService,
    private trackingCode: TrackingCodeService,
  ) {}

  async createTrackingEvent(createDto: CreateTrackingEventDto): Promise<TrackingEvent> {
    try {
      // 상품 존재 확인
      const product = await this.prisma.product.findUnique({
        where: { id: createDto.productId },
      });

      if (!product) {
        throw new NotFoundException('상품을 찾을 수 없습니다.');
      }

      // 추적 이벤트 생성
      const trackingEvent = await this.prisma.trackingEvent.create({
        data: {
          productId: createDto.productId,
          contactId: createDto.contactId,
          sendLogId: createDto.sendLogId,
          eventType: createDto.eventType,
          trackingCode: createDto.trackingCode,
          ipAddress: createDto.ipAddress,
          userAgent: createDto.userAgent,
          metadata: createDto.metadata,
        },
      });

      // 상품 카운터 업데이트
      await this.updateProductCounters(createDto.productId, createDto.eventType);

      this.logger.log(`Tracking event created: ${trackingEvent.id} (${createDto.eventType})`);

      return trackingEvent as TrackingEvent;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('추적 이벤트 생성에 실패했습니다.');
    }
  }

  async findAll(queryDto: QueryTrackingEventDto) {
    const { 
      page = 1, 
      limit = 20, 
      productId, 
      contactId, 
      eventType, 
      startDate, 
      endDate, 
      sort = 'createdAt:desc' 
    } = queryDto;
    const skip = (page - 1) * limit;

    // 정렬 파싱
    const [sortField, sortOrder] = sort.split(':');
    const orderBy = { [sortField]: sortOrder || 'desc' };

    // 검색 조건 구성
    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    try {
      const [events, total] = await Promise.all([
        this.prisma.trackingEvent.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            product: {
              select: { id: true, name: true },
            },
            contact: {
              select: { id: true, name: true, phone: true },
            },
          },
        }),
        this.prisma.trackingEvent.count({ where }),
      ]);

      return {
        data: events as TrackingEvent[],
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException('추적 이벤트 목록 조회에 실패했습니다.');
    }
  }

  async handleClick(trackingCode: string, ipAddress?: string, userAgent?: string) {
    try {
      // 추적 코드 유효성 검사
      const codeValidation = this.trackingCode.parseTrackingCode(trackingCode);
      if (!codeValidation.isValid) {
        throw new BadRequestException('유효하지 않은 추적 코드입니다.');
      }

      // 기존 추적 이벤트 조회 (중복 클릭 방지)
      const existingEvent = await this.prisma.trackingEvent.findFirst({
        where: {
          trackingCode,
          eventType: 'CLICK',
        },
      });

      let trackingEvent;
      if (!existingEvent) {
        // 추적 코드로 관련 정보 조회
        const relatedEvent = await this.prisma.trackingEvent.findFirst({
          where: { trackingCode },
          include: { product: true },
        });

        if (!relatedEvent) {
          // 추적 코드만으로는 상품을 찾을 수 없는 경우, 기본 처리
          this.logger.warn(`No related event found for tracking code: ${trackingCode}`);
          return null;
        }

        // 메타데이터 생성
        const metadata = this.trackingCode.generateMetadata(userAgent, ipAddress);

        // 클릭 이벤트 생성
        trackingEvent = await this.createTrackingEvent({
          productId: relatedEvent.productId,
          contactId: relatedEvent.contactId,
          sendLogId: relatedEvent.sendLogId,
          eventType: 'CLICK',
          trackingCode,
          ipAddress,
          userAgent,
          metadata,
        });
      } else {
        trackingEvent = existingEvent;
      }

      // 상품 정보 조회
      const product = await this.prisma.product.findUnique({
        where: { id: trackingEvent.productId },
      });

      if (!product) {
        throw new NotFoundException('상품을 찾을 수 없습니다.');
      }

      // 리다이렉트 URL 생성
      const redirectUrl = this.trackingCode.generateMarketingUrl(
        product.id,
        product.marketLink,
      );

      return {
        trackingEvent,
        redirectUrl,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
        },
      };
    } catch (error) {
      this.logger.error(`Click tracking failed for code: ${trackingCode}`, error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('클릭 추적 처리에 실패했습니다.');
    }
  }

  async handleReadCallback(data: {
    trackingCode: string;
    messageId?: string;
    status?: string;
    timestamp?: string;
  }) {
    try {
      // 추적 코드 유효성 검사
      const codeValidation = this.trackingCode.parseTrackingCode(data.trackingCode);
      if (!codeValidation.isValid) {
        this.logger.warn(`Invalid tracking code in read callback: ${data.trackingCode}`);
        return;
      }

      // 기존 읽음 이벤트 확인 (중복 방지)
      const existingEvent = await this.prisma.trackingEvent.findFirst({
        where: {
          trackingCode: data.trackingCode,
          eventType: 'READ',
        },
      });

      if (existingEvent) {
        this.logger.log(`Read event already exists for tracking code: ${data.trackingCode}`);
        return existingEvent;
      }

      // 관련 이벤트 조회
      const relatedEvent = await this.prisma.trackingEvent.findFirst({
        where: { trackingCode: data.trackingCode },
      });

      if (!relatedEvent) {
        this.logger.warn(`No related event found for tracking code: ${data.trackingCode}`);
        return;
      }

      // 읽음 이벤트 생성
      const metadata = JSON.stringify({
        messageId: data.messageId,
        status: data.status,
        timestamp: data.timestamp,
        source: 'kakao_callback',
      });

      const readEvent = await this.createTrackingEvent({
        productId: relatedEvent.productId,
        contactId: relatedEvent.contactId,
        sendLogId: relatedEvent.sendLogId,
        eventType: 'READ',
        trackingCode: data.trackingCode,
        metadata,
      });

      this.logger.log(`Read event created from callback: ${readEvent.id}`);
      return readEvent;
    } catch (error) {
      this.logger.error('Read callback processing failed', error);
      throw error;
    }
  }

  async getTrackingStats() {
    try {
      const [totalEvents, clickEvents, readEvents, deliveredEvents] = await Promise.all([
        this.prisma.trackingEvent.count(),
        this.prisma.trackingEvent.count({ where: { eventType: 'CLICK' } }),
        this.prisma.trackingEvent.count({ where: { eventType: 'READ' } }),
        this.prisma.trackingEvent.count({ where: { eventType: 'DELIVERED' } }),
      ]);

      // 최근 24시간 이벤트
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const recentEvents = await this.prisma.trackingEvent.count({
        where: {
          createdAt: { gte: yesterday },
        },
      });

      return {
        total: totalEvents,
        clicks: clickEvents,
        reads: readEvents,
        delivered: deliveredEvents,
        recent24h: recentEvents,
      };
    } catch (error) {
      throw new BadRequestException('추적 통계 조회에 실패했습니다.');
    }
  }

  private async updateProductCounters(productId: string, eventType: string) {
    try {
      const updateData: any = {};

      switch (eventType) {
        case 'READ':
          updateData.readCount = { increment: 1 };
          break;
        case 'CLICK':
          updateData.clickCount = { increment: 1 };
          break;
        default:
          return; // 다른 이벤트 타입은 카운터 업데이트 안함
      }

      await this.prisma.product.update({
        where: { id: productId },
        data: updateData,
      });
    } catch (error) {
      this.logger.error(`Failed to update product counters for ${productId}`, error);
      // 카운터 업데이트 실패는 전체 프로세스를 중단시키지 않음
    }
  }
}