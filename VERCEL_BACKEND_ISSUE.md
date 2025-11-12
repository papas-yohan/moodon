# ⚠️ Vercel 백엔드 배포 이슈

## 문제 상황

NestJS 백엔드를 Vercel Serverless Functions로 배포하는 것이 복잡합니다.

### 발생한 오류
```
FUNCTION_INVOCATION_FAILED
```

## 원인

1. **Vercel Serverless Functions의 제한사항**
   - 각 함수는 독립적으로 실행됨
   - NestJS는 전체 앱을 하나의 프로세스로 실행하도록 설계됨
   - Prisma, BullMQ 등이 Serverless 환경에서 제대로 작동하지 않을 수 있음

2. **데이터베이스 연결**
   - Serverless 함수는 매 요청마다 새로운 연결을 생성
   - Connection pooling이 제대로 작동하지 않음

3. **파일 시스템**
   - Vercel Serverless는 읽기 전용 파일 시스템
   - 이미지 업로드/처리가 제한적

## 해결 방안

### 옵션 1: Railway 사용 (권장) ⭐

**장점:**
- NestJS 완벽 지원
- PostgreSQL 내장
- Redis 지원
- 파일 시스템 사용 가능
- 무료 티어: $5 크레딧/월

**배포 방법:**
```bash
# 1. Railway 계정 생성
https://railway.app

# 2. GitHub 연결
New Project → Deploy from GitHub

# 3. 환경 변수 설정
Settings → Variables → 모든 환경 변수 추가

# 4. 자동 배포
Git push → 자동 배포
```

### 옵션 2: Render 사용

**장점:**
- NestJS 지원
- PostgreSQL 무료
- 무료 티어 있음

**단점:**
- 무료 티어는 15분 후 슬립 모드

### 옵션 3: Vercel + Supabase Edge Functions

**복잡도:** 높음
**권장하지 않음**

### 옵션 4: 로컬 개발 + 나중에 배포

**현재 권장 방안:**
1. 로컬에서 백엔드 실행
2. 프론트엔드만 Vercel 배포
3. 프론트엔드에서 로컬 백엔드 연결 (개발용)
4. 나중에 Railway로 백엔드 배포

## 즉시 실행 가능한 해결책

### A. 로컬 백엔드 + Vercel 프론트엔드

```bash
# 1. 로컬에서 백엔드 실행
cd backend
npm run start:dev

# 2. 프론트엔드 환경 변수 수정
# frontend/.env.production
VITE_API_URL=http://localhost:3000/api/v1

# 3. 프론트엔드 재배포
cd frontend
npm run build
vercel --prod
```

**장점:** 즉시 테스트 가능
**단점:** 외부에서 접근 불가

### B. ngrok으로 로컬 백엔드 공개

```bash
# 1. ngrok 설치
brew install ngrok  # macOS
# 또는 https://ngrok.com/download

# 2. 로컬 백엔드 실행
cd backend
npm run start:dev

# 3. ngrok으로 공개
ngrok http 3000

# 4. ngrok URL을 프론트엔드에 설정
# frontend/.env.production
VITE_API_URL=https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/v1

# 5. 프론트엔드 재배포
cd frontend
npm run build
vercel --prod
```

**장점:** 외부에서 접근 가능
**단점:** ngrok 세션이 종료되면 URL 변경됨

### C. Railway로 백엔드 배포 (최종 권장)

```bash
# 1. Railway 계정 생성
https://railway.app

# 2. New Project → Deploy from GitHub
# 3. backend 폴더 선택
# 4. 환경 변수 설정 (10개)
# 5. 배포 완료

# 6. Railway URL을 프론트엔드에 설정
# frontend/.env.production
VITE_API_URL=https://your-app.railway.app/api/v1

# 7. 프론트엔드 재배포
cd frontend
npm run build
vercel --prod
```

## 권장 진행 순서

### 즉시 (오늘)
1. **로컬 백엔드 + Vercel 프론트엔드**
   - 로컬에서 전체 시스템 테스트
   - 모든 기능 검증

### 단기 (1-2일)
2. **Railway 배포**
   - 백엔드를 Railway로 이전
   - 프론트엔드 URL 업데이트
   - 전체 시스템 재테스트

### 중기 (1주일)
3. **최적화**
   - 성능 모니터링
   - 에러 추적 (Sentry)
   - 로그 시스템

## Railway 배포 가이드

### 1. 계정 생성
```
1. https://railway.app 접속
2. GitHub로 로그인
3. 무료 $5 크레딧 받기
```

### 2. 프로젝트 생성
```
1. New Project 클릭
2. Deploy from GitHub Repo 선택
3. moodon 저장소 선택
4. backend 폴더 선택
```

### 3. 환경 변수 설정
```
Settings → Variables → Raw Editor

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
```

### 4. 빌드 설정
```
Settings → Build

Build Command: npm run vercel-build
Start Command: npm run start:prod
```

### 5. 배포 확인
```
Deployments → 최신 배포 확인
Logs → 에러 확인
```

### 6. 도메인 확인
```
Settings → Domains
예: https://moodon-backend-production.up.railway.app
```

## 비용 비교

### Vercel (현재)
```
프론트엔드: 무료
백엔드: 작동 안 함 ❌
```

### Railway
```
프론트엔드: Vercel 무료
백엔드: $5 크레딧/월 (무료)
데이터베이스: Supabase 무료
총: 무료 (크레딧 소진 시 ~$5/월)
```

### Render
```
프론트엔드: Vercel 무료
백엔드: 무료 (슬립 모드)
데이터베이스: Supabase 무료
총: 무료
```

## 결론

**즉시 실행:**
- 로컬 백엔드로 전체 시스템 테스트

**최종 배포:**
- Railway로 백엔드 배포 (권장)
- 또는 Render 사용

**Vercel 백엔드는 권장하지 않음**

---

**작성일**: 2025-11-10  
**상태**: Railway 배포 권장
