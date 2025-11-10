/**
 * 입력 검증 유틸리티
 */

/**
 * 이메일 검증
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 전화번호 검증 (한국)
 */
export const isValidPhone = (phone: string): boolean => {
  // 하이픈 제거
  const cleaned = phone.replace(/-/g, '');
  
  // 010, 011, 016, 017, 018, 019로 시작하는 10-11자리
  const phoneRegex = /^01[0-9]{8,9}$/;
  return phoneRegex.test(cleaned);
};

/**
 * 전화번호 포맷팅
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  
  return phone;
};

/**
 * URL 검증
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 가격 검증 (양수)
 */
export const isValidPrice = (price: number): boolean => {
  return typeof price === 'number' && price >= 0 && !isNaN(price);
};

/**
 * 파일 크기 검증
 */
export const isValidFileSize = (file: File, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * 이미지 파일 타입 검증
 */
export const isValidImageType = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

/**
 * XSS 방지: HTML 이스케이프
 */
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * SQL Injection 방지: 특수문자 제거
 */
export const sanitizeInput = (input: string): string => {
  // 위험한 문자 제거
  return input.replace(/[<>'"`;()]/g, '');
};

/**
 * 숫자만 추출
 */
export const extractNumbers = (text: string): string => {
  return text.replace(/\D/g, '');
};

/**
 * 한글만 추출
 */
export const extractKorean = (text: string): string => {
  return text.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣\s]/g, '');
};

/**
 * 영문+숫자만 추출
 */
export const extractAlphanumeric = (text: string): string => {
  return text.replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * 비밀번호 강도 체크
 */
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string;
} => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  const feedback = 
    score <= 2 ? '약함' :
    score <= 4 ? '보통' :
    '강함';
  
  return { score, feedback };
};

/**
 * 날짜 검증
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * 미래 날짜 검증
 */
export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date > new Date();
};

/**
 * 과거 날짜 검증
 */
export const isPastDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date < new Date();
};

/**
 * 파일 확장자 검증
 */
export const hasValidExtension = (filename: string, allowedExtensions: string[]): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
};

/**
 * 카카오 ID 검증
 */
export const isValidKakaoId = (kakaoId: string): boolean => {
  // 영문, 숫자, 언더스코어만 허용, 4-20자
  const kakaoIdRegex = /^[a-zA-Z0-9_]{4,20}$/;
  return kakaoIdRegex.test(kakaoId);
};

/**
 * 그룹명 검증
 */
export const isValidGroupName = (groupName: string): boolean => {
  // 한글, 영문, 숫자, 공백 허용, 1-50자
  return groupName.length >= 1 && groupName.length <= 50;
};

/**
 * 상품명 검증
 */
export const isValidProductName = (name: string): boolean => {
  return name.length >= 1 && name.length <= 200;
};

/**
 * 카테고리 검증
 */
export const isValidCategory = (category: string): boolean => {
  const validCategories = ['의류', '액세서리', '신발', '가방', '화장품', '기타'];
  return validCategories.includes(category);
};