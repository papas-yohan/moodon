/**
 * 클라이언트 사이드 Rate Limiting
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }) {
    this.config = config;
  }

  /**
   * 요청 허용 여부 확인
   */
  public canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // 윈도우 밖의 요청 제거
    const validRequests = requests.filter(
      (timestamp) => now - timestamp < this.config.windowMs
    );

    if (validRequests.length >= this.config.maxRequests) {
      return false;
    }

    // 새 요청 추가
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return true;
  }

  /**
   * 다음 요청까지 대기 시간 (ms)
   */
  public getWaitTime(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;

    const oldestRequest = Math.min(...requests);
    const waitTime = this.config.windowMs - (Date.now() - oldestRequest);

    return Math.max(0, waitTime);
  }

  /**
   * 특정 키의 요청 기록 초기화
   */
  public reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * 모든 요청 기록 초기화
   */
  public resetAll(): void {
    this.requests.clear();
  }
}

// 전역 Rate Limiter 인스턴스
export const globalRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000, // 1분
});

// API별 Rate Limiter
export const apiRateLimiters = {
  // 이미지 업로드: 분당 5회
  imageUpload: new RateLimiter({ maxRequests: 5, windowMs: 60000 }),
  
  // 메시지 발송: 분당 10회
  messageSend: new RateLimiter({ maxRequests: 10, windowMs: 60000 }),
  
  // 검색: 초당 5회
  search: new RateLimiter({ maxRequests: 5, windowMs: 1000 }),
  
  // 일반 API: 분당 60회
  general: new RateLimiter({ maxRequests: 60, windowMs: 60000 }),
};

/**
 * Debounce 함수
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle 함수
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Rate Limit 데코레이터
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  func: T,
  limiter: RateLimiter,
  key: string
): T {
  return (async (...args: Parameters<T>) => {
    if (!limiter.canMakeRequest(key)) {
      const waitTime = limiter.getWaitTime(key);
      throw new Error(
        `요청 제한을 초과했습니다. ${Math.ceil(waitTime / 1000)}초 후 다시 시도해주세요.`
      );
    }

    return func(...args);
  }) as T;
}