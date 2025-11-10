# 📱 모바일 최적화 가이드

## 🎯 최적화 목표

1. **터치 친화적 UI**: 최소 44x44px 터치 영역
2. **반응형 디자인**: 모든 화면 크기 지원
3. **빠른 로딩**: 모바일 네트워크 최적화
4. **오프라인 지원**: PWA 기능 활용
5. **네이티브 앱 경험**: 제스처 및 애니메이션

## 🔧 구현된 기능

### 1. 반응형 네비게이션
- **데스크톱**: 수평 네비게이션 바
- **모바일**: 햄버거 메뉴 + 슬라이드 메뉴
- **터치 최적화**: 44px 이상 터치 영역

```typescript
// 사용 예시
<Navigation />
```

### 2. 터치 제스처 지원
- **스와이프**: 좌우/상하 스와이프 감지
- **풀 투 리프레시**: 아래로 당겨서 새로고침
- **햅틱 피드백**: 터치 피드백 (지원 디바이스)

```typescript
// 스와이프 훅 사용
const swipeHandlers = useSwipe({
  onSwipeLeft: () => console.log('왼쪽 스와이프'),
  onSwipeRight: () => console.log('오른쪽 스와이프'),
});

<div {...swipeHandlers}>
  스와이프 가능한 영역
</div>
```

### 3. 반응형 테이블
- **데스크톱**: 전통적인 테이블 뷰
- **모바일**: 카드 뷰로 자동 전환
- **터치 최적화**: 큰 터치 영역

```typescript
<ResponsiveTable
  data={products}
  columns={columns}
  keyExtractor={(item) => item.id}
  onRowClick={handleClick}
/>
```

### 4. 미디어 쿼리 훅
```typescript
// 브레이크포인트 감지
const { isMobile, isTablet, isDesktop } = useBreakpoint();

// 화면 방향 감지
const { isPortrait, isLandscape } = useOrientation();

// 다크 모드 선호도
const prefersDark = usePrefersDarkMode();
```

### 5. 모바일 유틸리티
```typescript
import { 
  isMobile, 
  isTouchDevice, 
  vibrate,
  lockScroll,
  unlockScroll 
} from '@/utils/mobile';

// 디바이스 감지
if (isMobile()) {
  // 모바일 전용 로직
}

// 햅틱 피드백
vibrate(10); // 10ms 진동

// 스크롤 잠금 (모달 열 때)
lockScroll();
```

## 📐 반응형 브레이크포인트

```css
/* Tailwind CSS 기준 */
sm: 640px   /* 태블릿 */
md: 768px   /* 태블릿 가로 */
lg: 1024px  /* 데스크톱 */
xl: 1280px  /* 대형 데스크톱 */
2xl: 1536px /* 초대형 데스크톱 */
```

## 🎨 모바일 UI 패턴

### 카드 레이아웃
```tsx
<div className="mobile-card">
  <div className="mobile-card-header">
    <h3>제목</h3>
    <button>액션</button>
  </div>
  <div className="mobile-card-content">
    <div className="mobile-card-row">
      <span className="mobile-card-label">라벨</span>
      <span className="mobile-card-value">값</span>
    </div>
  </div>
</div>
```

### 모바일 모달
```tsx
<div className="mobile-modal">
  <div className="mobile-modal-header">
    <button onClick={onClose}>닫기</button>
    <h2>제목</h2>
    <button onClick={onSave}>저장</button>
  </div>
  <div className="mobile-modal-content">
    {/* 콘텐츠 */}
  </div>
</div>
```

## 🚀 성능 최적화

### 1. 이미지 최적화
- **지연 로딩**: `loading="lazy"` 속성
- **반응형 이미지**: `srcset` 사용
- **WebP 형식**: 지원 브라우저에서 사용

```tsx
<img
  src="/image.jpg"
  srcSet="/image-320w.jpg 320w, /image-640w.jpg 640w"
  sizes="(max-width: 640px) 100vw, 640px"
  loading="lazy"
  alt="설명"
/>
```

