import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Always use Railway backend URL (environment variables not working in Vercel)
const API_BASE_URL = 'https://backend-production-c41fe.up.railway.app/api/v1/messaging';

// 발송 작업 생성 DTO
export interface CreateSendJobDto {
  productIds: string[];
  contactIds: string[];
  channel: 'SMS' | 'KAKAO' | 'BOTH';
  customMessage?: string;
  scheduledAt?: string;
}

// 발송 작업 응답
export interface SendJob {
  id: string;
  productIds: string;
  channel: string;
  recipientCount: number;
  successCount: number;
  failCount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

// API 함수들
const messagingApi = {
  // 발송 작업 생성
  createSendJob: async (data: CreateSendJobDto): Promise<SendJob> => {
    const response = await fetch(`${API_BASE_URL}/send-jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '발송 작업 생성에 실패했습니다.');
    }

    return response.json();
  },

  // 발송 작업 목록 조회
  getSendJobs: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    channel?: string;
  }) => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/send-jobs?${searchParams}`);
    if (!response.ok) {
      throw new Error('발송 작업 목록을 불러오는데 실패했습니다.');
    }
    return response.json();
  },

  // 발송 작업 상세 조회
  getSendJob: async (id: string): Promise<SendJob> => {
    const response = await fetch(`${API_BASE_URL}/send-jobs/${id}`);
    if (!response.ok) {
      throw new Error('발송 작업 정보를 불러오는데 실패했습니다.');
    }
    return response.json();
  },

  // 발송 통계 조회
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/send-jobs/stats`);
    if (!response.ok) {
      throw new Error('발송 통계를 불러오는데 실패했습니다.');
    }
    return response.json();
  },

  // 발송 로그 조회
  getSendLogs: async (sendJobId: string, params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/send-jobs/${sendJobId}/logs?${searchParams}`);
    if (!response.ok) {
      throw new Error('발송 로그를 불러오는데 실패했습니다.');
    }
    return response.json();
  },
};

// 커스텀 훅들
export const useMessaging = () => {
  const queryClient = useQueryClient();

  // 발송 작업 생성
  const createSendJob = useMutation({
    mutationFn: messagingApi.createSendJob,
    onSuccess: () => {
      toast.success('발송 작업이 생성되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['sendJobs'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    createSendJob,
    // API 함수들을 직접 반환 (개별 훅 사용 권장)
    api: messagingApi,
  };
};

// 개별 훅들
export const useCreateSendJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: messagingApi.createSendJob,
    onSuccess: () => {
      toast.success('발송 작업이 생성되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['sendJobs'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useSendJobs = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  channel?: string;
}) => {
  return useQuery({
    queryKey: ['sendJobs', params],
    queryFn: () => messagingApi.getSendJobs(params),
    staleTime: 30 * 1000, // 30초
  });
};

export const useSendJob = (id: string) => {
  return useQuery({
    queryKey: ['sendJobs', id],
    queryFn: () => messagingApi.getSendJob(id),
    enabled: !!id,
    refetchInterval: 5000, // 5초마다 자동 새로고침
  });
};