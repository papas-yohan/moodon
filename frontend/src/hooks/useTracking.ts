import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrackingService } from '../services/tracking.service';
import { CreateTrackingEventDto, QueryTrackingEventDto } from '../types/tracking';
import toast from 'react-hot-toast';

// Query Keys
export const trackingKeys = {
  all: ['tracking'] as const,
  events: () => [...trackingKeys.all, 'events'] as const,
  eventsList: (params?: QueryTrackingEventDto) => [...trackingKeys.events(), 'list', params] as const,
  stats: () => [...trackingKeys.all, 'stats'] as const,
  dashboard: () => [...trackingKeys.all, 'dashboard'] as const,
  productAnalytics: (productId: string) => [...trackingKeys.all, 'product', productId] as const,
  timeRange: (startDate: string, endDate: string) => [...trackingKeys.all, 'timeRange', startDate, endDate] as const,
  hourly: (date: string) => [...trackingKeys.all, 'hourly', date] as const,
};

// 추적 이벤트 목록 조회
export const useTrackingEvents = (params?: QueryTrackingEventDto) => {
  return useQuery({
    queryKey: trackingKeys.eventsList(params),
    queryFn: () => TrackingService.getEvents(params),
    staleTime: 30000, // 30초
  });
};

// 추적 통계 조회
export const useTrackingStats = () => {
  return useQuery({
    queryKey: trackingKeys.stats(),
    queryFn: () => TrackingService.getStats(),
    staleTime: 60000, // 1분
    refetchInterval: 60000, // 1분마다 자동 갱신
  });
};

// 대시보드 통계 조회
export const useDashboardStats = () => {
  return useQuery({
    queryKey: trackingKeys.dashboard(),
    queryFn: () => TrackingService.getDashboardStats(),
    staleTime: 60000, // 1분
    refetchInterval: 300000, // 5분마다 자동 갱신
  });
};

// 상품별 분석 데이터 조회
export const useProductAnalytics = (productId: string) => {
  return useQuery({
    queryKey: trackingKeys.productAnalytics(productId),
    queryFn: () => TrackingService.getProductAnalytics(productId),
    enabled: !!productId,
    staleTime: 300000, // 5분
  });
};

// 기간별 통계 조회
export const useTimeRangeStats = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: trackingKeys.timeRange(startDate, endDate),
    queryFn: () => TrackingService.getTimeRangeStats(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 300000, // 5분
  });
};

// 시간별 통계 조회
export const useHourlyStats = (date: string) => {
  return useQuery({
    queryKey: trackingKeys.hourly(date),
    queryFn: () => TrackingService.getHourlyStats(date),
    enabled: !!date,
    staleTime: 300000, // 5분
  });
};

// 추적 이벤트 생성
export const useCreateTrackingEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTrackingEventDto) => TrackingService.createEvent(data),
    onSuccess: () => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: trackingKeys.all });
      toast.success('추적 이벤트가 생성되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '추적 이벤트 생성에 실패했습니다.');
    },
  });
};