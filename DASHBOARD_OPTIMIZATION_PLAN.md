# 🚀 대시보드 성능 최적화 계획

**작성일**: 2024년 11월 15일  
**문제**: 대시보드 첫 로딩이 느림  
**원인**: Recharts 라이브러리 즉시 로드 (무거운 번들)

---

## 🔍 현재 문제 분석

### 번들 크기
```
components-heavy-21cd8bce.js: 104KB (압축 전)
charts-vendor-2108e95c.js:    333KB (압축 전)
총:                           437KB
```

### 로딩 순서
```
1. 대시보드 페이지 로드
2. DashboardCharts 컴포넌트 즉시 로드
3. Recharts 라이브러리 전체 로드 (333KB)
4. 차트 렌더링
```

### 문제점
- ❌ Recharts가 즉시 로드됨 (지연 로딩 없음)
- ❌ 차트가 보이지 않아도 로드됨
- ❌ 첫 화면에 필요하지 않은 데이터

---

## ✅ 최적화 방안

### 1. 차트 컴포넌트 지연 로딩 (Lazy Loading) ⭐

**효과**: 초기 로딩 시간 50% 감소

```typescript
// Before
import { DashboardCharts } from '../components/dashboard/DashboardCharts';

// After
const DashboardCharts = lazy(() => import('../components/dashboard/DashboardCharts'));
```

**장점**:
- ✅ 초기 번들 크기 감소 (333KB 제거)
- ✅ 필요할 때만 로드
- ✅ 첫 화면 로딩 빠름

---

### 2. 스켈레톤 UI 개선

**효과**: 사용자 경험 향상

```typescript
<Suspense fallback={<ChartsSkeleton />}>
  <DashboardCharts />
</Suspense>
```

**장점**:
- ✅ 로딩 중 빈 화면 방지
- ✅ 부드러운 전환
- ✅ 사용자 이탈 방지

---

### 3. 데이터 프리페칭 최적화

**효과**: API 호출 최적화

```typescript
// 대시보드 통계만 먼저 로드
const { data: overview } = useDashboardOverview();

// 차트 데이터는 나중에 로드
const { data: charts } = useDashboardCharts({
  enabled: isChartsVisible,
  staleTime: 5 * 60 * 1000, // 5분 캐싱
});
```

**장점**:
- ✅ 중요한 데이터 먼저 표시
- ✅ 불필요한 API 호출 방지
- ✅ 캐싱으로 재방문 빠름

---

### 4. 차트 라이브러리 경량화 (선택사항)

**효과**: 번들 크기 70% 감소

**옵션 A**: Recharts → Chart.js
```
Recharts: 333KB
Chart.js: 100KB
절감:     233KB (70%)
```

**옵션 B**: Recharts → Lightweight Charts
```
Recharts:          333KB
Lightweight Charts: 50KB
절감:              283KB (85%)
```

**옵션 C**: 필요한 차트만 import
```typescript
// Before (전체 import)
import { LineChart, BarChart, PieChart } from 'recharts';

// After (필요한 것만)
import { LineChart } from 'recharts/lib/chart/LineChart';
import { Line } from 'recharts/lib/cartesian/Line';
```

---

## 🎯 즉시 적용 가능한 최적화

### Phase 1: 지연 로딩 (10분 작업)

```typescript
// frontend/src/pages/Dashboard.tsx
import React, { lazy, Suspense } from 'react';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { RecentEvents } from '../components/dashboard/RecentEvents';

// 차트 컴포넌트 지연 로딩
const DashboardCharts = lazy(() => 
  import('../components/dashboard/DashboardCharts')
);

export const Dashboard: React.FC = () => {
  return (
    <div className="bg-gray-50">
      {/* Overview Cards - 즉시 로드 */}
      <section>
        <h2>전체 개요</h2>
        <DashboardOverview />
      </section>

      {/* Charts - 지연 로드 */}
      <section>
        <h2>성과 분석</h2>
        <Suspense fallback={<ChartsSkeleton />}>
          <DashboardCharts />
        </Suspense>
      </section>

      {/* Recent Events - 즉시 로드 */}
      <section>
        <h2>실시간 활동</h2>
        <RecentEvents />
      </section>
    </div>
  );
};
```

**예상 효과**:
```
Before: 437KB 즉시 로드
After:  104KB 즉시 로드, 333KB 지연 로드
개선:   초기 로딩 76% 감소
```

---

### Phase 2: 스켈레톤 UI (5분 작업)

```typescript
// frontend/src/components/dashboard/ChartsSkeleton.tsx
export const ChartsSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);
```

---

### Phase 3: 데이터 캐싱 (5분 작업)

```typescript
// frontend/src/hooks/useTracking.ts
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: trackingApi.getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5분 캐싱
    cacheTime: 10 * 60 * 1000, // 10분 보관
  });
};
```

---

## 📊 예상 성능 개선

### Before (현재)
```
초기 로딩:        2-3초
번들 크기:        437KB
사용자 경험:      느림
```

### After (최적화 후)
```
초기 로딩:        0.5-1초 (70% 개선)
번들 크기:        104KB (초기), 333KB (지연)
사용자 경험:      빠름
```

### 측정 지표
```
FCP (First Contentful Paint):  2.5s → 0.8s
LCP (Largest Contentful Paint): 3.5s → 1.2s
TTI (Time to Interactive):      4.0s → 1.5s
```

---

## 🔧 추가 최적화 (선택사항)

### 1. 이미지 최적화
```typescript
// WebP 형식 사용
<img src="image.webp" alt="..." />

// Lazy loading
<img loading="lazy" src="..." />
```

### 2. 폰트 최적화
```html
<!-- 필요한 폰트만 로드 -->
<link rel="preload" href="/fonts/main.woff2" as="font" />
```

### 3. Service Worker 최적화
```typescript
// 중요한 리소스만 프리캐시
precacheAndRoute([
  { url: '/index.html', revision: '...' },
  { url: '/assets/main.js', revision: '...' },
  // 차트는 제외
]);
```

---

## ✅ 실행 계획

### 즉시 실행 (20분)
1. **차트 컴포넌트 지연 로딩** (10분)
2. **스켈레톤 UI 추가** (5분)
3. **데이터 캐싱 설정** (5분)

### 테스트 (10분)
1. 로컬에서 빌드 및 테스트
2. 로딩 시간 측정
3. 사용자 경험 확인

### 배포 (5분)
1. Git 커밋 및 푸시
2. Vercel 자동 배포
3. 프로덕션 확인

---

## 🎯 성공 지표

### 목표
- ✅ 초기 로딩 시간 < 1초
- ✅ 번들 크기 < 150KB (초기)
- ✅ 사용자 이탈률 감소

### 측정 방법
```
1. Chrome DevTools → Network 탭
2. "Disable cache" 체크
3. 페이지 새로고침
4. DOMContentLoaded 시간 확인
```

---

**지금 바로 최적화를 시작하겠습니다!** 🚀

---

**작성일**: 2024년 11월 15일  
**예상 소요 시간**: 20분  
**예상 개선**: 70% 빠름
