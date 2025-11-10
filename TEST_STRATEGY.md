# 테스트 전략 (TDD 기반)

## 테스트 주도 개발 (TDD) 원칙

### Red-Green-Refactor 사이클
1. **Red**: 실패하는 테스트 작성
2. **Green**: 테스트를 통과하는 최소한의 코드 작성
3. **Refactor**: 코드 개선 및 최적화

### 테스트 우선 개발 흐름
```
요구사항 분석 → 테스트 케이스 작성 → 테스트 실행 (실패) 
→ 기능 구현 → 테스트 실행 (성공) → 리팩토링 → 다음 기능
```

---

## 테스트 피라미드

```
        /\
       /  \      E2E Tests (10%)
      /____\     - 전체 사용자 플로우
     /      \    
    /        \   Integration Tests (30%)
   /__________\  - API 통합, DB 연동
  /            \ 
 /              \ Unit Tests (60%)
/________________\ - 개별 함수, 메서드
```

### 테스트 비율 목표
- **단위 테스트 (Unit)**: 60% - 빠르고 많이
- **통합 테스트 (Integration)**: 30% - 모듈 간 연동
- **E2E 테스트**: 10% - 핵심 플로우만

---

## 테스트 도구 및 프레임워크

### Backend (NestJS)
- **Jest**: 단위 테스트 및 통합 테스트
- **Supertest**: HTTP API 테스트
- **@nestjs/testing**: NestJS 테스트 유틸리티
- **Prisma Mock**: 데이터베이스 모킹

### Frontend (React)
- **Jest**: 단위 테스트
- **React Testing Library**: 컴포넌트 테스트
- **MSW (Mock Service Worker)**: API 모킹
- **@testing-library/user-event**: 사용자 인터랙션 시뮬레이션

### E2E
- **Playwright**: 브라우저 자동화 테스트
- **Docker Compose**: 테스트 환경 격리

---

## 단위 테스트 (Unit Tests)

### Backend 단위 테스트

#### 예시 1: Product Service
```typescript
// products.service.spec.ts
describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('상품을 생성해야 함', async () => {
      // Arrange
      const createDto = {
        name: '봄 원피스',
        price: 45000,
        size: 'Free',
        color: '베이지',
      };
      const expectedProduct = { id: 'uuid', ...createDto };
      jest.spyOn(prisma.product, 'create').mockResolvedValue(expectedProduct);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(expectedProduct);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('필수 필드 누락 시 에러를 던져야 함', async () => {
      // Arrange
      const invalidDto = { name: '봄 원피스' }; // price 누락

      // Act & Assert
      await expect(service.create(invalidDto as any)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('페이지네이션된 상품 목록을 반환해야 함', async () => {
      // Arrange
      const products = [
        { id: '1', name: '상품1', price: 10000 },
        { id: '2', name: '상품2', price: 20000 },
      ];
      jest.spyOn(prisma.product, 'findMany').mockResolvedValue(products);

      // Act
      const result = await service.findAll({ page: 1, limit: 10 });

      // Assert
      expect(result).toEqual(products);
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });
  });
});
```

#### 예시 2: Image Composer
```typescript
// composer.service.spec.ts
describe('ComposerService', () => {
  let service: ComposerService;
  let queue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComposerService,
        {
          provide: getQueueToken('composer'),
          useValue: {
            add: jest.fn(),
          },
        },
        PrismaService,
      ],
    }).compile();

    service = module.get<ComposerService>(ComposerService);
    queue = module.get<Queue>(getQueueToken('composer'));
  });

  describe('requestCompose', () => {
    it('합성 작업을 큐에 등록해야 함', async () => {
      // Arrange
      const productId = 'uuid';
      const templateType = 'grid';

      // Act
      await service.requestCompose(productId, templateType);

      // Assert
      expect(queue.add).toHaveBeenCalledWith(
        'compose-image',
        { productId, templateType },
        expect.any(Object),
      );
    });
  });
});
```

### Frontend 단위 테스트

