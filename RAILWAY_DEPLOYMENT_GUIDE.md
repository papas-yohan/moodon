# 🚂 Railway 배포 가이드

## ✅ 사전 준비 완료

- ✅ 로컬 테스트 통과 (13/13)
- ✅ 환경 변수 준비 완료
- ✅ GitHub 저장소 준비 완료

---

## 📋 Railway 배포 단계

### 1단계: Railway 계정 생성 (2분)

1. **https://railway.app** 접속
2. **Login with GitHub** 클릭
3. GitHub 계정으로 로그인
4. Railway 권한 승인
5. $5 무료 크레딧 자동 지급 확인

---

### 2단계: 새 프로젝트 생성 (1분)

1. Railway Dashboard에서 **New Project** 클릭
2. **Deploy from GitHub repo** 선택
3. **Configure GitHub App** 클릭 (처음인 경우)
4. **papas-yohan/moodon** 저장소 선택
5. **Deploy Now** 클릭

---

### 3단계: 서비스 설정 (2분)

#### 3.1 Root Directory 설정
```
1. 배포된 서비스 클릭
2. Settings 탭 클릭
3. "Root Directory" 찾기
4. 값 입력: backend
5. Save 클릭
```

#### 3.2 Build 설정
```
Settings → Build

Build Command: npm run vercel-build
Start Command: npm run start:prod
```

#### 3.3 Health Check 설정 (선택사항)
```
Settings → Health Check

Health Check Path: /api/v1/health
Health Check Timeout: 300
```

---

### 4단계: 환경 변수 설정 (3분)

#### 방법 1: Raw Editor (권장)

1. **Variables** 탭 클릭
2. **RAW Editor** 클릭
3. 다음 내용 복사하여 붙여넣기:

```env
DATABASE_URL=postgresql://postgres.jtdrqyyzeaamogbxtelj:Yohan0817**@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
SOLAPI_API_KEY=NCSM4OQZXGZLFBWW
SOLAPI_API_SECRET=HIUEVKUJFFJTODQ1QB1J57ARFO1N9JPM
SOLAPI_SENDER=01042151128
CLOUDINARY_CLOUD_NAME=djxrffrjfg
CLOUDINARY_API_KEY=222333877835831
CLOUDINARY_API_SECRET=QS25mKuuOqzZODDZPNvIji308aA
ENCRYPTION_KEY=3ygDe7hSi2KX3VZAnyVR7aitfpHc8pSR
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://frontend-5pz96qdgt-yohans-projects-de3234df.vercel.app
```

4. **Update Variables** 클릭

#### 방법 2: 개별 입력

각 변수를 하나씩 추가:
- **New Variable** 클릭
- Variable Name 입력
- Value 입력
- **Add** 클릭
- 11개 변수 모두 반복

---

### 5단계: 재배포 (1분)

환경 변수 설정 후 자동으로 재배포됩니다.

**진행 상황 확인:**
1. **Deployments** 탭 클릭
2. 최신 배포 상태 확인
3. 로그 확인 (Build Logs, Deploy Logs)

**예상 시간:** 2-3분

---

### 6단계: 배포 URL 확인 (1분)

#### 6.1 도메인 확인
```
1. Settings 탭 클릭
2. Domains 섹션 찾기
3. 자동 생성된 URL 확인
   예: https://moodon-backend-production.up.railway.app
```

#### 6.2 Public Networking 활성화
```
Settings → Networking

Public Networking: ON (기본값)
```

#### 6.3 배포 테스트
```bash
# 터미널에서 테스트
curl https://your-app.railway.app/api/v1/health

# 예상 응답
{"status":"ok","timestamp":"2025-11-10T..."}
```

---

### 7단계: 프론트엔드 URL 업데이트 (2분)

#### 7.1 Railway URL 복사
```
예: https://moodon-backend-production.up.railway.app
```

#### 7.2 프론트엔드 환경 변수 수정
```bash
# frontend/.env.production 파일 수정
VITE_API_URL=https://moodon-backend-production.up.railway.app/api/v1
```

#### 7.3 프론트엔드 재배포
```bash
cd frontend
npm run build
vercel --prod --yes
```

---

### 8단계: 전체 시스템 테스트 (5분)

#### 8.1 프론트엔드 접속
```
새 Vercel URL 접속
예: https://frontend-xxxxx.vercel.app
```

#### 8.2 기능 테스트
```
1. 대시보드 로딩 확인
2. 상품 목록 확인
3. 연락처 목록 확인
4. 설정 페이지 확인
```

