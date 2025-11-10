import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface ProductAnalytics {
  productId: string;
  productName: string;
  totalSent: number;
  totalRead: number;
  totalClicks: number;
  readRate: number;
  clickRate: number;
  clickThroughRate: number; // 읽음 대비 클릭률
}

export interface DashboardStats {
  overview: {
    totalProducts: number;
    totalContacts: number;
    totalSent: number;
    totalRead: number;
    totalClicks: number;
    avgReadRate: number;
    avgClickRate: number;
  };
  topProducts: ProductAnalytics[];
  recentEvents: any[];
  dailyStats: Array<{
    date: string;
    sent: number;
    read: number;
    clicks: number;
  }>;
}

export interface TimeRangeStats {
  period: string;
  totalEvents: number;
  clickEvents: number;
  readEvents: number;
  deliveredEvents: number;
  uniqueContacts: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    eventCount: number;
  }>;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getProductAnalytics(productId: string): Promise<ProductAnalytics> {
    try {
      // 상품 정보 조회
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, sendCount: true, readCount: true, clickCount: true },
      });

      if (!product) {
        throw new BadRequestException('상품을 찾을 수 없습니다.');
      }

      // 추적 이벤트 통계
      const [readEvents, clickEvents] = await Promise.all([
        this.prisma.trackingEvent.count({
          where: { productId, eventType: 'READ' },
        }),
        this.prisma.trackingEvent.count({
          where: { productId, eventType: 'CLICK' },
        }),
      ]);

      const totalSent = product.sendCount;
      const totalRead = readEvents;
      const totalClicks = clickEvents;

      const readRate = totalSent > 0 ? (totalRead / totalSent) * 100 : 0;
      const clickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;
      const clickThroughRate = totalRead > 0 ? (totalClicks / totalRead) * 100 : 0;

      return {
        productId: product.id,
        productName: product.name,
        totalSent,
        totalRead,
        totalClicks,
        readRate: Math.round(readRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
        clickThroughRate: Math.round(clickThroughRate * 100) / 100,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('상품 분석 데이터 조회에 실패했습니다.');
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // 기본 통계
      const [
        totalProducts,
        totalContacts,
        totalSentLogs,
        totalReadEvents,
        totalClickEvents,
      ] = await Promise.all([
        this.prisma.product.count(),
        this.prisma.contact.count({ where: { isActive: true } }),
        this.prisma.sendLog.count({ where: { status: 'SUCCESS' } }),
        this.prisma.trackingEvent.count({ where: { eventType: 'READ' } }),
        this.prisma.trackingEvent.count({ where: { eventType: 'CLICK' } }),
      ]);

      const avgReadRate = totalSentLogs > 0 ? (totalReadEvents / totalSentLogs) * 100 : 0;
      const avgClickRate = totalSentLogs > 0 ? (totalClickEvents / totalSentLogs) * 100 : 0;

      // 상위 상품 (클릭 수 기준)
      const topProductsData = await this.prisma.trackingEvent.groupBy({
        by: ['productId'],
        where: { eventType: 'CLICK' },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      });

      const topProducts: ProductAnalytics[] = [];
      for (const item of topProductsData) {
        const analytics = await this.getProductAnalytics(item.productId);
        topProducts.push(analytics);
      }

      // 최근 이벤트
      const recentEvents = await this.prisma.trackingEvent.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true } },
          contact: { select: { name: true, phone: true } },
        },
      });

      // 일별 통계 (최근 7일)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const dailyStats = await this.getDailyStats(sevenDaysAgo, new Date());

      return {
        overview: {
          totalProducts,
          totalContacts,
          totalSent: totalSentLogs,
          totalRead: totalReadEvents,
          totalClicks: totalClickEvents,
          avgReadRate: Math.round(avgReadRate * 100) / 100,
          avgClickRate: Math.round(avgClickRate * 100) / 100,
        },
        topProducts,
        recentEvents,
        dailyStats,
      };
    } catch (error) {
      throw new BadRequestException('대시보드 통계 조회에 실패했습니다.');
    }
  }

  async getTimeRangeStats(
    startDate: Date,
    endDate: Date,
  ): Promise<TimeRangeStats> {
    try {
      const whereClause = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      // 기간별 이벤트 통계
      const [
        totalEvents,
        clickEvents,
        readEvents,
        deliveredEvents,
        uniqueContacts,
      ] = await Promise.all([
        this.prisma.trackingEvent.count({ where: whereClause }),
        this.prisma.trackingEvent.count({
          where: { ...whereClause, eventType: 'CLICK' },
        }),
        this.prisma.trackingEvent.count({
          where: { ...whereClause, eventType: 'READ' },
        }),
        this.prisma.trackingEvent.count({
          where: { ...whereClause, eventType: 'DELIVERED' },
        }),
        this.prisma.trackingEvent.findMany({
          where: whereClause,
          select: { contactId: true },
          distinct: ['contactId'],
        }).then(results => results.filter(r => r.contactId).length),
      ]);

      // 상위 상품
      const topProductsData = await this.prisma.trackingEvent.groupBy({
        by: ['productId'],
        where: whereClause,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      });

      const topProducts = [];
      for (const item of topProductsData) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });
        
        topProducts.push({
          productId: item.productId,
          productName: product?.name || '알 수 없는 상품',
          eventCount: item._count.id,
        });
      }

      const period = `${startDate.toISOString().split('T')[0]} ~ ${endDate.toISOString().split('T')[0]}`;

      return {
        period,
        totalEvents,
        clickEvents,
        readEvents,
        deliveredEvents,
        uniqueContacts,
        topProducts,
      };
    } catch (error) {
      throw new BadRequestException('기간별 통계 조회에 실패했습니다.');
    }
  }

  private async getDailyStats(startDate: Date, endDate: Date) {
    const dailyStats = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const whereClause = {
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      };

      const [sent, read, clicks] = await Promise.all([
        this.prisma.sendLog.count({
          where: {
            ...whereClause,
            status: 'SUCCESS',
          },
        }),
        this.prisma.trackingEvent.count({
          where: { ...whereClause, eventType: 'READ' },
        }),
        this.prisma.trackingEvent.count({
          where: { ...whereClause, eventType: 'CLICK' },
        }),
      ]);

      dailyStats.push({
        date: currentDate.toISOString().split('T')[0],
        sent,
        read,
        clicks,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dailyStats;
  }

  async getHourlyStats(date: Date) {
    const hourlyStats = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(date);
      hourStart.setHours(hour, 0, 0, 0);
      
      const hourEnd = new Date(date);
      hourEnd.setHours(hour, 59, 59, 999);

      const whereClause = {
        createdAt: {
          gte: hourStart,
          lte: hourEnd,
        },
      };

      const [clicks, reads] = await Promise.all([
        this.prisma.trackingEvent.count({
          where: { ...whereClause, eventType: 'CLICK' },
        }),
        this.prisma.trackingEvent.count({
          where: { ...whereClause, eventType: 'READ' },
        }),
      ]);

      hourlyStats.push({
        hour,
        clicks,
        reads,
      });
    }

    return hourlyStats;
  }
}