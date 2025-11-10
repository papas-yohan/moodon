# 🚀 Moodon 배포 가이드 (Vercel + Supabase + Cloudinary)

## 📋 배포 개요

### 선택한 스택
- **프론트엔드**: Vercel (무료)
- **백엔드**: Vercel Serverless (무료)
- **데이터베이스**: Supabase PostgreSQL (무료 500MB)
- **이미지 스토리지**: Cloudinary (무료 25GB)
- **메시지 발송**: Solapi (종량제)

### 예상 소요 시간
- 전체: 2-3시간
- 각 단계: 20-30분

---

## 📝 사전 준비 체크리스트

### 필요한 계정
- [ ] GitHub 계정
- [ ] Vercel 계정 (github.com으로 가입)
- [ ] Supabase 계정
- [ ] Cloudinary 계정
- [ ] Solapi 계정 (이미 있음)

### 로컬 환경 백업
```bash
# 현재 데이터베이스 백업
cp backend/prisma/dev.db backend/prisma/dev.db.backup

# 업로드된 파일 백업
tar -czf uploads_backup.tar.gz backend/uploads/
```

---

## 1단계: GitHub 저장소 생성 (10분)

### 1.1 Git 초기화 및 커밋
```bash
# Git 초기화 (아직 안 했다면)
git init

# .gitignore 확인
# node_modules, .env, uploads 등이 포함되어 있는지 확인

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: Moodon MVP complete"
```

### 1.2 GitHub 저장소 생성
1. https://github.com/new 접속
2. Repository name: `moodon`
3. Private 선택 (권장)
4. Create repository 클릭

### 1.3 원격 저장소 연결
```bash
# GitHub 저장소 URL로 변경
git remote add origin https://github.com/YOUR_USERNAME/moodon.git
git branch -M main
git push -u origin main
```

---

## 2단계: Supabase 데이터베이스 설정 (20분)

### 2.1 Supabase 프로젝트 생성
1. https://supabase.com 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `moodon`
   - Database Password: **강력한 비밀번호 생성 (저장 필수!)**
   - Region: `Northeast Asia (Seoul)` 선택
4. Create new project 클릭 (2-3분 소요)

### 2.2 데이터베이스 URL 확인
1. Project Settings → Database 메뉴
2. Connection string → URI 복사
3. 형식: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres`

### 2.3 Prisma 스키마 PostgreSQL로 변경
```prisma
// backend/prisma/schema.prisma
datasource db {
  provider = "postgresql"  // sqlite에서 변경
  url      = env("DATABASE_URL")
}
```

### 2.4 로컬에서 마이그레이션 테스트
```bash
cd backend

# DATABASE_URL 환경 변수 설정 (임시)
export DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Prisma 마이그레이션 생성
npx prisma migrate dev --name init

# 마이그레이션 확인
npx prisma studio
```

---

## 3단계: Cloudinary 설정 (15분)

### 3.1 Cloudinary 계정 생성
1. https://cloudinary.com/users/register/free 접속
2. 무료 계정 생성
3. Email 인증 완료

### 3.2 API 키 확인
1. Dashboard 접속
2. Account Details 섹션에서 확인:
   - Cloud Name
   - API Key
   - API Secret
3. **안전한 곳에 저장!**

### 3.3 Cloudinary SDK 설치
```bash
cd backend
npm install cloudinary
```

### 3.4 Storage Service 수정
새로운 Cloudinary Storage Service 생성 필요

---

## 4단계: 백엔드 배포 준비 (30분)

### 4.1 환경 변수 파일 생성
```bash
# backend/.env.production
DATABASE_URL="postgresql://..."
SOLAPI_API_KEY="your-api-key"
SOLAPI_API_SECRET="your-api-secret"
SOLAPI_SENDER="01042151128"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
ENCRYPTION_KEY="your-32-character-encryption-key"
```

### 4.2 Vercel 설정 파일 생성
```json
// backend/vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 4.3 package.json 수정
```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main",
    "vercel-build": "prisma generate && prisma migrate deploy && npm run build"
  }
}
```

---

