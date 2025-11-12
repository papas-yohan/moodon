# 🔓 Vercel Deployment Protection 해제 가이드

## ⚠️ 현재 문제

백엔드 API가 **401 Unauthorized** 오류를 반환하고 있습니다.
이는 Vercel의 **Deployment Protection**이 활성화되어 있기 때문입니다.

**증상:**
- 프론트엔드에서 CORS 오류 발생
- 백엔드 API 호출 시 401 오류
- "Access to XMLHttpRequest has been blocked by CORS policy"

---

## 🎯 해결 방법: Deployment Protection 비활성화

### 1단계: Vercel Dashboard 접속

1. **https://vercel.com/dashboard** 접속
2. 로그인 (GitHub 계정)

### 2단계: Backend 프로젝트 선택

1. 프로젝트 목록에서 **backend** 클릭
2. 또는 직접 링크: https://vercel.com/yohans-projects-de3234df/backend

### 3단계: Settings 이동

1. 상단 탭에서 **Settings** 클릭
2. 왼쪽 메뉴에서 **Deployment Protection** 클릭

### 4단계: Protection 설정 변경

**옵션 A: 완전히 비활성화 (권장)**
```
Vercel Authentication: OFF
```
- "Vercel Authentication" 토글을 **OFF**로 변경
- 모든 사용자가 API에 접근 가능

**옵션 B: Standard Protection**
```
Protection Method: Standard Protection
Allowed Domains: frontend-5pz96qdgt-yohans-projects-de3234df.vercel.app
```
- 특정 도메인만 허용

### 5단계: 저장 및 재배포

1. **Save** 버튼 클릭
2. 자동으로 재배포됨 (약 30초 소요)

---

## ✅ 확인 방법

### 터미널에서 확인:
```bash
curl https://backend-k4c7vvkgh-yohans-projects-de3234df.vercel.app/api/v1/health
```

**성공 시 응답:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T..."
}
```

**실패 시 응답:**
```html
<!doctype html>...Authentication Required...
```

### 브라우저에서 확인:

1. 프론트엔드 접속: https://frontend-5pz96qdgt-yohans-projects-de3234df.vercel.app
2. 개발자 도구 (F12) → Console 탭
3. CORS 오류가 사라졌는지 확인
4. 대시보드 데이터가 로드되는지 확인

---

## 🔍 스크린샷 가이드

### Deployment Protection 설정 화면:

```
Settings → Deployment Protection

┌─────────────────────────────────────────┐
│ Vercel Authentication                   │
│                                         │
│ [Toggle: OFF] ← 이것을 OFF로 변경       │
│                                         │
│ Protect your deployments from          │
│ unauthorized access                     │
└─────────────────────────────────────────┘

또는

┌─────────────────────────────────────────┐
│ Protection Method                       │
│                                         │
│ ○ Vercel Authentication (Default)      │
│ ● Standard Protection ← 이것 선택       │
│ ○ All Deployments                       │
└─────────────────────────────────────────┘
```

---

## 💡 추가 정보

### Deployment Protection이란?

Vercel의 보안 기능으로, 배포된 애플리케이션에 대한 접근을 제한합니다.

**종류:**
1. **Vercel Authentication**: Vercel 계정으로 로그인 필요
2. **Standard Protection**: 특정 도메인만 허용
3. **All Deployments**: 모든 접근 허용 (Protection 없음)

### Moodon에 적합한 설정:

**개발/테스트 단계:**
- **All Deployments** (Protection 없음)
- 빠른 테스트 가능

**프로덕션 단계:**
- **Standard Protection** + 커스텀 도메인
- 또는 백엔드에서 API 키 인증 구현

---

## 🚨 문제 해결

### 문제 1: "Settings 메뉴가 보이지 않음"
**원인:** 프로젝트 권한 부족

**해결:**
- 프로젝트 소유자 계정으로 로그인
- 또는 팀 멤버에게 Admin 권한 요청

### 문제 2: "저장 후에도 401 오류 발생"
**원인:** 캐시 또는 이전 배포

**해결:**
```bash
# 강제 재배포
cd backend
vercel --prod --force --yes
```

### 문제 3: "CORS 오류는 사라졌지만 데이터가 안 보임"
**원인:** 데이터베이스 연결 또는 환경 변수 문제

**해결:**
1. Vercel Dashboard → backend → Settings → Environment Variables
2. DATABASE_URL 확인
3. 다른 환경 변수 확인

---

## 📞 도움이 필요하면

1. Vercel 공식 문서: https://vercel.com/docs/security/deployment-protection
2. 현재 배포 URL:
   - 백엔드: https://backend-k4c7vvkgh-yohans-projects-de3234df.vercel.app
   - 프론트엔드: https://frontend-5pz96qdgt-yohans-projects-de3234df.vercel.app

---

**작성일:** 2025-11-10  
**우선순위:** 🔴 긴급 (배포 완료를 위해 필수)