#### 예시 1: Product Form
```typescript
// ProductForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductForm } from './ProductForm';

describe('ProductForm', () => {
  it('폼을 렌더링해야 함', () => {
    render(<ProductForm />);
    
    expect(screen.getByLabelText('상품명')).toBeInTheDocument();
    expect(screen.getByLabelText('가격')).toBeInTheDocument();
    expect(screen.getByLabelText('사이즈')).toBeInTheDocument();
  });

  it('유효한 데이터 입력 시 제출되어야 함', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    
    render(<ProductForm onSubmit={onSubmit} />);
    
    // 입력
    await user.type(screen.getByLabelText('상품명'), '봄 원피스');
    await user.type(screen.getByLabelText('가격'), '45000');
    await user.type(screen.getByLabelText('사이즈'), 'Free');
    
    // 제출
    await user.click(screen.getByRole('button', { name: '등록' }));
    
    // 검증
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: '봄 원피스',
        price: 45000,
        size: 'Free',
      });
    });
  });

  it('필수 필드 누락 시 에러 메시지를 표시해야 함', async () => {
    const user = userEvent.setup();
    
    render(<ProductForm />);
    
    // 빈 폼 제출
    await user.click(screen.getByRole('button', { name: '등록' }));
    
    // 에러 메시지 확인
    expect(await screen.findByText('상품명을 입력하세요')).toBeInTheDocument();
  });
});
```

#### 예시 2: Custom Hook
```typescript
// useProducts.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts } from './useProducts';
import { server } from '../mocks/server';
import { rest } from 'msw';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useProducts', () => {
  it('상품 목록을 가져와야 함', async () => {
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].name).toBe('상품1');
  });

  it('에러 발생 시 에러 상태를 반환해야 함', async () => {
    server.use(
      rest.get('/api/products', (req, res, ctx) => {
        return res(ctx.status(500));
      }),
    );

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

---

## 통합 테스트 (Integration Tests)

### Backend API 통합 테스트

```typescript
// products.controller.spec.ts
describe('ProductsController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // 테스트 전 DB 초기화
    await prisma.product.deleteMany();
  });

  describe('POST /products', () => {
    it('상품을 생성하고 201을 반환해야 함', async () => {
      const createDto = {
        name: '봄 원피스',
        price: 45000,
        size: 'Free',
        color: '베이지',
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject(createDto);
      expect(response.body.id).toBeDefined();

      // DB 확인
      const product = await prisma.product.findUnique({
        where: { id: response.body.id },
      });
      expect(product).toBeDefined();
    });

    it('잘못된 데이터 전송 시 400을 반환해야 함', async () => {
      const invalidDto = { name: '봄 원피스' }; // price 누락

      await request(app.getHttpServer())
        .post('/products')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /products', () => {
    it('상품 목록을 반환해야 함', async () => {
      // 테스트 데이터 생성
      await prisma.product.createMany({
        data: [
          { name: '상품1', price: 10000 },
          { name: '상품2', price: 20000 },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
    });

    it('페이지네이션이 동작해야 함', async () => {
      // 10개 생성
      await prisma.product.createMany({
        data: Array.from({ length: 10 }, (_, i) => ({
          name: `상품${i}`,
          price: 10000,
        })),
      });

      const response = await request(app.getHttpServer())
        .get('/products?page=2&limit=5')
        .expect(200);

      expect(response.body.data).toHaveLength(5);
      expect(response.body.meta.page).toBe(2);
    });
  });
});
```

### 작업 큐 통합 테스트

```typescript
// composer.processor.spec.ts
describe('ComposerProcessor (Integration)', () => {
  let processor: ComposerProcessor;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [BullModule.registerQueue({ name: 'composer' })],
      providers: [ComposerProcessor, PrismaService, StorageService],
    }).compile();

    processor = module.get<ComposerProcessor>(ComposerProcessor);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('이미지 합성 작업을 처리해야 함', async () => {
    // 테스트 상품 생성
    const product = await prisma.product.create({
      data: {
        name: '테스트 상품',
        price: 10000,
        images: {
          create: [
            { imageUrl: 'test1.jpg', sequence: 1 },
            { imageUrl: 'test2.jpg', sequence: 2 },
          ],
        },
      },
      include: { images: true },
    });

    // 작업 실행
    const job = {
      data: {
        jobId: 'test-job',
        productId: product.id,
        templateType: 'grid',
      },
    } as Job;

    const result = await processor.handleCompose(job);

    // 검증
    expect(result.success).toBe(true);
    expect(result.imageUrl).toBeDefined();

    // DB 확인
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
    });
    expect(updatedProduct.composedImageUrl).toBeDefined();
    expect(updatedProduct.status).toBe('ready');
  });
});
```

---

## E2E 테스트 (End-to-End Tests)

### Playwright 설정

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
```

