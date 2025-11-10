# 기술 스택 가이드

> 신상마켓 상품 홍보 시스템에서 사용하는 기술 스택과 선택 이유

## 📌 개요

이 문서는 프로젝트에서 사용하는 모든 기술 스택과 그 선택 이유, 설정 방법을 정리한 것입니다.

---

## 🎯 Frontend

### 핵심 프레임워크
- **React 18** + **TypeScript**
  - 선택 이유: 컴포넌트 기반 개발, 강력한 생태계, TypeScript로 타입 안정성
  - 주요 기능: Hooks, Suspense, Concurrent Features

### 빌드 도구
- **Vite**
  - 선택 이유: 빠른 개발 서버, HMR, 최적화된 번들링
  - 대안: Create React App (느린 빌드 시간으로 제외)

### 상태 관리
- **TanStack Query** (서버 상태)
  - 선택 이유: 서버 상태 캐싱, 자동 리페칭, 낙관적 업데이트
  - 주요 기능: 캐싱, 백그라운드 업데이트, 에러 처리
- **Zustand** (클라이언트 상태)
  - 선택 이유: 간단한 API, 보일러플레이트 최소화
  - 대안: Redux Toolkit (복잡성으로 제외)

### UI 라이브러리
- **Tailwind CSS** + **shadcn/ui**
  - 선택 이유: 유틸리티 퍼스트, 커스터마이징 용이, 일관된 디자인
  - 컴포넌트: Button, Input, Modal, Table 등
- **AG Grid**
  - 선택 이유: 엑셀과 유사한 UX, 대용량 데이터 처리, 풍부한 기능
  - 주요 기능: 정렬, 필터, 페이지네이션, 셀 편집

### 테스팅
- **Vitest** (단위 테스트)
  - 선택 이유: Vite와 완벽 호환, 빠른 실행 속도
- **React Testing Library** (컴포넌트 테스트)
  - 선택 이유: 사용자 중심 테스트, 접근성 고려

---

## ⚙️ Backend

### 핵심 프레임워크
- **Node.js 20** + **TypeScript**
  - 선택 이유: JavaScript 생태계 활용, 비동기 처리 최적화
- **NestJS**
  - 선택 이유: 모듈화된 구조, 데코레이터 기반 개발, 강력한 DI
  - 주요 기능: Guards, Interceptors, Pipes, Swagger 자동 생성

### 데이터베이스
- **PostgreSQL** (개발환경: SQLite)
  - 선택 이유: ACID 준수, JSON 지원, 확장성
  - 대안: MySQL (JSON 지원 부족), MongoDB (관계형 데이터 필요)
- **Prisma ORM**
  - 선택 이유: 타입 안전성, 마이그레이션 관리, 직관적인 쿼리
  - 주요 기능: 스키마 정의, 자동 타입 생성, 관계 관리

### 작업 큐
- **Redis** + **BullMQ**
  - 선택 이유: 안정적인 작업 큐, 재시도 로직, 모니터링
  - 사용 사례: 이미지 합성, 대량 발송, 파일 처리

### 파일 처리
- **Multer** (파일 업로드)
  - 선택 이유: Express 호환, 다양한 스토리지 지원
- **Sharp** (이미지 처리)
  - 선택 이유: 빠른 성능, 다양한 포맷 지원, 메모리 효율성
  - 대안: Canvas (설치 복잡성으로 제외)
- **xlsx** + **csv-parser** (파일 파싱)
  - 선택 이유: Excel/CSV 완벽 지원, 대용량 파일 처리

### 외부 API
- **솔라피 (SOLAPI)**
  - 선택 이유: SMS/카카오톡 통합 API, 안정적인 서비스, 합리적 가격
  - 기능: SMS, LMS, MMS, 카카오톡 알림톡/친구톡

### 테스팅
- **Jest** (단위/통합 테스트)
  - 선택 이유: 풍부한 기능, 모킹 지원, 스냅샷 테스트
- **Supertest** (API 테스트)
  - 선택 이유: Express 앱 테스트 최적화

---

## 🗄 데이터베이스 설계

### 주요 테이블
- **products**: 상품 정보
- **product_images**: 상품 이미지
- **contacts**: 주소록
- **compose_jobs**: 이미지 합성 작업
- **send_jobs**: 발송 작업
- **send_logs**: 발송 로그
- **tracking_events**: 추적 이벤트

### 관계 설계
```sql
products 1:N product_images
products 1:N compose_jobs
products 1:N send_logs
contacts 1:N send_logs
send_jobs 1:N send_logs
```

---

## 💾 스토리지 전략

### 현재 구현: 로컬 스토리지
```typescript
// 설정
USE_S3=false
UPLOAD_DIR=./uploads
BASE_URL=http://localhost:3000
```

### 장점
- 구현 간단
- 비용 없음
- 빠른 접근 속도

### 단점
- 서버 용량 제한
- 백업 관리 필요
- 다중 서버 환경에서 동기화 문제

