import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ComposeImageParams {
  productId: string;
  templateType?: 'grid' | 'highlight' | 'simple';
}

interface ComposeJobResponse {
  id: string;
  productId: string;
  status: string;
  templateType: string;
  resultUrl?: string;
  createdAt: string;
}

const composeImage = async (params: ComposeImageParams): Promise<ComposeJobResponse> => {
  const response = await fetch(`/api/v1/composer/products/${params.productId}/compose`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      templateType: params.templateType || 'grid',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '이미지 합성에 실패했습니다.');
  }

  return response.json();
};

export const useComposeImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: composeImage,
    onSuccess: (data) => {
      toast.success('이미지 합성이 시작되었습니다.');
      // 상품 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // 합성 완료 확인 (폴링)
      const checkStatus = setInterval(async () => {
        try {
          const response = await fetch(`/api/v1/composer/jobs/${data.id}`);
          const job = await response.json();
          
          if (job.status === 'completed') {
            clearInterval(checkStatus);
            toast.success('이미지 합성이 완료되었습니다!');
            queryClient.invalidateQueries({ queryKey: ['products'] });
          } else if (job.status === 'failed') {
            clearInterval(checkStatus);
            toast.error('이미지 합성에 실패했습니다.');
          }
        } catch (error) {
          clearInterval(checkStatus);
          console.error('합성 상태 확인 실패:', error);
        }
      }, 2000); // 2초마다 확인

      // 30초 후 자동 중지
      setTimeout(() => clearInterval(checkStatus), 30000);
    },
    onError: (error: Error) => {
      toast.error(error.message || '이미지 합성에 실패했습니다.');
    },
  });
};