#### 8.3 API 테스트
```bash
# 백엔드 직접 테스트
curl https://your-app.railway.app/api/v1/products
curl https://your-app.railway.app/api/v1/contacts
curl https://your-app.railway.app/api/v1/tracking/stats
```

---

## 🎯 배포 완료 체크리스트

### Railway 설정
- [ ] 계정 생성 완료
- [ ] GitHub 저장소 연결
- [ ] Root Directory: backend
- [ ] Build Command 설정
- [ ] Start Command 설정
- [ ] 환경 변수 11개 설정
- [ ] 배포 성공 확인
- [ ] 도메인 URL 확인

### 프론트엔드 업데이트
- [ ] Railway URL 복사
- [ ] .env.production 수정
- [ ] Vercel 재배포
- [ ] 새 URL 접속 확인

### 테스트
- [ ] 백엔드 Health Check
- [ ] 프론트엔드 로딩
- [ ] API 연결 확인
- [ ] 데이터베이스 연결 확인

---

## 🔧 문제 해결

### 문제 1: 빌드 실패

**증상:**
```
Build failed
npm ERR! code ELIFECYCLE
```

**해결:**
```
1. Deployments → 최신 배포 → Build Logs 확인
2. package.json 확인
3. Root Directory가 "backend"인지 확인
4. 환경 변수 확인
```

### 문제 2: 시작 실패

**증상:**
```
Application failed to respond
```

**해결:**
```
1. Deploy Logs 확인
2. DATABASE_URL 확인
3. PORT 환경 변수 확인 (3000)
4. Start Command 확인: npm run start:prod
```

### 문제 3: 데이터베이스 연결 오류

**증상:**
```
P1001: Can't reach database server
```

**해결:**
```
1. DATABASE_URL 확인
2. Supabase 프로젝트 상태 확인
3. 비밀번호 특수문자 인코딩 확인
```

### 문제 4: CORS 오류

**증상:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**해결:**
```
1. CORS_ORIGIN 환경 변수 확인
2. 프론트엔드 URL이 정확한지 확인
3. Railway 재배포
```

---

## 💰 비용 확인

### Railway Dashboard에서 확인

```
1. 왼쪽 메뉴 → Usage
2. Current Usage 확인
3. Estimated Cost 확인
```

### 예상 비용 (512MB, 0.5 vCPU)

```
무료 크레딧: $5/월
예상 사용량: ~$3-5/월

크레딧으로 충분히 커버 가능!
```

---

## 📊 모니터링

### Railway Dashboard

```
1. Metrics 탭
   - CPU 사용률
   - 메모리 사용률
   - 네트워크 트래픽

2. Logs 탭
   - 실시간 로그
   - 에러 로그
   - 액세스 로그

3. Deployments 탭
   - 배포 히스토리
   - 빌드 로그
   - 배포 로그
```

---

## 🎉 배포 완료!

### 최종 구성

```
┌─────────────────────────────────────┐
│         사용자 브라우저              │
└─────────────────────────────────────┘
                 │
                 ├─────────────────────┐
                 │                     │
                 ▼                     ▼
         ┌──────────────┐      ┌──────────────┐
         │   Vercel     │      │   Railway    │
         │ (프론트엔드)  │      │  (백엔드)    │
         │              │      │              │
         │ 무료         │      │ $5 크레딧    │
         └──────────────┘      └──────────────┘
                                       │
                 ┌─────────────────────┼─────────────────────┐
                 │                     │                     │
                 ▼                     ▼                     ▼
         ┌──────────────┐      ┌──────────────┐    ┌──────────────┐
         │  Supabase    │      │ Cloudinary   │    │   Solapi     │
         │   무료       │      │   무료       │    │  사용량 과금  │
         └──────────────┘      └──────────────┘    └──────────────┘
```

### 배포 URL

```
프론트엔드: https://frontend-xxxxx.vercel.app
백엔드: https://your-app.railway.app
API: https://your-app.railway.app/api/v1
```

### 다음 단계

1. ✅ 전체 시스템 테스트
2. 📱 실제 메시지 발송 테스트
3. 📊 모니터링 설정
4. 📚 사용자 가이드 작성

---

## 📞 지원

### Railway 지원
- 문서: https://docs.railway.app
- Discord: https://discord.gg/railway
- 이메일: team@railway.app

### 프로젝트 문의
- GitHub: https://github.com/papas-yohan/moodon
- 이슈: GitHub Issues

---

**작성일**: 2025-11-10  
**예상 소요 시간**: 20분  
**난이도**: 초급  
**상태**: 준비 완료
