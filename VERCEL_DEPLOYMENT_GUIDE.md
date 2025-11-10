# 🚀 Vercel 배포 가이드

## 📋 목차
1. [배포 아키텍처](#배포-아키텍처)
2. [사전 준비](#사전-준비)
3. [데이터베이스 설정](#데이터베이스-설정)
4. [백엔드 배포](#백엔드-배포)
5. [프론트엔드 배포](#프론트엔드-배포)
6. [환경 변수 설정](#환경-변수-설정)
7. [도메인 설정](#도메인-설정)
8. [배포 후 확인](#배포-후-확인)
9. [문제 해결](#문제-해결)

---

## 배포 아키텍처

### 전체 구조
```
┌─────────────────┐
│   사용자        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vercel CDN     │  ← 프론트엔드 (React)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vercel         │  ← 백엔드 (NestJS)
│  Serverless     │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌─────────────┐  ┌──────────────┐
│  Supabase   │  │   Solapi     │
│  (Database) │  │   (SMS/MMS)  │
└─────────────┘  └──────────────┘
```

### 주요 서비스

| 서비스 | 용도 | 비용 |
|--------|------|------|
| **Vercel** | 프론트엔드 + 백엔드 호스팅 | 무료 (Hobby) |
| **Supabase** | PostgreSQL 데이터베이스 | 무료 (500MB) |
| **Solapi** | SMS/MMS/카카오톡 발송 | 종량제 |
| **Cloudinary** (선택) | 이미지 스토리지 | 무료 (25GB) |

---

## 사전 준비

### 1. 필수 계정 생성

#### Vercel 계정
```
1. https://vercel.com 접속
2. GitHub 계정으로 로그인
3. 프로젝트 연동 준비
```

#### Supabase 계정
```
1. https://supabase.com 접속
2. GitHub 계정으로 로그인
3. 새 프로젝트 생성 준비
```

#### Solapi 계정 (이미 생성했다면 스킵)
```
1. https://solapi.com 접속
2. 회원가입 및 본인인증
3. API 키 발급
```

### 2. GitHub 저장소 준비

```bash
# 1. GitHub에 새 저장소 생성
# https://github.com/new

# 2. 로컬 프로젝트를 GitHub에 푸시
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## 데이터베이스 설정

### 1. Supabase 프로젝트 생성

1. **Supabase 대시보드 접속**
   ```
   https://app.supabase.com
   ```

2. **새 프로젝트 생성**
   - Project name: `moodon-db` (원하는 이름)
   - Database Password: 강력한 비밀번호 생성 (저장 필수!)
   - Region: `Northeast Asia (Seoul)` 선택
   - Pricing Plan: `Free` 선택

3. **데이터베이스 URL 확인**
   - 프로젝트 생성 완료 후
   - Settings → Database → Connection string
   - `postgresql://postgres:[YOUR-PASSWORD]@[HOST]/postgres` 복사

### 2. 데이터베이스 마이그레이션

#### 로컬에서 스키마 생성

```bash
# 1. Supabase URL을 환경 변수로 설정
cd backend
echo "DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[HOST]/postgres" > .env.production

# 2. Prisma 마이그레이션 실행
npx prisma migrate deploy

# 3. Prisma Client 생성
npx prisma generate
```

#### 또는 Supabase SQL Editor 사용

1. **Supabase 대시보드**
   - SQL Editor 메뉴 선택
   - New query 클릭

2. **스키마 생성 SQL 실행**
   ```sql
   -- backend/prisma/migrations 폴더의 SQL 파일 내용을 복사하여 실행
   ```

---

## 백엔드 배포

### 1. Vercel 프로젝트 생성

1. **Vercel 대시보드 접속**
   ```
   https://vercel.com/dashboard
   ```

2. **New Project 클릭**
   - Import Git Repository
   - GitHub 저장소 선택
   - Root Directory: `backend` 설정

3. **프로젝트 설정**
   ```
   Framework Preset: Other
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

### 2. 환경 변수 설정

Vercel 프로젝트 설정 → Environment Variables에서 추가:

```bash
# 데이터베이스
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]/postgres

# 솔라피 API (설정 페이지에서 입력 가능하므로 선택사항)
SOLAPI_API_KEY=your-api-key
SOLAPI_API_SECRET=your-api-secret
SOLAPI_SENDER=01012345678
SOLAPI_KAKAO_PFID=@yourkakaoid

# 암호화 키 (랜덤 문자열 생성)
ENCRYPTION_KEY=your-random-encryption-key-min-32-chars

# 애플리케이션 URL (프론트엔드 URL)
APP_URL=https://your-frontend-domain.vercel.app

# Node 환경
NODE_ENV=production

# 포트 (Vercel은 자동 설정)
PORT=3000
```

### 3. vercel.json 설정

`backend/vercel.json` 파일 생성:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 4. package.json 수정

`backend/package.json`에 빌드 스크립트 확인:

```json
{
  "scripts": {
    "build": "nest build",
    "start": "node dist/main.js",
    "start:prod": "node dist/main.js",
    "vercel-build": "prisma generate && prisma migrate deploy && nest build"
  }
}
```

### 5. 배포 실행

```bash
# Vercel CLI 설치 (선택사항)
npm install -g vercel

# 배포
cd backend
vercel --prod
```

또는 GitHub에 푸시하면 자동 배포:

```bash
git add .
git commit -m "Add backend deployment config"
git push
```

---

## 프론트엔드 배포

### 1. Vercel 프로젝트 생성

1. **Vercel 대시보드**
   - New Project 클릭
   - 같은 GitHub 저장소 선택
   - Root Directory: `frontend` 설정

2. **프로젝트 설정**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

### 2. 환경 변수 설정

```bash
# 백엔드 API URL
VITE_API_URL=https://your-backend-domain.vercel.app/api/v1

# 기타 설정
VITE_APP_NAME=무돈
VITE_APP_VERSION=1.0.0
```

### 3. API URL 설정

`frontend/src/services/api.ts` 수정:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = {
  baseURL: API_BASE_URL,
  // ...
};
```

### 4. vercel.json 설정

`frontend/vercel.json` 파일 생성:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 5. 배포 실행

```bash
cd frontend
vercel --prod
```

또는 GitHub 푸시로 자동 배포:

```bash
git add .
git commit -m "Add frontend deployment config"
git push
```

---

## 환경 변수 설정

### 백엔드 환경 변수 (Vercel)

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DATABASE_URL` | Supabase PostgreSQL URL | `postgresql://...` |
| `SOLAPI_API_KEY` | 솔라피 API 키 (선택) | `NCSAYU7...` |
| `SOLAPI_API_SECRET` | 솔라피 API Secret (선택) | `...` |
| `SOLAPI_SENDER` | 발신번호 (선택) | `01012345678` |
| `SOLAPI_KAKAO_PFID` | 카카오톡 플러스친구 ID (선택) | `@yourkakaoid` |
| `ENCRYPTION_KEY` | 데이터 암호화 키 | 랜덤 32자 이상 |
| `APP_URL` | 프론트엔드 URL | `https://...vercel.app` |
| `NODE_ENV` | 환경 | `production` |

### 프론트엔드 환경 변수 (Vercel)

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `VITE_API_URL` | 백엔드 API URL | `https://...vercel.app/api/v1` |
| `VITE_APP_NAME` | 앱 이름 | `무돈` |
| `VITE_APP_VERSION` | 앱 버전 | `1.0.0` |

### 암호화 키 생성

```bash
# Node.js로 랜덤 키 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 또는 OpenSSL 사용
openssl rand -hex 32
```

---

## 도메인 설정

### 1. 커스텀 도메인 추가 (선택)

#### Vercel에서 도메인 구매
```
1. Vercel 프로젝트 → Settings → Domains
2. Add Domain 클릭
3. 원하는 도메인 입력 및 구매
```

#### 기존 도메인 연결
```
1. Vercel 프로젝트 → Settings → Domains
2. Add Domain 클릭
3. 도메인 입력 (예: api.yourdomain.com)
4. DNS 설정 안내에 따라 A 레코드 추가
```

### 2. SSL 인증서

Vercel은 자동으로 Let's Encrypt SSL 인증서를 발급합니다.
- 도메인 추가 후 자동 적용
- 별도 설정 불필요

---

## 배포 후 확인

### 1. 백엔드 Health Check

```bash
# Health 엔드포인트 확인
curl https://your-backend-domain.vercel.app/api/v1/health

# 예상 응답
{
  "status": "ok",
  "timestamp": "2025-11-08T...",
  "uptime": 123.45,
  "environment": "production"
}
```

### 2. 데이터베이스 연결 확인

```bash
# Supabase 대시보드에서 확인
# Table Editor → products, contacts 등 테이블 확인
```

### 3. API 문서 확인

```
https://your-backend-domain.vercel.app/api/docs
```

### 4. 프론트엔드 확인

```
https://your-frontend-domain.vercel.app
```

### 5. 솔라피 API 설정

1. 프론트엔드 접속
2. 설정 페이지 → 솔라피 API 탭
3. API 키 입력 및 저장
4. 테스트 발송

---

## 파일 스토리지 설정

### 옵션 1: Vercel Blob Storage (권장)

```bash
# 1. Vercel Blob 활성화
# Vercel 대시보드 → Storage → Create Database → Blob

# 2. 환경 변수 자동 추가됨
BLOB_READ_WRITE_TOKEN=...

# 3. 코드 수정
npm install @vercel/blob
```

`backend/src/common/storage/storage.service.ts` 수정:

```typescript
import { put } from '@vercel/blob';

async uploadFile(file: Express.Multer.File): Promise<string> {
  if (process.env.NODE_ENV === 'production') {
    // Vercel Blob 사용
    const blob = await put(file.originalname, file.buffer, {
      access: 'public',
    });
    return blob.url;
  } else {
    // 로컬 스토리지 사용
    // 기존 코드...
  }
}
```

### 옵션 2: Cloudinary (무료 25GB)

```bash
# 1. Cloudinary 계정 생성
https://cloudinary.com

# 2. 환경 변수 추가
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# 3. SDK 설치
npm install cloudinary
```

### 옵션 3: Supabase Storage

```bash
# 1. Supabase 대시보드 → Storage
# 2. New bucket 생성: "uploads"
# 3. Public 설정

# 4. 환경 변수 추가
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

---

## 성능 최적화

### 1. 이미지 최적화

```typescript
// Sharp 설정 최적화
await sharp(inputBuffer)
  .resize(1080, 1350, { fit: 'cover' })
  .jpeg({ quality: 85, progressive: true })
  .toBuffer();
```

### 2. 데이터베이스 인덱스

```sql
-- 자주 조회되는 컬럼에 인덱스 추가
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_send_logs_send_job_id ON send_logs(send_job_id);
```

### 3. 캐싱 설정

```typescript
// API 응답 캐싱
@CacheKey('products')
@CacheTTL(300) // 5분
async findAll() {
  // ...
}
```

### 4. Vercel 함수 최적화

`vercel.json`에 함수 설정 추가:

```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

---

## 모니터링 설정

### 1. Vercel Analytics

```bash
# 프론트엔드에 Analytics 추가
npm install @vercel/analytics

# _app.tsx 또는 main.tsx에 추가
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### 2. Sentry 에러 추적 (선택)

```bash
# 1. Sentry 계정 생성
https://sentry.io

# 2. SDK 설치
npm install @sentry/node @sentry/nestjs

# 3. 초기화
import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 3. Supabase 모니터링

```
Supabase 대시보드 → Reports
- Database 사용량
- API 요청 수
- Storage 사용량
```

---

## 문제 해결

### 1. 빌드 실패

**증상**: Vercel 배포 시 빌드 실패

**해결**:
```bash
# 로컬에서 프로덕션 빌드 테스트
cd backend
npm run build

cd ../frontend
npm run build

# 에러 확인 및 수정
```

### 2. 데이터베이스 연결 실패

**증상**: `Error: P1001: Can't reach database server`

**해결**:
1. DATABASE_URL 확인
2. Supabase 프로젝트 활성화 확인
3. IP 화이트리스트 확인 (Supabase는 기본적으로 모든 IP 허용)

### 3. CORS 에러

**증상**: 프론트엔드에서 API 호출 시 CORS 에러

**해결**:
```typescript
// backend/src/main.ts
app.enableCors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-domain.vercel.app',
  ],
  credentials: true,
});
```

### 4. 환경 변수 미적용

**증상**: 환경 변수가 적용되지 않음

**해결**:
1. Vercel 대시보드에서 환경 변수 확인
2. Production, Preview, Development 모두 체크
3. Redeploy 실행

### 5. 파일 업로드 실패

**증상**: 이미지 업로드 시 에러

**해결**:
- Vercel Serverless 함수는 파일 시스템 쓰기 불가
- Vercel Blob, Cloudinary, 또는 Supabase Storage 사용 필수

### 6. 함수 타임아웃

**증상**: `FUNCTION_INVOCATION_TIMEOUT`

**해결**:
```json
// vercel.json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

---

## 비용 예상

### 무료 티어 (Hobby Plan)

| 서비스 | 무료 한도 | 초과 시 |
|--------|-----------|---------|
| **Vercel** | 100GB 대역폭/월 | $20/100GB |
| **Supabase** | 500MB DB, 1GB 파일 | $25/월 (Pro) |
| **Solapi** | - | 종량제 (SMS 8원) |
| **Cloudinary** | 25GB 저장, 25GB 대역폭 | $99/월 (Plus) |

### 예상 월 비용 (1,000명 사용자 기준)

```
Vercel: 무료 (100GB 이내)
Supabase: 무료 (500MB 이내)
Solapi: 약 20,000원 (월 1,000건 발송)
Cloudinary: 무료 (25GB 이내)
─────────────────────────
총: 약 20,000원/월
```

---

## 배포 체크리스트

### 배포 전
- [ ] GitHub 저장소 생성 및 푸시
- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 솔라피 API 키 발급
- [ ] 환경 변수 준비

### 백엔드 배포
- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] vercel.json 설정
- [ ] 배포 성공 확인
- [ ] Health Check 통과

### 프론트엔드 배포
- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] API URL 설정
- [ ] 배포 성공 확인
- [ ] 페이지 로드 확인

### 배포 후
- [ ] 데이터베이스 연결 확인
- [ ] API 문서 접근 확인
- [ ] 솔라피 API 설정
- [ ] 테스트 발송 성공
- [ ] 모니터링 설정

---

## 추가 리소스

### 공식 문서
- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **NestJS**: https://docs.nestjs.com
- **Prisma**: https://www.prisma.io/docs

### 커뮤니티
- **Vercel Discord**: https://vercel.com/discord
- **Supabase Discord**: https://discord.supabase.com

---

## 🎉 완료!

배포가 완료되면:

1. **프론트엔드 URL 공유**
   ```
   https://your-app.vercel.app
   ```

2. **API 문서 공유**
   ```
   https://your-api.vercel.app/api/docs
   ```

3. **모니터링 확인**
   - Vercel Analytics
   - Supabase Dashboard
   - Solapi Console

**성공적인 배포를 축하합니다!** 🚀

---

**작성자**: Kiro AI  
**작성일**: 2025-11-08  
**버전**: 1.0.0  
**상태**: ✅ 완료
