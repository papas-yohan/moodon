import toast from 'react-hot-toast';

/**
 * API 에러 타입
 */
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
  details?: any;
}

/**
 * 에러 메시지 추출
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    if (apiError.message) {
      return apiError.message;
    }
  }

  return '알 수 없는 오류가 발생했습니다.';
};

/**
 * HTTP 상태 코드별 메시지
 */
const getStatusMessage = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return '잘못된 요청입니다.';
    case 401:
      return '인증이 필요합니다. 다시 로그인해주세요.';
    case 403:
      return '접근 권한이 없습니다.';
    case 404:
      return '요청한 리소스를 찾을 수 없습니다.';
    case 409:
      return '이미 존재하는 데이터입니다.';
    case 422:
      return '입력 데이터가 올바르지 않습니다.';
    case 429:
      return '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';
    case 500:
      return '서버 오류가 발생했습니다.';
    case 502:
      return '게이트웨이 오류가 발생했습니다.';
    case 503:
      return '서비스를 일시적으로 사용할 수 없습니다.';
    default:
      return '오류가 발생했습니다.';
  }
};

/**
 * 에러 토스트 표시
 */
export const showErrorToast = (error: unknown, customMessage?: string) => {
  const message = customMessage || getErrorMessage(error);
  
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
  });
};

/**
 * 성공 토스트 표시
 */
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  });
};

/**
 * API 에러 핸들러
 */
export const handleApiError = async (response: Response): Promise<never> => {
  let errorData: ApiError;

  try {
    errorData = await response.json();
  } catch {
    errorData = {
      message: getStatusMessage(response.status),
      statusCode: response.status,
    };
  }

  const error = new Error(errorData.message || getStatusMessage(response.status));
  (error as any).statusCode = response.status;
  (error as any).details = errorData.details;

  throw error;
};

/**
 * Fetch 래퍼 (에러 처리 포함)
 */
export const fetchWithErrorHandling = async (
  url: string,
  options?: RequestInit
): Promise<Response> => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      await handleApiError(response);
    }

    return response;
  } catch (error) {
    // 네트워크 오류
    if (error instanceof TypeError) {
      throw new Error('네트워크 연결을 확인해주세요.');
    }

    throw error;
  }
};

/**
 * 에러 로깅 (프로덕션 환경에서 외부 서비스로 전송)
 */
export const logError = (error: Error, context?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', error, context);
  } else {
    // 프로덕션: Sentry, LogRocket 등으로 전송
    // Sentry.captureException(error, { extra: context });
  }
};

/**
 * 재시도 로직
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError!;
};

/**
 * 유효성 검사 에러 포맷팅
 */
export const formatValidationErrors = (errors: Record<string, string[]>): string => {
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('\n');
};

/**
 * 에러 타입 체크
 */
export const isNetworkError = (error: unknown): boolean => {
  return error instanceof TypeError && error.message.includes('fetch');
};

export const isAuthError = (error: unknown): boolean => {
  return (error as any)?.statusCode === 401;
};

export const isValidationError = (error: unknown): boolean => {
  return (error as any)?.statusCode === 422;
};