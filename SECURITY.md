# 🔒 보안 가이드

## 📋 보안 체크리스트

### 프론트엔드 보안

#### ✅ 입력 검증
- [x] XSS 방지: HTML 이스케이프 처리
- [x] SQL Injection 방지: 특수문자 필터링
- [x] 파일 업로드 검증: 타입, 크기, 확장자 체크
- [x] URL 검증: 유효한 URL 형식 확인
- [x] 전화번호/이메일 검증: 정규식 패턴 매칭

#### ✅ 에러 처리
- [x] 에러 바운더리: React Error Boundary 구현
- [x] 전역 에러 핸들러: API 에러 통합 처리
- [x] 사용자 친화적 에러 메시지
- [x] 개발/프로덕션 환경 분리

#### ✅ Rate Limiting
- [x] 클라이언트 사이드 Rate Limiting
- [x] API별 요청 제한 설정
- [x] Debounce/Throttle 함수

#### ✅ 데이터 보호
- [ ] 민감 정보 암호화 (향후 구현)
- [ ] LocalStorage 보안 (향후 구현)
- [ ] HTTPS 강제 (프로덕션)

### 백엔드 보안

#### ✅ 인증 및 권한
- [ ] JWT 인증 (향후 구현)
- [ ] API 키 관리 (향후 구현)
- [ ] Role-based Access Control (향후 구현)

#### ✅ 데이터 검증
- [x] DTO 검증: class-validator
- [x] Prisma ORM: SQL Injection 방지
- [x] 파일 업로드 검증

#### ✅ 보안 헤더
- [x] Helmet: 보안 헤더 설정
- [x] CORS: 허용된 도메인만 접근
- [x] CSP: Content Security Policy

#### ✅ Rate Limiting
- [ ] 서버 사이드 Rate Limiting (향후 구현)
- [ ] IP 기반 제한 (향후 구현)

## 🛡️ 구현된 보안 기능

### 1. 에러 바운더리

```typescript
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**기능:**
- React 컴포넌트 에러 캐치
- 사용자 친화적 에러 UI
- 개발 환경에서 상세 에러 정보 표시
- 에러 로깅 (Sentry 연동 준비)

### 2. 입력 검증

```typescript
import { 
  isValidEmail, 
  isValidPhone, 
  escapeHtml,
  sanitizeInput 
} from '@/utils/validation';

// 이메일 검증
if (!isValidEmail(email)) {
  throw new Error('유효하지 않은 이메일입니다.');
}

// XSS 방지
const safeText = escapeHtml(userInput);

// SQL Injection 방지
const cleanInput = sanitizeInput(userInput);
```

### 3. API 에러 처리

```typescript
import { 
  handleApiError, 
  showErrorToast,
  fetchWithErrorHandling 
} from '@/utils/errorHandler';

try {
  const response = await fetchWithErrorHandling('/api/products');
  const data = await response.json();
} catch (error) {
  showErrorToast(error);
}
```

### 4. Rate Limiting

```typescript
import { apiRateLimiters } from '@/utils/rateLimit';

// 이미지 업로드 전 체크
if (!apiRateLimiters.imageUpload.canMakeRequest('user-123')) {
  const waitTime = apiRateLimiters.imageUpload.getWaitTime('user-123');
  throw new Error(`${Math.ceil(waitTime / 1000)}초 후 다시 시도해주세요.`);
}
```

### 5. 파일 업로드 보안

```typescript
import { 
  isValidFileSize, 
  isValidImageType,
  hasValidExtension 
} from '@/utils/validation';

// 파일 검증
if (!isValidFileSize(file, 10)) {
  throw new Error('파일 크기는 10MB 이하여야 합니다.');
}

if (!isValidImageType(file)) {
  throw new Error('이미지 파일만 업로드 가능합니다.');
}
```

## 🚨 보안 취약점 및 대응

### XSS (Cross-Site Scripting)

**위험:**
- 사용자 입력을 그대로 렌더링하면 악성 스크립트 실행 가능

**대응:**
```typescript
// ❌ 위험
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ 안전
<div>{escapeHtml(userInput)}</div>
```

### SQL Injection

**위험:**
- 사용자 입력이 SQL 쿼리에 직접 포함되면 DB 조작 가능

**대응:**
```typescript
// ✅ Prisma ORM 사용 (자동 이스케이프)
await prisma.product.findMany({
  where: { name: { contains: userInput } }
});
```

### CSRF (Cross-Site Request Forgery)

**위험:**
- 인증된 사용자의 권한으로 악의적인 요청 실행

**대응:**
- [ ] CSRF 토큰 구현 (향후)
- [x] SameSite 쿠키 설정
- [x] CORS 정책 적용

### 파일 업로드 공격

**위험:**
- 악성 파일 업로드로 서버 침투

**대응:**
```typescript
// 파일 타입 검증
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('허용되지 않은 파일 형식입니다.');
}

// 파일 크기 제한
const maxSize = 10 * 1024 * 1024; // 10MB
if (file.size > maxSize) {
  throw new Error('파일 크기가 너무 큽니다.');
}

// 파일명 sanitize
const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
```

## 🔐 환경 변수 보안

### 민감 정보 관리

```bash
# ❌ 절대 커밋하지 말 것
.env
.env.local
.env.production

# ✅ 예제 파일만 커밋
.env.example
```

### 환경 변수 사용

```typescript
// 프론트엔드 (VITE_ 접두사 필수)
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// 백엔드
const jwtSecret = process.env.JWT_SECRET;
```

## 📊 보안 모니터링

### 에러 로깅

```typescript
import { logError } from '@/utils/errorHandler';

try {
  // 작업 수행
} catch (error) {
  logError(error as Error, {
    userId: user.id,
    action: 'product_create',
    timestamp: new Date().toISOString(),
  });
}
```

### 프로덕션 모니터링 (향후 구현)

- [ ] Sentry: 에러 추적
- [ ] LogRocket: 세션 리플레이
- [ ] DataDog: 성능 모니터링

## 🔄 보안 업데이트 프로세스

### 의존성 보안 체크

```bash
# npm 보안 감사
npm audit

# 자동 수정
npm audit fix

# 강제 수정 (주의!)
npm audit fix --force
```

### 정기 보안 점검

- [ ] 주간: 의존성 보안 체크
- [ ] 월간: 보안 설정 리뷰
- [ ] 분기: 침투 테스트

## 🚀 프로덕션 배포 전 체크리스트

### 필수 사항
- [ ] 모든 환경 변수 설정
- [ ] HTTPS 강제 적용
- [ ] 보안 헤더 확인
- [ ] CORS 정책 검증
- [ ] Rate Limiting 활성화
- [ ] 에러 로깅 설정
- [ ] 민감 정보 제거 (API 키, 비밀번호 등)
- [ ] 디버그 모드 비활성화
- [ ] 소스맵 제거 또는 보호

### 권장 사항
- [ ] WAF (Web Application Firewall) 설정
- [ ] DDoS 방어 설정
- [ ] 백업 전략 수립
- [ ] 재해 복구 계획

## 📞 보안 이슈 보고

보안 취약점을 발견하신 경우:

1. **즉시 보고**: security@moodon.com
2. **상세 정보 제공**: 재현 방법, 영향 범위
3. **비공개 유지**: 수정 전까지 공개하지 않기

## 📚 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [NestJS Security](https://docs.nestjs.com/security/helmet)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

---

**마지막 업데이트**: 2025-11-06  
**버전**: 1.0.0