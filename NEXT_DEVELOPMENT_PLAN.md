# 📋 Moodon 다음 개발 계획

**작성일**: 2025-11-12  
**현재 버전**: 1.0.0  
**목표 버전**: 1.1.0 → 2.0.0

---

## 🎯 Phase 3: 안정화 및 최적화 (1-2주)

### 우선순위 1: 즉시 수정 필요

#### 1. 테스트 페이지 상품 목록 오류 수정
**문제**: "Unexpected token '<', "<!doctype "... is not valid JSON"  
**원인**: 특정 조건에서 HTML 응답 반환  
**해결책**:
```typescript
// frontend/src/pages/TestPage.tsx
// useProducts 훅 사용 방식 수정
const { data: productsData, isLoading, error } = useProducts({
  page: 1,
  limit: 20
});
```

#### 2. Vercel 고정 도메인 설정
**문제**: 매번 새로운 URL 생성  
**해결책**:
1. Vercel Dashboard → frontend 프로젝트
2. Settings → Domains
3. Production Domain 확인 및 고정
4. Railway CORS_ORIGIN을 고정 도메인으로 변경

**예상 고정 도메인**:
```
https://frontend-yohans-projects-de3234df.vercel.app
```

#### 3. Railway 콜드 스타트 개선
**문제**: 첫 요청 시 12초 이상 소요  
**해결책**:
- Railway 유료 플랜 고려 (Always On)
- 또는 Health Check 크론잡 설정 (5분마다 핑)
- 또는 Uptime Robot 무료 모니터링 사용

```yaml
# .github/workflows/keep-alive.yml
name: Keep Railway Alive
on:
  schedule:
    - cron: '*/5 * * * *'  # 5분마다
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Railway
        run: curl https://backend-production-c41fe.up.railway.app/api/v1/health
```

### 우선순위 2: 기능 개선

#### 4. 에러 처리 개선
**현재**: 일부 에러가 사용자에게 명확하지 않음  
**개선**:
```typescript
// frontend/src/services/api.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      toast.error('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
    } else if (error.response?.status === 500) {
      toast.error('서버 오류가 발생했습니다. 관리자에게 문의해주세요.');
    }
    return Promise.reject(error);
  }
);
```

#### 5. 로딩 상태 개선
**현재**: 일부 페이지에서 로딩 표시 부족  
**개선**:
- 전역 로딩 인디케이터 추가
- Skeleton UI 개선
- 낙관적 업데이트 구현

#### 6. 성능 모니터링
**도구**: Sentry 또는 LogRocket  
**설정**:
```typescript
// frontend/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

---

## 🚀 Phase 4: 기능 확장 (1개월)

### 1. 사용자 인증 시스템
**목표**: 여러 사용자가 각자의 데이터를 관리  
**기술 스택**: JWT + Passport.js  
**구현**:
```
- 회원가입 / 로그인
- 비밀번호 재설정
- 이메일 인증
- 소셜 로그인 (Google, Kakao)
```

**데이터베이스 스키마**:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(USER)
  products  Product[]
  contacts  Contact[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

### 2. 이미지 합성 템플릿 추가
**현재**: Grid, Highlight, Simple 3개  
**추가**:
- Carousel (슬라이드 형식)
- Collage (콜라주 형식)
- Story (인스타그램 스토리 형식)
- Banner (배너 형식)

### 3. 예약 발송 기능 강화
**현재**: 기본 예약 발송  
**개선**:
- 반복 발송 (매일, 매주, 매월)
- 조건부 발송 (특정 이벤트 발생 시)
- A/B 테스트 (여러 메시지 비교)

### 4. 고급 분석 기능
**추가 지표**:
- 시간대별 분석
- 지역별 분석
- 디바이스별 분석
- 코호트 분석
- 퍼널 분석

### 5. 자동화 워크플로우
**예시**:
```
1. 신상품 등록 → 자동 이미지 합성 → 자동 발송
2. 클릭 없는 고객 → 3일 후 재발송
3. 구매 고객 → 감사 메시지 자동 발송
```

---

## 💼 Phase 5: 비즈니스 확장 (3개월)

### 1. SaaS 전환
**목표**: 여러 고객에게 서비스 제공  
**구현**:
- 멀티 테넌시 아키텍처
- 구독 플랜 (Free, Pro, Enterprise)
- 결제 시스템 (Stripe, Toss Payments)
- 사용량 제한 및 모니터링

**구독 플랜 예시**:
```
Free:
- 상품 10개
- 연락처 100개
- 월 100건 발송

Pro ($29/월):
- 상품 100개
- 연락처 1,000개
- 월 1,000건 발송

