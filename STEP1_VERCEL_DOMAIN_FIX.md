# 1️⃣ 단계 1: Vercel 도메인 고정 및 CORS 업데이트

**예상 시간**: 10분  
**난이도**: 쉬움  
**위험도**: 낮음 (롤백 가능)

---

## 🎯 기대효과

### Before (현재)
```
프론트엔드 URL: 배포마다 변경 가능
CORS 설정:     수동 업데이트 필요
사용자 경험:    URL 변경 시 혼란
```

### After (작업 후)
```
프론트엔드 URL: 고정된 Production Domain
CORS 설정:     한 번만 설정하면 됨
사용자 경험:    일관된 URL 제공
```

---

## ⚠️ 주의사항 및 사이드이펙트

### ✅ 안전한 작업
- 기존 기능에 영향 없음
- 데이터 손실 없음
- 언제든지 롤백 가능
- 다운타임 없음

### ⚠️ 확인 필요
- Railway CORS 설정을 반드시 업데이트해야 함
- 업데이트 후 Railway 자동 재배포 (1-2분)
- 재배포 중 일시적으로 API 접근 불가 (1-2분)

---

## 📋 실행 단계

### Step 1: Vercel Production Domain 확인

1. **Vercel Dashboard 접속**
   ```
   https://vercel.com/dashboard
   ```

2. **frontend 프로젝트 선택**
   - 프로젝트 목록에서 "frontend" 클릭

3. **Settings 탭 이동**
   - 상단 메뉴에서 "Settings" 클릭

4. **Domains 섹션 확인**
   - 왼쪽 메뉴에서 "Domains" 클릭
   - **Production Domain** 확인 및 복사

**예상 도메인 형식:**
```
https://frontend-[project-id].vercel.app
또는
https://frontend.vercel.app (커스텀 설정 시)
```

**현재 확인된 URL들:**
- `https://frontend-cn6vtmrvd-yohans-projects-de3234df.vercel.app` (이전)
- `https://frontend-m28a3iepf-yohans-projects-de3234df.vercel.app` (이전)
- `https://frontend-beta-two-66.vercel.app` (최신?)

> 💡 **Tip**: Production Domain은 보통 가장 짧고 깔끔한 URL입니다.

---

### Step 2: Railway CORS 설정 업데이트

1. **Railway Dashboard 접속**
   ```
   https://railway.app/dashboard
   ```

2. **backend 프로젝트 선택**
   - "moodon" 또는 "backend" 프로젝트 클릭

3. **Variables 탭 이동**
   - 상단 메뉴에서 "Variables" 클릭

4. **CORS_ORIGIN 업데이트**
   
   **방법 A: 개별 편집**
   - `CORS_ORIGIN` 찾기
   - Edit 버튼 클릭
   - 새 Vercel Production Domain으로 변경
   - Save 클릭

   **방법 B: RAW Editor (권장)**
   - "RAW Editor" 버튼 클릭
   - `CORS_ORIGIN` 값 찾기
   - 새 도메인으로 변경
   - "Update Variables" 클릭

**업데이트 예시:**
```env
# Before
CORS_ORIGIN=https://frontend-m28a3iepf-yohans-projects-de3234df.vercel.app

# After (Step 1에서 확인한 도메인으로)
CORS_ORIGIN=https://frontend-beta-two-66.vercel.app
```

5. **자동 재배포 대기**
   - 환경 변수 변경 시 자동으로 재배포됩니다
   - Deployments 탭에서 진행 상황 확인
   - 약 1-2분 소요

---

### Step 3: 테스트 및 확인

1. **브라우저 캐시 삭제**
   ```
   Chrome: Ctrl+Shift+Delete (Windows) / Cmd+Shift+Delete (Mac)
   또는 시크릿 모드 사용
   ```

2. **프론트엔드 접속**
   - Step 1에서 확인한 Production Domain으로 접속
   - 페이지가 정상적으로 로드되는지 확인

3. **API 연결 테스트**
   - 브라우저 개발자 도구 열기 (F12)
   - Console 탭 확인
   - Network 탭에서 API 요청 확인
   - CORS 에러가 없는지 확인

4. **기능 테스트**
   - 대시보드 페이지 접속
   - 상품 목록 로딩 확인
   - 설정 페이지 접속
   - API 키 저장 테스트

---

## ✅ 완료 체크리스트

- [ ] Vercel Production Domain 확인 및 복사
- [ ] Railway CORS_ORIGIN 업데이트
- [ ] Railway 재배포 완료 (1-2분)
- [ ] 브라우저 캐시 삭제
- [ ] 프론트엔드 정상 접속
- [ ] 브라우저 콘솔에 CORS 에러 없음
- [ ] API 요청 정상 작동
- [ ] 상품 목록 로딩 확인

---

## 🚨 문제 발생 시 대응

### 문제 1: CORS 에러 계속 발생
```
증상: "Access to fetch at ... has been blocked by CORS policy"

해결:
1. Railway CORS_ORIGIN 값 재확인
2. 도메인 끝에 슬래시(/) 없는지 확인
3. https:// 프로토콜 포함 확인
4. Railway 재배포 완료 확인
5. 브라우저 캐시 완전 삭제
```

### 문제 2: Railway 재배포 실패
```
증상: Deployment Failed

해결:
1. Railway Deployments 탭에서 로그 확인
2. 환경 변수 문법 오류 확인
3. 이전 값으로 롤백
4. 다시 시도
```

### 문제 3: 프론트엔드 접속 안 됨
```
증상: 404 Not Found 또는 빈 페이지

해결:
1. Vercel Deployments 확인
2. Production Deployment 상태 확인
3. 도메인 URL 재확인
4. Vercel 프로젝트 설정 확인
```

---

## 🔄 롤백 방법

문제가 발생하면 이전 설정으로 되돌릴 수 있습니다:

1. **Railway Dashboard** → **Variables**
2. **CORS_ORIGIN**을 이전 값으로 변경
3. **Save** 클릭
4. 재배포 대기 (1-2분)

**이전 값 (백업):**
```
https://frontend-m28a3iepf-yohans-projects-de3234df.vercel.app
```

---

## 📝 작업 기록

### 작업 전
```
Vercel Domain: [확인 필요]
Railway CORS:  https://frontend-m28a3iepf-yohans-projects-de3234df.vercel.app
상태:          CORS 에러 가능성
```

### 작업 후
```
Vercel Domain: [Step 1에서 확인한 도메인]
Railway CORS:  [Step 1에서 확인한 도메인]
상태:          정상 작동
```

---

## 🎯 다음 단계

1단계 완료 후 다음으로 진행:
- **2단계**: Railway 콜드 스타트 개선 (UptimeRobot)
- **3단계**: 솔라피 API 실제 연동

---

**준비되셨나요? 이제 Vercel Dashboard에 접속하여 Production Domain을 확인해주세요!** 🚀

확인하신 도메인을 알려주시면, Railway CORS 설정 업데이트를 도와드리겠습니다.
