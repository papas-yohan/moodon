/**
 * 모바일 디바이스 감지
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * 터치 디바이스 감지
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

/**
 * 화면 크기 감지
 */
export const getScreenSize = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * 뷰포트 높이 계산 (모바일 주소창 고려)
 */
export const getViewportHeight = (): number => {
  if (typeof window === 'undefined') return 0;
  return window.innerHeight;
};

/**
 * 안전 영역 여백 가져오기 (노치 대응)
 */
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0'),
  };
};

/**
 * 햅틱 피드백 (지원하는 경우)
 */
export const vibrate = (pattern: number | number[] = 10): void => {
  if (typeof window === 'undefined') return;
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

/**
 * 스크롤 잠금
 */
export const lockScroll = (): void => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
};

/**
 * 스크롤 잠금 해제
 */
export const unlockScroll = (): void => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
};

/**
 * 모바일 키보드 높이 감지
 */
export const useKeyboardHeight = () => {
  if (typeof window === 'undefined') return 0;
  
  const visualViewport = window.visualViewport;
  if (!visualViewport) return 0;
  
  return window.innerHeight - visualViewport.height;
};

/**
 * 네트워크 상태 확인
 */
export const getNetworkStatus = (): {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} => {
  if (typeof navigator === 'undefined') {
    return { online: true };
  }

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
  };
};

/**
 * 배터리 상태 확인 (지원하는 경우)
 */
export const getBatteryStatus = async (): Promise<{
  level: number;
  charging: boolean;
} | null> => {
  if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
    return null;
  }

  try {
    const battery = await (navigator as any).getBattery();
    return {
      level: battery.level,
      charging: battery.charging,
    };
  } catch {
    return null;
  }
};