### 2. 터치 스크롤 최적화
```tsx
<div className="touch-scroll overflow-y-auto">
  {/* 스크롤 가능한 콘텐츠 */}
</div>
```

### 3. 입력 필드 최적화
```tsx
{/* iOS 자동 줌 방지 */}
<input
  type="text"
  className="text-base" // 16px 이상
  inputMode="numeric" // 숫자 키패드
  autoComplete="tel" // 자동완성
/>
```

## 📱 PWA 기능

### 설치 가능
- **홈 화면 추가**: 앱처럼 설치 가능
- **스플래시 스크린**: 앱 시작 화면
- **아이콘**: 다양한 크기 지원

### 오프라인 지원
- **서비스 워커**: 리소스 캐싱
- **오프라인 페이지**: 네트워크 없을 때 표시
- **백그라운드 동기화**: 연결 복구 시 자동 동기화

### 푸시 알림 (향후 추가 예정)
- **알림 권한**: 사용자 동의 후 활성화
- **백그라운드 알림**: 앱 닫혀있어도 수신

## 🔍 테스트 가이드

### 모바일 디바이스 테스트
1. **Chrome DevTools**: 디바이스 모드 (F12 → Toggle device toolbar)
2. **실제 디바이스**: USB 디버깅 또는 ngrok
3. **BrowserStack**: 다양한 디바이스 테스트

### 체크리스트
- [ ] 모든 버튼이 44x44px 이상
- [ ] 텍스트가 16px 이상 (자동 줌 방지)
- [ ] 가로/세로 모드 모두 정상 동작
- [ ] 터치 제스처 정상 동작
- [ ] 오프라인 모드 정상 동작
- [ ] 로딩 속도 3초 이내
- [ ] 스크롤 부드럽게 동작

## 🎯 접근성 (a11y)

### 터치 접근성
- **최소 터치 영역**: 44x44px
- **터치 피드백**: 시각적 피드백 제공
- **제스처 대안**: 버튼으로도 동일 기능 제공

### 스크린 리더
- **ARIA 레이블**: 모든 인터랙티브 요소
- **시맨틱 HTML**: 적절한 태그 사용
- **키보드 네비게이션**: Tab 키로 이동 가능

## 📊 성능 메트릭

### 목표 지표
- **First Contentful Paint**: < 1.5초
- **Time to Interactive**: < 3초
- **Largest Contentful Paint**: < 2.5초
- **Cumulative Layout Shift**: < 0.1

### 측정 도구
- **Lighthouse**: Chrome DevTools
- **WebPageTest**: 실제 디바이스 테스트
- **Google PageSpeed Insights**: 온라인 분석

## 🐛 알려진 이슈 및 해결방법

### iOS Safari
- **100vh 문제**: `min-height: -webkit-fill-available` 사용
- **입력 필드 줌**: `font-size: 16px` 이상 사용
- **스크롤 바운스**: `overscroll-behavior: contain` 사용

### Android Chrome
- **주소창 숨김**: 스크롤 시 자동 숨김
- **뒤로가기 버튼**: 히스토리 관리 필요
- **키보드 높이**: `visualViewport` API 사용

## 🔄 다음 단계

### 단기 (1-2주)
- [ ] 다크 모드 지원
- [ ] 오프라인 페이지 개선
- [ ] 푸시 알림 구현

### 중기 (1개월)
- [ ] 네이티브 앱 기능 추가
- [ ] 고급 제스처 지원
- [ ] 성능 모니터링 대시보드

### 장기 (3개월)
- [ ] 네이티브 앱 변환 (React Native)
- [ ] 앱 스토어 배포
- [ ] 고급 오프라인 기능

## 📚 참고 자료

- [MDN - Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Google - Mobile Web Best Practices](https://developers.google.com/web/fundamentals/design-and-ux/principles)
- [Apple - iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design - Mobile](https://material.io/design/platform-guidance/android-mobile.html)

---

**마지막 업데이트**: 2025-11-06  
**버전**: 1.0.0