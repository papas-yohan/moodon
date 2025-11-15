// API 설정 - 중앙 집중식 관리
// Vercel 환경 변수가 작동하지 않으므로 Railway URL을 하드코딩

export const API_CONFIG = {
  BASE_URL: 'https://backend-production-c41fe.up.railway.app/api/v1',
  TIMEOUT: 30000, // 30초 (Railway 콜드 스타트 대응)
} as const;

// 환경별 URL (참고용)
export const getApiUrl = () => {
  // 프로덕션에서는 항상 Railway URL 사용
  if (import.meta.env.PROD) {
    return API_CONFIG.BASE_URL;
  }
  
  // 개발 환경에서는 환경 변수 또는 기본값
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
};

// 실제 사용할 API URL
export const API_BASE_URL = API_CONFIG.BASE_URL;