## 5단계: 프론트엔드 배포 준비 (20분)

### 5.1 환경 변수 파일 생성
```bash
# frontend/.env.production
VITE_API_URL=https://your-backend.vercel.app/api/v1
```

### 5.2 Vercel 설정 파일 생성
```json
// frontend/vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 6단계: Vercel 배포 (30분)

### 6.1 Vercel CLI 설치
```bash
npm install -g vercel
```

### 6.2 백엔드 배포
```bash
cd backend
vercel login
vercel --prod

# 프롬프트에 따라 입력:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? moodon-backend
# - Directory? ./
# - Override settings? N
```

### 6.3 백엔드 환경 변수 설정
```bash
# Vercel Dashboard에서 설정
# Project Settings → Environment Variables

DATABASE_URL=postgresql://...
SOLAPI_API_KEY=...
SOLAPI_API_SECRET=...
SOLAPI_SENDER=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ENCRYPTION_KEY=...
```

### 6.4 프론트엔드 배포
```bash
cd frontend
vercel --prod

# 백엔드 URL을 환경 변수로 설정
# VITE_API_URL=https://moodon-backend.vercel.app/api/v1
```

---

## 7단계: 배포 후 확인 (20분)

### 7.1 백엔드 Health Check
```bash
curl https://your-backend.vercel.app/api/v1/health
```

### 7.2 프론트엔드 접속
```
https://your-frontend.vercel.app
```

### 7.3 기능 테스트
- [ ] 로그인/회원가입
- [ ] 상품 등록
- [ ] 이미지 업로드 (Cloudinary)
- [ ] 이미지 합성
- [ ] 연락처 추가
- [ ] 메시지 발송 (MMS 이미지 포함!)
- [ ] 통계 확인

---

## 8단계: 도메인 연결 (선택사항, 10분)

### 8.1 커스텀 도메인 설정
1. Vercel Dashboard → Domains
2. Add Domain 클릭
3. 도메인 입력 (예: moodon.com)
4. DNS 설정 (Vercel 안내 따라 진행)

---

## 🔧 문제 해결

### 데이터베이스 연결 오류
```bash
# Supabase 연결 확인
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
```

### 이미지 업로드 실패
```bash
# Cloudinary 설정 확인
curl -X POST https://api.cloudinary.com/v1_1/[CLOUD_NAME]/image/upload \
  -F "file=@test.jpg" \
  -F "api_key=[API_KEY]" \
  -F "timestamp=$(date +%s)" \
  -F "signature=[SIGNATURE]"
```

### Vercel 빌드 실패
```bash
# 로컬에서 프로덕션 빌드 테스트
npm run build
npm run start:prod
```

---

## 📊 예상 비용

### 무료 티어 한도
- Vercel: 100GB 대역폭/월
- Supabase: 500MB 저장소, 2GB 전송/월
- Cloudinary: 25GB 저장소, 25GB 대역폭/월
- Solapi: 종량제 (SMS 20원, LMS 50원, MMS 200원)

### 월 1,000건 발송 시
- 호스팅: 무료
- 메시지: 약 20,000원 (LMS 기준)
- **총: 약 20,000원/월**

---

## ✅ 배포 완료 체크리스트

- [ ] GitHub 저장소 생성 및 푸시
- [ ] Supabase 데이터베이스 생성
- [ ] Cloudinary 계정 생성
- [ ] 백엔드 Vercel 배포
- [ ] 프론트엔드 Vercel 배포
- [ ] 환경 변수 설정
- [ ] 데이터베이스 마이그레이션
- [ ] 기능 테스트 완료
- [ ] MMS 이미지 발송 테스트 완료

---

## 🎉 배포 완료!

축하합니다! Moodon이 성공적으로 배포되었습니다.

### 다음 단계
1. 실제 고객 데이터 입력
2. 실제 상품 등록
3. 메시지 발송 테스트
4. 통계 모니터링

### 유지보수
- 정기적인 백업
- 로그 모니터링
- 성능 최적화
- 보안 업데이트

---

**작성일**: 2025-11-08  
**버전**: 1.0.0  
**작성자**: Kiro AI