### 향후 확장 옵션
1. **구글 드라이브 API**
   - 무료 15GB
   - 자동 백업
   - 웹 인터페이스 관리

2. **AWS S3**
   - 무제한 확장성
   - CDN 연동 가능
   - 높은 가용성

---

## 🔧 개발 도구

### 코드 품질
- **ESLint** + **Prettier**
  - 선택 이유: 일관된 코드 스타일, 자동 포맷팅
- **Husky** + **lint-staged**
  - 선택 이유: 커밋 전 자동 검사

### 버전 관리
- **Git** + **GitHub**
- **Conventional Commits**
  - 선택 이유: 일관된 커밋 메시지, 자동 릴리즈 노트

### 문서화
- **Swagger/OpenAPI**
  - 선택 이유: 자동 API 문서 생성, 대화형 테스트
- **Markdown**
  - 선택 이유: 간단한 문법, GitHub 호환

---

## 🚀 배포 및 인프라

### 현재 계획
- **Frontend**: Vercel
  - 선택 이유: 자동 배포, CDN, 무료 티어
- **Backend**: VPS 또는 클라우드 서버
  - 선택 이유: 비용 효율성, 제어권
- **Database**: PostgreSQL (로컬 또는 Supabase)
- **Redis**: 로컬 또는 Upstash

### 모니터링
- **로그**: 파일 기반 (향후 Sentry 연동)
- **헬스체크**: `/api/v1/health` 엔드포인트
- **메트릭**: 기본 시스템 메트릭

---

## 📦 패키지 관리

### 주요 의존성

#### Frontend
```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "@tanstack/react-query": "^4.0.0",
  "zustand": "^4.0.0",
  "tailwindcss": "^3.0.0",
  "ag-grid-react": "^30.0.0"
}
```

#### Backend
```json
{
  "@nestjs/core": "^10.0.0",
  "prisma": "^5.0.0",
  "bullmq": "^4.0.0",
  "sharp": "^0.32.0",
  "xlsx": "^0.18.0",
  "multer": "^1.4.0"
}
```

### 버전 관리 전략
- **Semantic Versioning** 준수
- **Lock 파일** 사용 (package-lock.json, yarn.lock)
- **정기적인 업데이트** (보안 패치 우선)

---

## 🔐 보안 고려사항

### 현재 구현
- **입력 검증**: class-validator 사용
- **SQL Injection 방지**: Prisma ORM 사용
- **파일 업로드 제한**: 크기, 타입 검증
- **Rate Limiting**: @nestjs/throttler

### 향후 구현 (2단계)
- **JWT 인증**: Access + Refresh Token
- **개인정보 암호화**: 전화번호 암호화
- **HTTPS**: SSL 인증서 적용
- **CORS**: 도메인 제한

---

## 📊 성능 최적화

### Frontend
- **코드 스플리팅**: React.lazy 사용
- **이미지 최적화**: WebP 포맷, 지연 로딩
- **캐싱**: TanStack Query 캐싱 전략

### Backend
- **데이터베이스 최적화**: 인덱스 설정, 쿼리 최적화
- **이미지 처리**: Sharp 최적화 설정
- **작업 큐**: 배치 처리, 동시성 제어

---

## 🧪 테스트 전략

### 테스트 피라미드
1. **단위 테스트** (70%)
   - Service 로직 테스트
   - 유틸리티 함수 테스트

2. **통합 테스트** (20%)
   - API 엔드포인트 테스트
   - 데이터베이스 연동 테스트

3. **E2E 테스트** (10%)
   - 주요 사용자 플로우 테스트

### 현재 테스트 현황
- **총 테스트**: 68개
- **커버리지**: 높은 수준 유지
- **CI/CD**: GitHub Actions 연동

---

## 📈 확장성 고려사항

### 수평 확장
- **로드 밸런서**: Nginx 또는 클라우드 LB
- **데이터베이스**: 읽기 복제본 구성
- **캐시**: Redis 클러스터

### 수직 확장
- **서버 리소스**: CPU, 메모리 증설
- **데이터베이스**: 성능 튜닝, 인덱스 최적화

---

## 🔄 마이그레이션 전략

### 데이터베이스
- **Prisma Migrate**: 스키마 변경 관리
- **시드 데이터**: 개발/테스트 환경 초기 데이터
- **백업**: 정기적인 데이터 백업

### 애플리케이션
- **무중단 배포**: Blue-Green 또는 Rolling 배포
- **버전 관리**: API 버저닝 (v1, v2)

---

## 📚 학습 리소스

### 공식 문서
- [NestJS 공식 문서](https://docs.nestjs.com/)
- [React 공식 문서](https://react.dev/)
- [Prisma 공식 문서](https://www.prisma.io/docs)

### 추천 도서
- "Clean Architecture" - Robert C. Martin
- "Designing Data-Intensive Applications" - Martin Kleppmann

---

**업데이트**: 2025-11-05
**버전**: v1.0.0