### E2E 테스트 시나리오

#### 시나리오 1: 상품 등록 및 합성
```typescript
// e2e/product-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('상품 등록 플로우', () => {
  test('상품을 등록하고 이미지를 합성할 수 있어야 함', async ({ page }) => {
    // 1. 상품 등록 페이지 이동
    await page.goto('/products/new');

    // 2. 폼 작성
    await page.fill('[name="name"]', '봄 원피스');
    await page.fill('[name="price"]', '45000');
    await page.fill('[name="size"]', 'Free');
    await page.fill('[name="color"]', '베이지');

    // 3. 이미지 업로드
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      'test-images/1.jpg',
      'test-images/2.jpg',
      'test-images/3.jpg',
      'test-images/4.jpg',
      'test-images/5.jpg',
    ]);

    // 4. 이미지 미리보기 확인
    await expect(page.locator('.image-preview')).toHaveCount(5);

    // 5. 상품 저장
    await page.click('button:has-text("저장")');

    // 6. 상품 목록으로 이동 확인
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.locator('text=봄 원피스')).toBeVisible();

    // 7. 이미지 합성 버튼 클릭
    await page.click('button:has-text("이미지 합성")');

    // 8. 합성 진행 상태 확인
    await expect(page.locator('.progress-bar')).toBeVisible();

    // 9. 합성 완료 대기 (최대 30초)
    await page.waitForSelector('.composed-image', { timeout: 30000 });

    // 10. 합성된 이미지 확인
    const composedImage = page.locator('.composed-image');
    await expect(composedImage).toBeVisible();
  });
});
```

#### 시나리오 2: 발송 플로우
```typescript
// e2e/send-flow.spec.ts
test.describe('발송 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 데이터 준비
    await page.request.post('/api/test/seed', {
      data: {
        products: 3,
        contacts: 10,
      },
    });
  });

  test('상품을 선택하고 발송할 수 있어야 함', async ({ page }) => {
    // 1. 상품 목록 페이지
    await page.goto('/products');

    // 2. 상품 선택 (체크박스)
    await page.check('[data-testid="product-checkbox-1"]');
    await page.check('[data-testid="product-checkbox-2"]');

    // 3. 발송하기 버튼 클릭
    await page.click('button:has-text("발송하기")');

    // 4. 주소록 선택 모달
    await expect(page.locator('.contact-selector-modal')).toBeVisible();

    // 5. 그룹 선택
    await page.click('text=VIP고객');

    // 6. 채널 선택
    await page.check('[name="channel"][value="both"]');

    // 7. 발송 확인
    await page.click('button:has-text("발송")');

    // 8. 발송 작업 생성 확인
    await expect(page.locator('text=발송 작업이 생성되었습니다')).toBeVisible();

    // 9. 발송 모니터 페이지로 이동
    await page.click('text=발송 현황 보기');

    // 10. 발송 진행 상태 확인
    await expect(page.locator('.send-job-status')).toContainText('처리중');

    // 11. 발송 완료 대기
    await page.waitForSelector('text=완료', { timeout: 60000 });

    // 12. 성공/실패 카운트 확인
    const successCount = await page.locator('.success-count').textContent();
    expect(parseInt(successCount)).toBeGreaterThan(0);
  });
});
```

#### 시나리오 3: 추적 및 분석
```typescript
// e2e/analytics-flow.spec.ts
test.describe('분석 플로우', () => {
  test('대시보드에서 통계를 확인할 수 있어야 함', async ({ page }) => {
    // 1. 대시보드 페이지
    await page.goto('/analytics');

    // 2. 전체 통계 확인
    await expect(page.locator('.total-sends')).toBeVisible();
    await expect(page.locator('.total-reads')).toBeVisible();
    await expect(page.locator('.total-clicks')).toBeVisible();

    // 3. 차트 확인
    await expect(page.locator('.chart-container')).toBeVisible();

    // 4. 상위 상품 목록 확인
    await expect(page.locator('.top-products')).toBeVisible();

    // 5. 상품별 상세 통계 클릭
    await page.click('.top-products .product-item:first-child');

    // 6. 상세 통계 페이지
    await expect(page).toHaveURL(/\/analytics\/products\/.+/);
    await expect(page.locator('.read-rate')).toBeVisible();
    await expect(page.locator('.click-rate')).toBeVisible();
  });
});
```

