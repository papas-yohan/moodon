# 신상마켓 상품 홍보 시스템 - 개발 설계서

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [시스템 아키텍처](#시스템-아키텍처)
4. [데이터베이스 설계](#데이터베이스-설계)
5. [API 명세](#api-명세)
6. [주요 모듈 상세 설계](#주요-모듈-상세-설계)
7. [외부 API 연동 요구사항](#외부-api-연동-요구사항)
8. [개발 일정 및 스프린트](#개발-일정-및-스프린트)
9. [테스트 전략](#테스트-전략)
10. [배포 및 운영](#배포-및-운영)

---

## 프로젝트 개요

### 목적
상품 이미지와 정보를 AI로 자동 합성하여 마케팅 이미지를 생성하고, 
주소록 기반으로 문자/카카오톡 일괄 전송 및 마케팅 효율을 측정하는 시스템

### 핵심 가치
- **간편한 이미지 합성**: 5~6장의 상품 사진을 1장의 세련된 마케팅 이미지로 자동 변환
- **일괄 전송**: 주소록 기반 문자/카카오톡 대량 발송
- **효과 측정**: 발송/읽음/클릭 추적을 통한 마케팅 ROI 분석
- **엑셀 친화적 UX**: PC 사용자가 익숙한 엑셀 스타일 인터페이스

### 개발 원칙
- Over-Engineering 지양, 명확하고 간결한 코드
- TDD(테스트 주도 개발) 방법론 적용
- 모듈화된 구조로 2단계 SaaS 확장 대비
- 반응형 웹으로 PC/모바일 모두 지원

---

## 기술 스택

### 1단계 (MVP)

**Frontend**
- React 18 + TypeScript
- Vite (빌드 도구)
- TanStack Query (서버 상태 관리)
- Zustand (클라이언트 상태 관리)
- Tailwind CSS + shadcn/ui (UI 컴포넌트)
- React Hook Form + Zod (폼 관리 및 검증)
- AG Grid Community (엑셀 스타일 테이블)

**Backend**
- Node.js 20 + TypeScript
- NestJS (프레임워크)
- Prisma (ORM)
- BullMQ + Redis (작업 큐)
- Multer (파일 업로드)

**Database & Storage**
- PostgreSQL 15 (메인 DB)
- Redis 7 (캐시 및 큐)
- AWS S3 호환 스토리지 (이미지 저장)

**Testing**
- Jest (단위 테스트)
- Supertest (API 통합 테스트)
- React Testing Library (컴포넌트 테스트)
- Playwright (E2E 테스트)

**DevOps**
- Docker + Docker Compose (로컬 개발)
- GitHub Actions (CI/CD)

### 2단계 추가 스택
- JWT + Refresh Token (인증)
- Stripe/Toss Payments (결제)
- Redis Cluster (확장성)
- Nginx (로드 밸런싱)
- Prometheus + Grafana (모니터링)

---

## 시스템 아키텍처

### 전체 구조도
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 상품관리  │  │ 주소록   │  │ 발송관리  │  │ 분석     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
┌────────────────────────┴────────────────────────────────────┐
│                    API Gateway (NestJS)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Controllers & Guards                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────┬──────────┬──────────┬──────────┬──────────┬──────────┘
      │          │          │          │          │
┌─────▼────┐ ┌──▼────┐ ┌───▼────┐ ┌──▼─────┐ ┌─▼────────┐
│ Product  │ │Address│ │Composer│ │Messaging│ │Tracking  │
│ Service  │ │ Book  │ │Service │ │Service  │ │Service   │
│          │ │Service│ │        │ │         │ │          │
└─────┬────┘ └──┬────┘ └───┬────┘ └──┬──────┘ └─┬────────┘
      │         │          │         │          │
      └─────────┴──────────┴─────────┴──────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
         ┌────▼─────┐        ┌─────▼─────┐
         │PostgreSQL│        │   Redis   │
         │          │        │  + BullMQ │
         └──────────┘        └───────────┘
                                   │
                            ┌──────┴──────┐
                            │   Workers   │
                            │ - Composer  │
                            │ - Sender    │
                            └─────────────┘
```

### 주요 흐름

**1. 상품 등록 및 이미지 합성**
```
사용자 → 상품 폼 작성 → 이미지 업로드(5~6장) 
→ "이미지 합성" 클릭 → 합성 작업 큐 등록 
→ Worker가 AI API 호출 → 합성 이미지 생성 
→ S3 저장 → DB 업데이트 → 프론트엔드 미리보기
```

**2. 일괄 발송**
```
상품 선택(체크박스) → 주소록 선택 → 발송 채널 선택(문자/카톡)
→ 발송 작업 큐 등록 → Worker가 배치 처리 
→ 외부 API 호출(SMS/카카오) → 결과 수집 → 로그 저장
```

**3. 추적 및 분석**
```
수신자가 링크 클릭 → 추적 서버 리다이렉트 → 클릭 로그 저장 
→ 실제 상품 링크로 이동
카카오 읽음 콜백 → 읽음 로그 저장
→ 대시보드에서 집계 데이터 표시
```

---

## 데이터베이스 설계

### ERD 주요 테이블

**1단계 테이블**

```sql
-- 상품
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  size VARCHAR(100),
  color VARCHAR(100),
  market_link TEXT,
  composed_image_url TEXT,
  send_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft', -- draft, composing, ready, archived
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 상품 원본 이미지
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 주소록
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  kakao_id VARCHAR(255),
  group_name VARCHAR(100),
  tags TEXT[], -- 배열로 다중 태그 지원
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(phone)
);

-- 발송 작업
CREATE TABLE send_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_ids UUID[] NOT NULL, -- 다중 상품 지원
  channel VARCHAR(20) NOT NULL, -- sms, kakao, both
  recipient_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  fail_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 발송 로그
CREATE TABLE send_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  send_job_id UUID REFERENCES send_jobs(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  contact_id UUID REFERENCES contacts(id),
  channel VARCHAR(20) NOT NULL,
  status VARCHAR(50) NOT NULL, -- success, failed, pending
  error_code VARCHAR(100),
  error_message TEXT,
  external_message_id VARCHAR(255), -- 외부 API 메시지 ID
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 추적 이벤트
CREATE TABLE tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  contact_id UUID REFERENCES contacts(id),
  send_log_id UUID REFERENCES send_logs(id),
  event_type VARCHAR(50) NOT NULL, -- click, read, delivered
  tracking_code VARCHAR(100) UNIQUE, -- 추적용 고유 코드
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 이미지 합성 작업
CREATE TABLE compose_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  template_type VARCHAR(50) DEFAULT 'grid', -- grid, highlight, simple
  result_url TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_group ON contacts(group_name);
CREATE INDEX idx_send_logs_job_id ON send_logs(send_job_id);
CREATE INDEX idx_send_logs_contact_id ON send_logs(contact_id);
CREATE INDEX idx_tracking_events_product_id ON tracking_events(product_id);
CREATE INDEX idx_tracking_events_tracking_code ON tracking_events(tracking_code);
```

**2단계 추가 테이블**

```sql
-- 사용자 (2단계)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user', -- user, admin
  tenant_id UUID, -- 멀티 테넌시
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 구독 (2단계)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL, -- free, basic, pro, enterprise
  status VARCHAR(50) DEFAULT 'active', -- active, cancelled, expired
  monthly_send_limit INTEGER,
  monthly_send_used INTEGER DEFAULT 0,
  started_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- API 키 (2단계)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 1단계 테이블에 owner_id 추가
ALTER TABLE products ADD COLUMN owner_id UUID REFERENCES users(id);
ALTER TABLE contacts ADD COLUMN owner_id UUID REFERENCES users(id);
ALTER TABLE send_jobs ADD COLUMN owner_id UUID REFERENCES users(id);
```

---

## API 명세

### 기본 정보
- Base URL: `http://localhost:3000/api/v1` (개발)
- Content-Type: `application/json`
- 인증 (2단계): `Authorization: Bearer {token}`

### 1. 상품 관리 API

#### 1.1 상품 등록
```http
POST /products
Content-Type: multipart/form-data

{
  "name": "봄 신상 원피스",
  "price": 45000,
  "size": "Free",
  "color": "베이지",
  "marketLink": "https://example.com/product/123",
  "images": [File, File, File, File, File] // 5~6개
}

Response 201:
{
  "id": "uuid",
  "name": "봄 신상 원피스",
  "status": "draft",
  "imageUrls": ["s3://...", "s3://..."],
  "createdAt": "2025-10-28T10:00:00Z"
}
```

#### 1.2 이미지 합성 요청
```http
POST /products/:id/compose

{
  "templateType": "grid" // grid, highlight, simple
}

Response 202:
{
  "jobId": "uuid",
  "status": "pending",
  "estimatedTime": 30 // seconds
}
```

#### 1.3 합성 상태 조회
```http
GET /products/:id/compose-status

Response 200:
{
  "status": "completed", // pending, processing, completed, failed
  "composedImageUrl": "https://cdn.example.com/composed/xxx.jpg",
  "progress": 100
}
```

#### 1.4 상품 목록 조회
```http
GET /products?page=1&limit=50&status=ready&sort=createdAt:desc

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "name": "봄 신상 원피스",
      "price": 45000,
      "composedImageUrl": "https://...",
      "sendCount": 5,
      "readCount": 3,
      "clickCount": 2,
      "status": "ready",
      "createdAt": "2025-10-28T10:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 50
  }
}
```

#### 1.5 상품 수정
```http
PATCH /products/:id

{
  "name": "수정된 이름",
  "price": 50000
}

Response 200:
{
  "id": "uuid",
  "name": "수정된 이름",
  "updatedAt": "2025-10-28T11:00:00Z"
}
```

#### 1.6 상품 삭제
```http
DELETE /products/:id

Response 204
```

### 2. 주소록 관리 API

#### 2.1 주소록 업로드 (엑셀/CSV)
```http
POST /contacts/upload
Content-Type: multipart/form-data

{
  "file": File, // .xlsx, .csv
  "groupName": "VIP고객"
}

Response 201:
{
  "imported": 150,
  "failed": 5,
  "errors": [
    {
      "row": 10,
      "reason": "잘못된 전화번호 형식"
    }
  ]
}
```

#### 2.2 주소록 목록 조회
```http
GET /contacts?page=1&limit=100&group=VIP고객&search=홍길동

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "name": "홍길동",
      "phone": "010-1234-5678",
      "kakaoId": "honggildong",
      "groupName": "VIP고객",
      "tags": ["단골", "재구매"],
      "isActive": true
    }
  ],
  "meta": {
    "total": 150,
    "page": 1
  }
}
```

#### 2.3 주소록 개별 추가
```http
POST /contacts

{
  "name": "김철수",
  "phone": "010-9876-5432",
  "kakaoId": "kimcs",
  "groupName": "신규고객",
  "tags": ["이벤트참여"]
}

Response 201:
{
  "id": "uuid",
  "name": "김철수",
  "createdAt": "2025-10-28T10:00:00Z"
}
```

#### 2.4 주소록 수정
```http
PATCH /contacts/:id

{
  "groupName": "VIP고객",
  "tags": ["단골", "재구매", "리뷰작성"]
}

Response 200
```

#### 2.5 주소록 삭제
```http
DELETE /contacts/:id

Response 204
```

#### 2.6 그룹 목록 조회
```http
GET /contacts/groups

Response 200:
{
  "groups": [
    {
      "name": "VIP고객",
      "count": 150
    },
    {
      "name": "신규고객",
      "count": 80
    }
  ]
}
```

### 3. 발송 관리 API

#### 3.1 발송 작업 생성
```http
POST /send-jobs

{
  "productIds": ["uuid1", "uuid2"],
  "contactIds": ["uuid1", "uuid2", "uuid3"], // 또는 groupName
  "groupName": "VIP고객", // contactIds 대신 사용 가능
  "channel": "both", // sms, kakao, both
  "scheduledAt": "2025-10-28T15:00:00Z" // 선택적, 예약 발송
}

Response 201:
{
  "jobId": "uuid",
  "recipientCount": 150,
  "status": "pending",
  "estimatedCost": 15000 // 예상 비용 (원)
}
```

#### 3.2 발송 작업 상태 조회
```http
GET /send-jobs/:id

Response 200:
{
  "id": "uuid",
  "status": "processing",
  "recipientCount": 150,
  "successCount": 120,
  "failCount": 5,
  "progress": 83, // %
  "startedAt": "2025-10-28T10:00:00Z"
}
```

#### 3.3 발송 작업 목록
```http
GET /send-jobs?page=1&limit=20&status=completed

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "productIds": ["uuid1"],
      "channel": "both",
      "recipientCount": 150,
      "successCount": 145,
      "failCount": 5,
      "status": "completed",
      "createdAt": "2025-10-28T10:00:00Z"
    }
  ]
}
```

#### 3.4 발송 로그 조회
```http
GET /send-jobs/:id/logs?page=1&limit=50&status=failed

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "contactName": "홍길동",
      "phone": "010-1234-5678",
      "channel": "sms",
      "status": "failed",
      "errorCode": "INVALID_NUMBER",
      "errorMessage": "잘못된 전화번호",
      "sentAt": null
    }
  ]
}
```

### 4. 추적 및 분석 API

#### 4.1 클릭 추적 (리다이렉트)
```http
GET /track/:trackingCode

Response 302:
Location: https://market.example.com/product/123
```

#### 4.2 읽음 콜백 (카카오)
```http
POST /webhooks/kakao/read

{
  "messageId": "external-msg-id",
  "readAt": "2025-10-28T10:05:00Z"
}

Response 200
```

#### 4.3 상품별 통계 조회
```http
GET /analytics/products/:id

Response 200:
{
  "productId": "uuid",
  "productName": "봄 신상 원피스",
  "sendCount": 150,
  "deliveredCount": 145,
  "readCount": 120,
  "clickCount": 45,
  "readRate": 82.76, // %
  "clickRate": 31.03, // %
  "clickThroughRate": 37.5 // 읽음 대비 클릭률
}
```

#### 4.4 대시보드 통계
```http
GET /analytics/dashboard?startDate=2025-10-01&endDate=2025-10-31

Response 200:
{
  "totalProducts": 50,
  "totalSends": 5000,
  "totalReads": 4100,
  "totalClicks": 1500,
  "averageReadRate": 82.0,
  "averageClickRate": 30.0,
  "topProducts": [
    {
      "id": "uuid",
      "name": "인기 상품",
      "clickCount": 200
    }
  ],
  "dailyStats": [
    {
      "date": "2025-10-28",
      "sends": 150,
      "reads": 120,
      "clicks": 45
    }
  ]
}
```

### 5. 시스템 API

#### 5.1 헬스 체크
```http
GET /health

Response 200:
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2025-10-28T10:00:00Z"
}
```

---


## 주요 모듈 상세 설계

### Frontend 모듈 구조

```
src/
├── components/
│   ├── products/
│   │   ├── ProductForm.tsx          # 상품 등록 폼
│   │   ├── ProductList.tsx          # AG Grid 기반 상품 목록
│   │   ├── ImageUploader.tsx        # 다중 이미지 업로드
│   │   ├── ImageComposer.tsx        # 합성 미리보기 및 상태
│   │   └── ProductCard.tsx          # 모바일용 카드 뷰
│   ├── contacts/
│   │   ├── ContactList.tsx          # 주소록 목록
│   │   ├── ContactUploader.tsx      # 엑셀/CSV 업로드
│   │   ├── ContactForm.tsx          # 개별 추가/수정
│   │   └── ContactSelector.tsx      # 발송 대상 선택 모달
│   ├── send/
│   │   ├── SendJobForm.tsx          # 발송 설정
│   │   ├── SendJobList.tsx          # 발송 작업 목록
│   │   ├── SendJobMonitor.tsx       # 실시간 발송 상태
│   │   └── SendLogViewer.tsx        # 발송 로그 상세
│   ├── analytics/
│   │   ├── Dashboard.tsx            # 메인 대시보드
│   │   ├── ProductStats.tsx         # 상품별 통계
│   │   └── Charts.tsx               # 차트 컴포넌트
│   └── common/
│       ├── Layout.tsx               # 레이아웃
│       ├── Sidebar.tsx              # 사이드바
│       ├── Header.tsx               # 헤더
│       └── LoadingSpinner.tsx       # 로딩
├── hooks/
│   ├── useProducts.ts               # 상품 관련 훅
│   ├── useContacts.ts               # 주소록 관련 훅
│   ├── useSendJobs.ts               # 발송 관련 훅
│   └── useAnalytics.ts              # 분석 관련 훅
├── services/
│   ├── api.ts                       # Axios 인스턴스
│   ├── productService.ts            # 상품 API
│   ├── contactService.ts            # 주소록 API
│   ├── sendService.ts               # 발송 API
│   └── analyticsService.ts          # 분석 API
├── stores/
│   └── appStore.ts                  # Zustand 전역 상태
├── types/
│   ├── product.ts                   # 상품 타입
│   ├── contact.ts                   # 주소록 타입
│   └── send.ts                      # 발송 타입
└── utils/
    ├── validation.ts                # 유효성 검사
    ├── format.ts                    # 포맷팅
    └── constants.ts                 # 상수
```

### Backend 모듈 구조

```
src/
├── modules/
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   └── update-product.dto.ts
│   │   └── entities/
│   │       └── product.entity.ts
│   ├── contacts/
│   │   ├── contacts.module.ts
│   │   ├── contacts.controller.ts
│   │   ├── contacts.service.ts
│   │   ├── contacts-import.service.ts  # 엑셀/CSV 파싱
│   │   └── dto/
│   ├── composer/
│   │   ├── composer.module.ts
│   │   ├── composer.service.ts
│   │   ├── composer.processor.ts       # BullMQ Worker
│   │   ├── templates/
│   │   │   ├── grid-template.ts        # 그리드 레이아웃
│   │   │   ├── highlight-template.ts   # 하이라이트 레이아웃
│   │   │   └── simple-template.ts      # 심플 레이아웃
│   │   └── adapters/
│   │       ├── openai-adapter.ts       # OpenAI DALL-E
│   │       └── stability-adapter.ts    # Stability AI
│   ├── messaging/
│   │   ├── messaging.module.ts
│   │   ├── messaging.service.ts
│   │   ├── messaging.processor.ts      # BullMQ Worker
│   │   ├── adapters/
│   │   │   ├── sms-adapter.ts          # SMS 전송
│   │   │   └── kakao-adapter.ts        # 카카오 전송
│   │   └── templates/
│   │       └── message-template.ts     # 메시지 템플릿
│   ├── tracking/
│   │   ├── tracking.module.ts
│   │   ├── tracking.controller.ts      # 리다이렉트 엔드포인트
│   │   ├── tracking.service.ts
│   │   └── webhooks.controller.ts      # 카카오 콜백
│   ├── analytics/
│   │   ├── analytics.module.ts
│   │   ├── analytics.controller.ts
│   │   ├── analytics.service.ts
│   │   └── aggregation.service.ts      # 통계 집계
│   └── storage/
│       ├── storage.module.ts
│       ├── storage.service.ts          # S3 업로드/다운로드
│       └── image-processor.service.ts  # 이미지 리사이즈/최적화
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── utils/
├── config/
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── storage.config.ts
│   └── queue.config.ts
└── prisma/
    ├── schema.prisma
    └── migrations/
```

### 핵심 서비스 상세 설계

#### 1. Image Composer Service

**책임**
- 다중 이미지를 1개의 마케팅 이미지로 합성
- 텍스트 오버레이 (상품명, 가격, 사이즈, 색상, 링크)
- 다양한 레이아웃 템플릿 지원

**구현 방식**
```typescript
// composer.service.ts
@Injectable()
export class ComposerService {
  constructor(
    @InjectQueue('composer') private composerQueue: Queue,
    private storageService: StorageService,
    private prisma: PrismaService,
  ) {}

  async requestCompose(productId: string, templateType: string) {
    // 1. 합성 작업 생성
    const job = await this.prisma.composeJob.create({
      data: {
        productId,
        templateType,
        status: 'pending',
      },
    });

    // 2. 큐에 작업 등록
    await this.composerQueue.add('compose-image', {
      jobId: job.id,
      productId,
      templateType,
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });

    return job;
  }

  async getComposeStatus(productId: string) {
    return this.prisma.composeJob.findFirst({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// composer.processor.ts
@Processor('composer')
export class ComposerProcessor {
  @Process('compose-image')
  async handleCompose(job: Job) {
    const { jobId, productId, templateType } = job.data;

    try {
      // 1. 상품 정보 및 이미지 조회
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: { images: true },
      });

      // 2. 이미지 다운로드 및 전처리
      const processedImages = await this.preprocessImages(product.images);

      // 3. 템플릿 선택 및 레이아웃 생성
      const template = this.getTemplate(templateType);
      const layout = template.createLayout(processedImages, product);

      // 4. AI 합성 API 호출 (또는 Canvas 기반 합성)
      const composedImage = await this.composeWithAI(layout);
      // 또는: const composedImage = await this.composeWithCanvas(layout);

      // 5. S3 업로드
      const imageUrl = await this.storageService.upload(
        composedImage,
        `composed/${productId}.jpg`,
      );

      // 6. DB 업데이트
      await this.prisma.$transaction([
        this.prisma.composeJob.update({
          where: { id: jobId },
          data: {
            status: 'completed',
            resultUrl: imageUrl,
            completedAt: new Date(),
          },
        }),
        this.prisma.product.update({
          where: { id: productId },
          data: {
            composedImageUrl: imageUrl,
            status: 'ready',
          },
        }),
      ]);

      return { success: true, imageUrl };
    } catch (error) {
      // 실패 처리
      await this.prisma.composeJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          errorMessage: error.message,
          retryCount: { increment: 1 },
        },
      });
      throw error;
    }
  }

  private async preprocessImages(images: ProductImage[]) {
    // 이미지 리사이즈, 크롭, 최적화
    return Promise.all(
      images.map(async (img) => {
        const buffer = await this.storageService.download(img.imageUrl);
        return sharp(buffer)
          .resize(800, 800, { fit: 'cover' })
          .jpeg({ quality: 90 })
          .toBuffer();
      }),
    );
  }

  private getTemplate(type: string) {
    const templates = {
      grid: new GridTemplate(),
      highlight: new HighlightTemplate(),
      simple: new SimpleTemplate(),
    };
    return templates[type] || templates.grid;
  }

  private async composeWithCanvas(layout: Layout) {
    // Node-Canvas를 사용한 자체 합성 (AI 없이)
    const canvas = createCanvas(1200, 1600);
    const ctx = canvas.getContext('2d');

    // 배경
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1200, 1600);

    // 이미지 배치
    layout.images.forEach((img, idx) => {
      const { x, y, width, height } = layout.positions[idx];
      ctx.drawImage(img, x, y, width, height);
    });

    // 텍스트 오버레이
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(layout.productName, 50, 1450);

    ctx.font = '36px Arial';
    ctx.fillText(`${layout.price.toLocaleString()}원`, 50, 1500);

    // QR 코드 또는 "바로주문하기" 버튼
    // ...

    return canvas.toBuffer('image/jpeg');
  }

  private async composeWithAI(layout: Layout) {
    // OpenAI DALL-E 또는 Stability AI 사용
    // 프롬프트 생성 및 API 호출
    const prompt = this.generatePrompt(layout);
    const response = await this.aiAdapter.generate(prompt, layout.images);
    return response.imageBuffer;
  }
}
```

**템플릿 예시**
```typescript
// templates/grid-template.ts
export class GridTemplate {
  createLayout(images: Buffer[], product: Product): Layout {
    // 2x3 또는 3x2 그리드 레이아웃
    const positions = this.calculateGridPositions(images.length);
    
    return {
      type: 'grid',
      images,
      positions,
      productName: product.name,
      price: product.price,
      size: product.size,
      color: product.color,
      marketLink: product.marketLink,
    };
  }

  private calculateGridPositions(count: number) {
    // 이미지 개수에 따라 그리드 위치 계산
    const cols = count <= 4 ? 2 : 3;
    const rows = Math.ceil(count / cols);
    const cellWidth = 1200 / cols;
    const cellHeight = 1200 / rows;

    return Array.from({ length: count }, (_, i) => ({
      x: (i % cols) * cellWidth,
      y: Math.floor(i / cols) * cellHeight,
      width: cellWidth,
      height: cellHeight,
    }));
  }
}
```

#### 2. Messaging Service

**책임**
- SMS/카카오톡 대량 전송
- 전송 큐 관리 및 배치 처리
- 외부 API 레이트 리밋 준수
- 전송 결과 수집 및 재시도

**구현 방식**
```typescript
// messaging.service.ts
@Injectable()
export class MessagingService {
  constructor(
    @InjectQueue('messaging') private messagingQueue: Queue,
    private smsAdapter: SmsAdapter,
    private kakaoAdapter: KakaoAdapter,
    private prisma: PrismaService,
  ) {}

  async createSendJob(dto: CreateSendJobDto) {
    // 1. 수신자 목록 조회
    const contacts = await this.getContacts(dto);

    // 2. 발송 작업 생성
    const sendJob = await this.prisma.sendJob.create({
      data: {
        productIds: dto.productIds,
        channel: dto.channel,
        recipientCount: contacts.length,
        status: 'pending',
        scheduledAt: dto.scheduledAt,
      },
    });

    // 3. 각 수신자별 발송 로그 생성
    const sendLogs = await this.prisma.sendLog.createMany({
      data: contacts.map((contact) => ({
        sendJobId: sendJob.id,
        productId: dto.productIds[0], // 첫 번째 상품
        contactId: contact.id,
        channel: dto.channel,
        status: 'pending',
      })),
    });

    // 4. 큐에 배치 작업 등록 (100개씩 묶어서)
    const batches = this.chunkArray(contacts, 100);
    for (const [index, batch] of batches.entries()) {
      await this.messagingQueue.add(
        'send-batch',
        {
          sendJobId: sendJob.id,
          contacts: batch,
          productIds: dto.productIds,
          channel: dto.channel,
          batchIndex: index,
        },
        {
          delay: dto.scheduledAt 
            ? new Date(dto.scheduledAt).getTime() - Date.now() 
            : 0,
          attempts: 3,
        },
      );
    }

    return sendJob;
  }

  private async getContacts(dto: CreateSendJobDto) {
    if (dto.contactIds) {
      return this.prisma.contact.findMany({
        where: { id: { in: dto.contactIds } },
      });
    }
    if (dto.groupName) {
      return this.prisma.contact.findMany({
        where: { groupName: dto.groupName, isActive: true },
      });
    }
    throw new Error('contactIds 또는 groupName 필요');
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    return Array.from(
      { length: Math.ceil(array.length / size) },
      (_, i) => array.slice(i * size, (i + 1) * size),
    );
  }
}

// messaging.processor.ts
@Processor('messaging')
export class MessagingProcessor {
  @Process('send-batch')
  async handleSendBatch(job: Job) {
    const { sendJobId, contacts, productIds, channel } = job.data;

    // 상품 정보 조회
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // 메시지 내용 생성
    const message = this.createMessage(products);

    // 채널별 전송
    const results = await Promise.allSettled(
      contacts.map(async (contact) => {
        try {
          let result;
          if (channel === 'sms' || channel === 'both') {
            result = await this.smsAdapter.send(contact.phone, message);
          }
          if (channel === 'kakao' || channel === 'both') {
            result = await this.kakaoAdapter.send(contact.kakaoId, message);
          }

          // 성공 로그 업데이트
          await this.prisma.sendLog.updateMany({
            where: {
              sendJobId,
              contactId: contact.id,
            },
            data: {
              status: 'success',
              externalMessageId: result.messageId,
              sentAt: new Date(),
            },
          });

          return { success: true, contactId: contact.id };
        } catch (error) {
          // 실패 로그 업데이트
          await this.prisma.sendLog.updateMany({
            where: {
              sendJobId,
              contactId: contact.id,
            },
            data: {
              status: 'failed',
              errorCode: error.code,
              errorMessage: error.message,
            },
          });

          return { success: false, contactId: contact.id, error };
        }
      }),
    );

    // 발송 작업 통계 업데이트
    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failCount = results.filter((r) => r.status === 'rejected').length;

    await this.prisma.sendJob.update({
      where: { id: sendJobId },
      data: {
        successCount: { increment: successCount },
        failCount: { increment: failCount },
      },
    });

    return { successCount, failCount };
  }

  private createMessage(products: Product[]) {
    const product = products[0]; // 첫 번째 상품 기준
    
    // 추적 코드 생성
    const trackingCode = this.generateTrackingCode();
    const trackingUrl = `${process.env.APP_URL}/track/${trackingCode}`;

    return {
      text: `
🎉 신상품 입고!

${product.name}
💰 ${product.price.toLocaleString()}원
📏 사이즈: ${product.size}
🎨 색상: ${product.color}

👉 바로주문하기: ${trackingUrl}
      `.trim(),
      imageUrl: product.composedImageUrl,
      trackingCode,
      originalLink: product.marketLink,
    };
  }

  private generateTrackingCode(): string {
    return nanoid(10); // 짧은 고유 코드
  }
}
```

**외부 API 어댑터**
```typescript
// adapters/sms-adapter.ts
@Injectable()
export class SmsAdapter {
  private client: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.client = axios.create({
      baseURL: this.configService.get('SMS_API_URL'),
      headers: {
        'Authorization': `Bearer ${this.configService.get('SMS_API_KEY')}`,
      },
    });
  }

  async send(phone: string, message: any) {
    try {
      const response = await this.client.post('/send', {
        to: phone,
        text: message.text,
        // 이미지 MMS 지원 시
        imageUrl: message.imageUrl,
      });

      return {
        messageId: response.data.messageId,
        status: 'sent',
      };
    } catch (error) {
      throw new MessagingException(error.response?.data?.message);
    }
  }
}

// adapters/kakao-adapter.ts
@Injectable()
export class KakaoAdapter {
  private client: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.client = axios.create({
      baseURL: 'https://kapi.kakao.com',
      headers: {
        'Authorization': `Bearer ${this.configService.get('KAKAO_API_KEY')}`,
      },
    });
  }

  async send(kakaoId: string, message: any) {
    try {
      // 친구톡 또는 알림톡 전송
      const response = await this.client.post('/v1/api/talk/friends/message/default/send', {
        receiver_uuids: [kakaoId],
        template_object: {
          object_type: 'feed',
          content: {
            title: message.text.split('\n')[0],
            description: message.text,
            image_url: message.imageUrl,
            link: {
              web_url: message.trackingUrl,
              mobile_web_url: message.trackingUrl,
            },
          },
          buttons: [
            {
              title: '바로주문하기',
              link: {
                web_url: message.trackingUrl,
                mobile_web_url: message.trackingUrl,
              },
            },
          ],
        },
      });

      return {
        messageId: response.data.successful_receiver_uuids[0],
        status: 'sent',
      };
    } catch (error) {
      throw new MessagingException(error.response?.data?.msg);
    }
  }
}
```

#### 3. Tracking Service

**책임**
- 클릭 추적 (리다이렉트)
- 읽음 추적 (카카오 콜백)
- 이벤트 집계 및 통계

**구현 방식**
```typescript
// tracking.controller.ts
@Controller('track')
export class TrackingController {
  constructor(private trackingService: TrackingService) {}

  @Get(':code')
  async trackClick(
    @Param('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // 1. 추적 코드로 원본 링크 조회
    const tracking = await this.trackingService.findByCode(code);

    if (!tracking) {
      return res.redirect('https://example.com/404');
    }

    // 2. 클릭 이벤트 기록 (비동기)
    this.trackingService.recordClick(tracking.id, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }).catch(console.error);

    // 3. 원본 링크로 리다이렉트
    return res.redirect(tracking.originalLink);
  }
}

// tracking.service.ts
@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async recordClick(trackingId: string, metadata: any) {
    // 클릭 이벤트 저장
    await this.prisma.trackingEvent.create({
      data: {
        trackingCode: trackingId,
        eventType: 'click',
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      },
    });

    // 상품 클릭 수 증가
    await this.prisma.product.update({
      where: { id: tracking.productId },
      data: { clickCount: { increment: 1 } },
    });
  }

  async recordRead(externalMessageId: string) {
    // 외부 메시지 ID로 발송 로그 조회
    const sendLog = await this.prisma.sendLog.findFirst({
      where: { externalMessageId },
    });

    if (!sendLog) return;

    // 읽음 이벤트 저장
    await this.prisma.trackingEvent.create({
      data: {
        productId: sendLog.productId,
        contactId: sendLog.contactId,
        sendLogId: sendLog.id,
        eventType: 'read',
      },
    });

    // 상품 읽음 수 증가
    await this.prisma.product.update({
      where: { id: sendLog.productId },
      data: { readCount: { increment: 1 } },
    });
  }
}

// webhooks.controller.ts
@Controller('webhooks')
export class WebhooksController {
  constructor(private trackingService: TrackingService) {}

  @Post('kakao/read')
  async handleKakaoRead(@Body() body: any) {
    // 카카오 읽음 콜백 처리
    const { message_id, read_at } = body;
    await this.trackingService.recordRead(message_id);
    return { success: true };
  }

  @Post('sms/delivery')
  async handleSmsDelivery(@Body() body: any) {
    // SMS 전송 결과 콜백
    const { message_id, status } = body;
    await this.prisma.sendLog.updateMany({
      where: { externalMessageId: message_id },
      data: { status },
    });
    return { success: true };
  }
}
```

---


## 2단계 확장 설계 (SaaS)

### 인증 시스템

**User Entity**
```typescript
// users/entities/user.entity.ts
export class User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  role: 'user' | 'admin';
  tenantId: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**JWT 전략**
```typescript
// auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}
```

### 구독 시스템

**Subscription Plans**
```typescript
export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export const PLAN_LIMITS = {
  [SubscriptionPlan.FREE]: {
    monthlySendLimit: 100,
    maxProducts: 10,
    maxContacts: 100,
    features: ['basic_compose', 'sms'],
  },
  [SubscriptionPlan.BASIC]: {
    monthlySendLimit: 1000,
    maxProducts: 100,
    maxContacts: 1000,
    features: ['basic_compose', 'sms', 'kakao', 'analytics'],
  },
  [SubscriptionPlan.PRO]: {
    monthlySendLimit: 10000,
    maxProducts: 1000,
    maxContacts: 10000,
    features: ['advanced_compose', 'sms', 'kakao', 'analytics', 'api_access'],
  },
  [SubscriptionPlan.ENTERPRISE]: {
    monthlySendLimit: -1, // unlimited
    maxProducts: -1,
    maxContacts: -1,
    features: ['all'],
  },
};
```

### 멀티 테넌시

**Tenant Isolation Middleware**
```typescript
// common/middleware/tenant.middleware.ts
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const user = req.user;
    if (user && user.tenantId) {
      req['tenantId'] = user.tenantId;
    }
    next();
  }
}

// Prisma Middleware
prisma.$use(async (params, next) => {
  const tenantId = getCurrentTenantId(); // Context에서 가져오기
  
  if (tenantId && params.model) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = { ...params.args.where, tenantId };
    }
    if (params.action === 'create') {
      params.args.data = { ...params.args.data, tenantId };
    }
  }
  
  return next(params);
});
```

---

## 성능 최적화

### 데이터베이스 최적화

**인덱스 전략**
```sql
-- 자주 조회되는 컬럼에 인덱스
CREATE INDEX idx_products_status_created ON products(status, created_at DESC);
CREATE INDEX idx_contacts_tenant_group ON contacts(tenant_id, group_name);
CREATE INDEX idx_send_logs_job_status ON send_logs(send_job_id, status);
CREATE INDEX idx_tracking_events_product_type ON tracking_events(product_id, event_type);

-- 복합 인덱스
CREATE INDEX idx_products_tenant_status ON products(tenant_id, status) WHERE status = 'ready';
```

**쿼리 최적화**
```typescript
// N+1 문제 해결 - Eager Loading
const products = await prisma.product.findMany({
  include: {
    images: true,
    _count: {
      select: {
        sendLogs: true,
      },
    },
  },
});

// 페이지네이션 최적화 - Cursor-based
const products = await prisma.product.findMany({
  take: 20,
  skip: 1,
  cursor: {
    id: lastProductId,
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

### 캐싱 전략

**Redis 캐싱**
```typescript
// 상품 목록 캐싱 (5분)
const cacheKey = `products:${tenantId}:${page}:${limit}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const products = await prisma.product.findMany(...);
await redis.setex(cacheKey, 300, JSON.stringify(products));

// 통계 캐싱 (1시간)
const statsKey = `analytics:${productId}:${date}`;
const stats = await redis.get(statsKey);
if (!stats) {
  const computed = await this.computeStats(productId, date);
  await redis.setex(statsKey, 3600, JSON.stringify(computed));
}
```

### 이미지 최적화

**CDN 활용**
```typescript
// CloudFlare Images 또는 AWS CloudFront
const cdnUrl = `https://cdn.yourdomain.com/${imageKey}`;

// 다양한 크기 제공
const thumbnailUrl = `${cdnUrl}?w=200&h=200&fit=cover`;
const mediumUrl = `${cdnUrl}?w=800&h=800&fit=cover`;
const originalUrl = cdnUrl;
```

---

## 보안 고려사항

### 데이터 암호화

**민감 정보 암호화**
```typescript
// crypto.util.ts
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// 전화번호 암호화 저장
const encryptedPhone = encrypt(contact.phone);
await prisma.contact.create({
  data: {
    ...contact,
    phone: encryptedPhone,
  },
});
```

### SQL Injection 방지

```typescript
// Prisma는 자동으로 파라미터화된 쿼리 사용
// 직접 SQL 사용 시 주의
const result = await prisma.$queryRaw`
  SELECT * FROM products 
  WHERE name = ${userInput}
`; // ✅ 안전

// ❌ 위험 - 절대 사용 금지
const result = await prisma.$queryRawUnsafe(
  `SELECT * FROM products WHERE name = '${userInput}'`
);
```

### XSS 방지

```typescript
// Frontend - DOMPurify 사용
import DOMPurify from 'dompurify';

const sanitizedHtml = DOMPurify.sanitize(userInput);

// React는 기본적으로 XSS 방지
<div>{userInput}</div> // ✅ 안전

// dangerouslySetInnerHTML 사용 시 주의
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

---

## 확장 가능성

### 마이크로서비스 전환 (미래)

```
현재 (Monolith)          →          미래 (Microservices)

┌─────────────────┐              ┌──────────┐  ┌──────────┐
│   NestJS App    │              │ Product  │  │ Contact  │
│                 │              │ Service  │  │ Service  │
│ - Products      │              └──────────┘  └──────────┘
│ - Contacts      │              ┌──────────┐  ┌──────────┐
│ - Messaging     │      →       │Messaging │  │Analytics │
│ - Analytics     │              │ Service  │  │ Service  │
│                 │              └──────────┘  └──────────┘
└─────────────────┘              
                                 ┌──────────────────────┐
                                 │   API Gateway        │
                                 │   (Kong/AWS Gateway) │
                                 └──────────────────────┘
```

### 글로벌 확장

**다국어 지원**
```typescript
// i18n 설정
import i18n from 'i18next';

i18n.init({
  lng: 'ko',
  resources: {
    ko: {
      translation: {
        'product.create': '상품 등록',
        'product.list': '상품 목록',
      },
    },
    en: {
      translation: {
        'product.create': 'Create Product',
        'product.list': 'Product List',
      },
    },
  },
});
```

**타임존 처리**
```typescript
import { DateTime } from 'luxon';

// UTC로 저장
const utcDate = DateTime.utc();

// 사용자 타임존으로 표시
const userDate = utcDate.setZone('Asia/Seoul');
```

---

## 요약

### 완료된 설계 문서
1. ✅ **DEVELOPMENT_DESIGN.md** - 전체 시스템 설계
2. ✅ **EXTERNAL_API_REQUIREMENTS.md** - 외부 API 연동 가이드
3. ✅ **SPRINT_PLAN.md** - 8주 개발 일정
4. ✅ **TEST_STRATEGY.md** - TDD 테스트 전략
5. ✅ **DEPLOYMENT_GUIDE.md** - 배포 및 운영 가이드
6. ✅ **PROJECT_STRUCTURE.md** - 프로젝트 구조

### 핵심 설계 포인트
- **간결하고 명확한 모듈 구조**: Over-Engineering 지양
- **TDD 기반 개발**: 테스트 우선 작성
- **비동기 처리**: BullMQ를 활용한 작업 큐
- **확장 가능한 아키텍처**: 1단계 MVP → 2단계 SaaS
- **엑셀 친화적 UX**: AG Grid 활용
- **반응형 웹**: PC/모바일 모두 지원

### 기술 스택 요약
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: NestJS + Prisma + BullMQ
- **Database**: PostgreSQL + Redis
- **Storage**: AWS S3
- **Testing**: Jest + Playwright
- **Deployment**: Vercel + Railway/AWS

이제 스프린트 0부터 개발을 시작할 수 있습니다! 🚀
