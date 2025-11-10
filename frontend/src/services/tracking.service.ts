import api from './api';
import { 
  TrackingEvent, 
  TrackingStats, 
  DashboardStats, 
  ProductAnalytics,
  TimeRangeStats,
  HourlyStats,
  CreateTrackingEventDto,
  QueryTrackingEventDto 
} from '../types/tracking';

export class TrackingService {
  // 추적 이벤트 생성
  static async createEvent(data: CreateTrackingEventDto): Promise<TrackingEvent> {
    const response = await api.post('/tracking/events', data);
    return response.data;
  }

  // 추적 이벤트 목록 조회
  static async getEvents(params?: QueryTrackingEventDto): Promise<{
    data: TrackingEvent[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/tracking/events', { params });
    return response.data;
  }

  // 추적 통계 조회
  static async getStats(): Promise<TrackingStats> {
    const response = await api.get('/tracking/stats');
    return response.data;
  }

  // 대시보드 통계 조회
  static async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/tracking/analytics/dashboard');
    return response.data;
  }

  // 상품별 분석 데이터 조회
  static async getProductAnalytics(productId: string): Promise<ProductAnalytics> {
    const response = await api.get(`/tracking/analytics/products/${productId}`);
    return response.data;
  }

  // 기간별 통계 조회
  static async getTimeRangeStats(startDate: string, endDate: string): Promise<TimeRangeStats> {
    const response = await api.get('/tracking/analytics/time-range', {
      params: { startDate, endDate }
    });
    return response.data;
  }

  // 시간별 통계 조회
  static async getHourlyStats(date: string): Promise<HourlyStats[]> {
    const response = await api.get(`/tracking/analytics/hourly/${date}`);
    return response.data;
  }
}