---

## 테스트 커버리지 목표

### 전체 목표
- **라인 커버리지**: 80% 이상
- **브랜치 커버리지**: 75% 이상
- **함수 커버리지**: 85% 이상

### 모듈별 목표
- **핵심 비즈니스 로직**: 90% 이상
  - Product Service
  - Composer Service
  - Messaging Service
  - Tracking Service
- **컨트롤러**: 80% 이상
- **유틸리티**: 85% 이상

### 커버리지 측정
```bash
# Backend
npm run test:cov

# Frontend
npm run test:cov

# 리포트 확인
open coverage/lcov-report/index.html
```

---

## 테스트 자동화 (CI/CD)

### GitHub Actions 워크플로우

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## QA 시나리오 체크리스트

### 기능 테스트
- [ ] 상품 등록 (정상/비정상 케이스)
- [ ] 이미지 업로드 (다양한 포맷, 크기)
- [ ] 이미지 합성 (5~6장, 템플릿별)
- [ ] 주소록 업로드 (엑셀/CSV, 대용량)
- [ ] 발송 (SMS/카카오, 대량)
- [ ] 추적 (클릭/읽음)
- [ ] 통계 (정확성)

### 성능 테스트
- [ ] API 응답 시간 (< 500ms)
- [ ] 대량 발송 (10,000건)
- [ ] 동시 사용자 (100명)
- [ ] 이미지 합성 시간 (< 30초)

### 보안 테스트
- [ ] SQL Injection
- [ ] XSS
- [ ] CSRF
- [ ] 인증/인가
- [ ] Rate Limiting

### 사용성 테스트
- [ ] PC 브라우저 (Chrome, Firefox, Safari)
- [ ] 모바일 브라우저 (iOS, Android)
- [ ] 반응형 레이아웃
- [ ] 접근성 (키보드, 스크린 리더)

---

## 테스트 데이터 관리

### Seed 데이터
```typescript
// prisma/seed.ts
async function main() {
  // 테스트 상품
  await prisma.product.createMany({
    data: [
      {
        name: '봄 원피스',
        price: 45000,
        size: 'Free',
        color: '베이지',
        status: 'ready',
      },
      // ... 더 많은 데이터
    ],
  });

  // 테스트 주소록
  await prisma.contact.createMany({
    data: [
      {
        name: '홍길동',
        phone: '010-1234-5678',
        groupName: 'VIP고객',
      },
      // ... 더 많은 데이터
    ],
  });
}
```

### Fixture 파일
```typescript
// test/fixtures/products.ts
export const mockProducts = [
  {
    id: 'uuid-1',
    name: '봄 원피스',
    price: 45000,
    size: 'Free',
    color: '베이지',
  },
  // ...
];
```

---

## 테스트 모범 사례

### DO
- ✅ 테스트를 먼저 작성 (TDD)
- ✅ 하나의 테스트는 하나의 기능만 검증
- ✅ 명확한 테스트 이름 (한글 사용 가능)
- ✅ AAA 패턴 (Arrange-Act-Assert)
- ✅ 독립적인 테스트 (순서 무관)
- ✅ 빠른 테스트 (단위 테스트 < 100ms)

### DON'T
- ❌ 테스트 간 의존성
- ❌ 프로덕션 DB 사용
- ❌ 하드코딩된 시간/날짜
- ❌ 불필요한 모킹
- ❌ 테스트 스킵 (it.skip)
- ❌ 너무 긴 테스트 (> 100줄)

---

## 다음 단계

1. 스프린트 0에서 테스트 환경 설정
2. 각 스프린트에서 TDD 사이클 적용
3. PR 시 테스트 통과 필수
4. 주간 커버리지 리뷰
