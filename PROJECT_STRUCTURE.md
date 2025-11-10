# 프로젝트 구조

## 전체 디렉토리 구조

```
product-marketing-system/
├── .github/
│   └── workflows/
│       ├── test.yml
│       └── deploy.yml
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── products/
│   │   │   ├── contacts/
│   │   │   ├── composer/
│   │   │   ├── messaging/
│   │   │   ├── tracking/
│   │   │   ├── analytics/
│   │   │   └── storage/
│   │   ├── common/
│   │   ├── config/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── test/
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docs/
│   ├── DEVELOPMENT_DESIGN.md
│   ├── EXTERNAL_API_REQUIREMENTS.md
│   ├── SPRINT_PLAN.md
│   ├── TEST_STRATEGY.md
│   └── DEPLOYMENT_GUIDE.md
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Backend 상세 구조

```
backend/
├── src/
│   ├── modules/
│   │   ├── products/
│   │   │   ├── dto/
│   │   │   │   ├── create-product.dto.ts
│   │   │   │   ├── update-product.dto.ts
│   │   │   │   └── query-product.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── product.entity.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── products.module.ts
│   │   │   └── products.service.spec.ts
│   │   │
│   │   ├── contacts/
│   │   │   ├── dto/
│   │   │   │   ├── create-contact.dto.ts
│   │   │   │   ├── upload-contacts.dto.ts
│   │   │   │   └── query-contact.dto.ts
│   │   │   ├── contacts.controller.ts
│   │   │   ├── contacts.service.ts
│   │   │   ├── contacts-import.service.ts
│   │   │   ├── contacts.module.ts
│   │   │   └── contacts.service.spec.ts
│   │   │
│   │   ├── composer/
│   │   │   ├── templates/
│   │   │   │   ├── base.template.ts
│   │   │   │   ├── grid.template.ts
│   │   │   │   ├── highlight.template.ts
│   │   │   │   └── simple.template.ts
│   │   │   ├── adapters/
│   │   │   │   ├── openai.adapter.ts
│   │   │   │   ├── stability.adapter.ts
│   │   │   │   └── canvas.adapter.ts
│   │   │   ├── composer.controller.ts
│   │   │   ├── composer.service.ts
│   │   │   ├── composer.processor.ts
│   │   │   ├── composer.module.ts
│   │   │   └── composer.service.spec.ts
│   │   │
│   │   ├── messaging/
│   │   │   ├── adapters/
│   │   │   │   ├── sms.adapter.ts
│   │   │   │   └── kakao.adapter.ts
│   │   │   ├── templates/
│   │   │   │   └── message.template.ts
│   │   │   ├── dto/
│   │   │   │   └── create-send-job.dto.ts
│   │   │   ├── messaging.controller.ts
│   │   │   ├── messaging.service.ts
│   │   │   ├── messaging.processor.ts
│   │   │   ├── messaging.module.ts
│   │   │   └── messaging.service.spec.ts
│   │   │
│   │   ├── tracking/
│   │   │   ├── tracking.controller.ts
│   │   │   ├── tracking.service.ts
│   │   │   ├── webhooks.controller.ts
│   │   │   ├── tracking.module.ts
│   │   │   └── tracking.service.spec.ts
│   │   │
│   │   ├── analytics/
│   │   │   ├── dto/
│   │   │   │   └── query-analytics.dto.ts
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── aggregation.service.ts
│   │   │   ├── analytics.module.ts
│   │   │   └── analytics.service.spec.ts
│   │   │
│   │   └── storage/
│   │       ├── storage.service.ts
│   │       ├── image-processor.service.ts
│   │       ├── storage.module.ts
│   │       └── storage.service.spec.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── all-exceptions.filter.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── throttler.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   └── cache.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── utils/
│   │       ├── pagination.util.ts
│   │       ├── file.util.ts
│   │       └── crypto.util.ts
│   │
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── storage.config.ts
│   │   ├── queue.config.ts
│   │   └── app.config.ts
│   │
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   │   └── 20251028000000_init/
│   │       └── migration.sql
│   └── seed.ts
│
├── test/
│   ├── fixtures/
│   │   ├── products.fixture.ts
│   │   └── contacts.fixture.ts
│   ├── mocks/
│   │   ├── prisma.mock.ts
│   │   └── redis.mock.ts
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env.example
├── .env.development
├── .env.test
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── Dockerfile
```

---

## Frontend 상세 구조

```
frontend/
├── src/
│   ├── components/
│   │   ├── products/
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductForm.test.tsx
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductList.test.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── ImageComposer.tsx
│   │   │   └── ProductCard.tsx
│   │   │
│   │   ├── contacts/
│   │   │   ├── ContactList.tsx
│   │   │   ├── ContactUploader.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   └── ContactSelector.tsx
│   │   │
│   │   ├── send/
│   │   │   ├── SendJobForm.tsx
│   │   │   ├── SendJobList.tsx
│   │   │   ├── SendJobMonitor.tsx
│   │   │   └── SendLogViewer.tsx
│   │   │
│   │   ├── analytics/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ProductStats.tsx
│   │   │   └── Charts.tsx
│   │   │
│   │   ├── common/
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── Toast.tsx
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Table.tsx
│   │       └── Card.tsx
│   │
│   ├── hooks/
│   │   ├── useProducts.ts
│   │   ├── useProducts.test.ts
│   │   ├── useContacts.ts
│   │   ├── useSendJobs.ts
│   │   ├── useAnalytics.ts
│   │   └── useToast.ts
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── productService.ts
│   │   ├── contactService.ts
│   │   ├── sendService.ts
│   │   └── analyticsService.ts
│   │
│   ├── stores/
│   │   ├── appStore.ts
│   │   ├── authStore.ts (2단계)
│   │   └── uiStore.ts
│   │
│   ├── types/
│   │   ├── product.ts
│   │   ├── contact.ts
│   │   ├── send.ts
│   │   ├── analytics.ts
│   │   └── api.ts
│   │
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── format.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── tailwind.css
│   │
│   ├── mocks/
│   │   ├── handlers.ts
│   │   └── server.ts
│   │
│   ├── App.tsx
│   ├── App.test.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── public/
│   ├── favicon.ico
│   └── images/
│
├── e2e/
│   ├── product-flow.spec.ts
│   ├── send-flow.spec.ts
│   └── analytics-flow.spec.ts
│
├── .env.example
├── .env.development
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── Dockerfile
```

---

## 주요 파일 설명

### Backend

#### `src/main.ts`
```typescript
// 애플리케이션 진입점
// - NestJS 앱 초기화
// - 글로벌 파이프, 필터, 인터셉터 설정
// - Swagger 문서 설정
// - CORS 설정
```

#### `src/app.module.ts`
```typescript
// 루트 모듈
// - 모든 기능 모듈 임포트
// - 데이터베이스, Redis, 큐 설정
// - 글로벌 모듈 설정
```

#### `prisma/schema.prisma`
```prisma
// 데이터베이스 스키마 정의
// - 모델 정의
// - 관계 설정
// - 인덱스 설정
```

#### `src/modules/products/products.service.ts`
```typescript
// 상품 비즈니스 로직
// - CRUD 작업
// - 이미지 관리
// - 통계 집계
```

#### `src/modules/composer/composer.processor.ts`
```typescript
// 이미지 합성 워커
// - BullMQ 작업 처리
// - 이미지 다운로드 및 전처리
// - AI API 호출 또는 Canvas 합성
// - 결과 저장
```

### Frontend

#### `src/main.tsx`
```typescript
// 애플리케이션 진입점
// - React 앱 마운트
// - 글로벌 프로바이더 설정
// - 에러 바운더리
```

#### `src/App.tsx`
```typescript
// 루트 컴포넌트
// - 라우팅 설정
// - 레이아웃 구조
// - 인증 처리 (2단계)
```

#### `src/services/api.ts`
```typescript
// Axios 인스턴스
// - 기본 URL 설정
// - 인터셉터 (요청/응답)
// - 에러 핸들링
```

#### `src/hooks/useProducts.ts`
```typescript
// 상품 관련 커스텀 훅
// - TanStack Query 사용
// - 상품 목록 조회
// - 상품 생성/수정/삭제
// - 캐싱 및 무효화
```

#### `src/components/products/ProductList.tsx`
```typescript
// 상품 목록 컴포넌트
// - AG Grid 통합
// - 페이지네이션
// - 정렬 및 필터
// - 체크박스 선택
```

---

## 설정 파일

### Backend

#### `package.json`
```json
{
  "name": "backend",
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "ts-node prisma/seed.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "@nestjs/bullmq": "^10.0.0",
    "bullmq": "^4.0.0",
    "canvas": "^2.11.0",
    "sharp": "^0.32.0",
    "axios": "^1.5.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.0.0",
    "@types/jest": "^29.0.0",
    "jest": "^29.0.0",
    "prisma": "^5.0.0",
    "supertest": "^6.3.0",
    "ts-jest": "^29.0.0",
    "typescript": "^5.0.0"
  }
}
```

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

### Frontend

#### `package.json`
```json
{
  "name": "frontend",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "axios": "^1.5.0",
    "react-hook-form": "^7.47.0",
    "zod": "^3.22.0",
    "ag-grid-react": "^30.0.0",
    "recharts": "^2.8.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0",
    "typescript": "^5.0.0",
    "vitest": "^0.34.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.38.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

#### `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

#### `tailwind.config.js`
```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
};
```

---

## 환경 변수

### Backend `.env.example`
```env
# App
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/product_marketing

# Redis
REDIS_URL=redis://localhost:6379

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=ap-northeast-2

# SMS (알리고)
ALIGO_API_KEY=
ALIGO_USER_ID=
ALIGO_SENDER=

# 카카오톡
KAKAO_API_KEY=
KAKAO_CHANNEL_ID=

# OpenAI (선택)
OPENAI_API_KEY=

# Sentry (선택)
SENTRY_DSN=

# JWT (2단계)
JWT_SECRET=
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRES_IN=7d
```

### Frontend `.env.example`
```env
VITE_API_URL=http://localhost:3000
VITE_SENTRY_DSN=
```

---

## Git 브랜치 전략

```
main (프로덕션)
  └── develop (개발)
       ├── feature/product-crud
       ├── feature/image-composer
       ├── feature/contacts
       ├── feature/messaging
       └── feature/analytics
```

### 브랜치 규칙
- `main`: 프로덕션 배포용
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발
- `bugfix/*`: 버그 수정
- `hotfix/*`: 긴급 수정

---

## 다음 단계

1. 프로젝트 초기화 (스프린트 0)
2. 디렉토리 구조 생성
3. 기본 설정 파일 작성
4. Git 저장소 초기화