Enterprise ($99/월):
- 무제한 상품
- 무제한 연락처
- 월 10,000건 발송
```

### 2. API 공개
**목표**: 외부 개발자가 Moodon API 사용  
**구현**:
- API 키 발급 시스템
- Rate Limiting
- API 문서 (Swagger UI)
- SDK 제공 (JavaScript, Python)

### 3. 통합 기능
**연동 서비스**:
- 쇼핑몰 (Shopify, Cafe24, 스마트스토어)
- CRM (Salesforce, HubSpot)
- 마케팅 도구 (Google Analytics, Facebook Pixel)
- 결제 (Stripe, Toss)

### 4. 모바일 앱
**플랫폼**: React Native  
**기능**:
- 상품 등록 (카메라 촬영)
- 간편 발송
- 실시간 알림
- 통계 확인

---

## 🛠️ 기술 부채 해결

### 1. 코드 리팩토링
**목표**: 코드 품질 개선  
**작업**:
- 중복 코드 제거
- 타입 안정성 강화
- 컴포넌트 분리
- 테스트 커버리지 증가 (현재 69개 → 150개+)

### 2. 성능 최적화
**프론트엔드**:
- 코드 스플리팅 강화
- 이미지 최적화 (WebP, lazy loading)
- 번들 크기 감소 (현재 2.4MB → 1.5MB)
- React Query 캐싱 전략 개선

**백엔드**:
- 데이터베이스 인덱스 최적화
- N+1 쿼리 문제 해결
- Redis 캐싱 도입
- API 응답 시간 개선 (현재 200ms → 100ms)

### 3. 보안 강화
**작업**:
- SQL Injection 방어 (Prisma로 이미 방어됨)
- XSS 방어 강화
- CSRF 토큰 구현
- Rate Limiting 강화
- API 키 로테이션
- 정기 보안 감사

### 4. 인프라 개선
**작업**:
- CI/CD 파이프라인 구축 (GitHub Actions)
- 자동 테스트 실행
- 자동 배포
- 롤백 시스템
- 블루-그린 배포

---

## 📊 성공 지표 (KPI)

### Phase 3 (안정화)
- [ ] 에러율 < 1%
- [ ] API 응답 시간 < 200ms (평균)
- [ ] 페이지 로드 시간 < 2초
- [ ] 테스트 커버리지 > 80%

### Phase 4 (기능 확장)
- [ ] 월간 활성 사용자 (MAU) > 10명
- [ ] 일일 발송 건수 > 100건
- [ ] 사용자 만족도 > 4.5/5
- [ ] 기능 사용률 > 70%

### Phase 5 (비즈니스)
- [ ] 유료 사용자 > 5명
- [ ] 월 매출 > $100
- [ ] 고객 유지율 > 80%
- [ ] NPS 점수 > 50

---

## 🗓️ 타임라인

### Week 1-2: 안정화
```
Day 1-3:   테스트 페이지 오류 수정, Vercel 도메인 고정
Day 4-7:   에러 처리 개선, 로딩 상태 개선
Day 8-10:  성능 모니터링 설정, Railway 최적화
Day 11-14: 전체 통합 테스트, 버그 수정
```

### Week 3-4: 기능 개선
```
Day 15-18: 사용자 인증 시스템 구현
Day 19-21: 이미지 템플릿 추가
Day 22-25: 예약 발송 강화
Day 26-28: 고급 분석 기능
```

### Month 2: 확장
```
Week 5-6:  자동화 워크플로우
Week 7-8:  멀티 테넌시 구현
```

### Month 3: 비즈니스
```
Week 9-10:  구독 및 결제 시스템
Week 11-12: API 공개 및 문서화
```

---

## 💡 우선순위 결정 기준

### High Priority (즉시 실행)
- 사용자 경험에 직접 영향
- 시스템 안정성 관련
- 보안 이슈

### Medium Priority (1-2주 내)
- 기능 개선
- 성능 최적화
- 코드 품질

### Low Priority (1개월+)
- 새로운 기능 추가
- 비즈니스 확장
- 실험적 기능

---

## 🎯 즉시 실행할 작업 (이번 주)

### 1. Vercel 도메인 고정 (30분)
```
1. Vercel Dashboard 접속
2. frontend 프로젝트 → Settings → Domains
3. Production Domain 확인
4. Railway CORS_ORIGIN 업데이트
```

### 2. Health Check 크론잡 설정 (1시간)
```
1. GitHub Actions 워크플로우 생성
2. 5분마다 Railway 핑
3. 콜드 스타트 방지
```

### 3. 에러 로깅 설정 (2시간)
```
1. Sentry 계정 생성 (무료)
2. 프론트엔드 Sentry 설정
3. 백엔드 Sentry 설정
4. 에러 알림 설정
```

### 4. 실제 데이터 테스트 (1시간)
```
1. 상품 3개 등록
2. 이미지 합성
3. 연락처 10개 추가
4. 본인 번호로 발송 테스트
5. 통계 확인
```

---

## 📝 다음 회의 안건

1. Vercel 도메인 고정 완료 확인
2. 실제 데이터 테스트 결과 공유
3. Phase 4 기능 우선순위 논의
4. 비즈니스 모델 검토

---

**작성일**: 2025-11-12  
**다음 리뷰**: 2025-11-19  
**담당자**: 개발팀  
**상태**: 📋 계획 수립 완료
