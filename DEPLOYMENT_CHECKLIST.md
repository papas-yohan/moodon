# 🚀 Moodon 배포 체크리스트

## 📋 배포 전 준비

### 계정 생성
- [ ] GitHub 계정 (https://github.com)
- [ ] Vercel 계정 (https://vercel.com - GitHub로 로그인)
- [ ] Supabase 계정 (https://supabase.com)
- [ ] Cloudinary 계정 (https://cloudinary.com/users/register/free)
- [ ] Solapi 계정 (이미 있음 ✅)

### 로컬 백업
```bash
# 데이터베이스 백업
cp backend/prisma/dev.db backend/prisma/dev.db.backup

# 업로드 파일 백업
tar -czf uploads_backup.tar.gz backend/uploads/
```

---

## 1️⃣ GitHub 저장소 (10분)

### 작업
```bash
# Git 초기화
git init

# 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Moodon MVP"

# GitHub 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/moodon.git
git branch -M main
git push -u origin main
```

### 체크
- [x] GitHub 저장소 생성 완료 ✅
- [x] 코드 푸시 완료 ✅ (280 objects, 550KB)
- [x] .gitignore 적용 확인 (node_modules, .env 제외됨) ✅

### 저장소 URL
```
https://github.com/papas-yohan/moodon
```

---

## 2️⃣ Supabase 데이터베이스 (10분)

### 작업
1. **기존 Supabase 프로젝트 사용** ✅
2. Project Settings → Database → Connection string 복사
3. 테이블 프리픽스: `mo_` (이미 Prisma 스키마에 적용됨)

### 체크
- [ ] 기존 Supabase 프로젝트 확인
- [ ] DATABASE_URL 복사 완료
- [ ] 테이블 프리픽스 `mo_` 확인 (다른 테이블과 혼동 방지)

### DATABASE_URL 형식
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 생성될 테이블 목록 (mo_ 프리픽스)
- `mo_products` - 상품
- `mo_product_images` - 상품 이미지
- `mo_contacts` - 연락처
- `mo_send_jobs` - 발송 작업
- `mo_send_logs` - 발송 로그
- `mo_tracking_events` - 추적 이벤트
- `mo_compose_jobs` - 이미지 합성 작업
- `mo_settings` - 설정 (API 키 등)

---

## 3️⃣ Cloudinary 설정 (15분)

### 작업
1. https://cloudinary.com/users/register/free → 가입
2. Email 인증
3. Dashboard → Account Details 확인:
   - Cloud Name
   - API Key
   - API Secret

### 체크
- [ ] Cloudinary 계정 생성 완료
- [ ] API 키 3개 모두 복사 완료
- [ ] 안전한 곳에 저장

---

## 4️⃣ 백엔드 배포 (30분)

### 작업
```bash
# Vercel CLI 설치
npm install -g vercel

# 백엔드 디렉토리로 이동
cd backend

# Vercel 로그인
vercel login

# 배포
vercel --prod
```

### 프롬프트 응답
- Set up and deploy? **Y**
- Which scope? **(your account)**
- Link to existing project? **N**
- Project name? **moodon-backend**
- Directory? **./  (현재 디렉토리)**
- Override settings? **N**

### 환경 변수 설정
Vercel Dashboard → Project → Settings → Environment Variables

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@...
SOLAPI_API_KEY=your-key
SOLAPI_API_SECRET=your-secret
SOLAPI_SENDER=01042151128
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
ENCRYPTION_KEY=your-32-char-key
NODE_ENV=production
```

### 체크
- [ ] Vercel CLI 설치 완료
- [ ] 백엔드 배포 완료
- [ ] 환경 변수 8개 모두 설정 완료
- [ ] 배포 URL 확인 (예: https://moodon-backend.vercel.app)

---

## 5️⃣ 프론트엔드 배포 (20분)

### 작업
```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 배포
vercel --prod
```

### 환경 변수 설정
Vercel Dashboard → Project → Settings → Environment Variables

```
VITE_API_URL=https://moodon-backend.vercel.app/api/v1
```

### 체크
- [ ] 프론트엔드 배포 완료
- [ ] VITE_API_URL 설정 완료
- [ ] 배포 URL 확인 (예: https://moodon.vercel.app)

---

## 6️⃣ 데이터베이스 마이그레이션 (10분)

### 작업
```bash
cd backend

# 환경 변수 설정 (임시)
export DATABASE_URL="postgresql://postgres:[PASSWORD]@..."

# Prisma 마이그레이션 생성 및 적용
npx prisma migrate dev --name init_with_mo_prefix

# 또는 배포용
npx prisma migrate deploy

# 확인
npx prisma studio
```

### 체크
- [ ] 마이그레이션 성공
- [ ] `mo_` 프리픽스가 붙은 테이블 8개 생성 확인
- [ ] 기존 테이블과 충돌 없음 확인 (Prisma Studio 또는 Supabase Dashboard)

### Supabase Dashboard에서 확인
1. Supabase Dashboard → Table Editor
2. `mo_products`, `mo_contacts` 등 테이블 확인
3. 기존 테이블과 분리되어 있는지 확인

---

## 7️⃣ 배포 후 테스트 (20분)

### 백엔드 Health Check
```bash
curl https://your-backend.vercel.app/api/v1/health
```

### 프론트엔드 접속
```
https://your-frontend.vercel.app
```

### 기능 테스트
- [ ] 프론트엔드 접속 성공
- [ ] 설정 페이지에서 솔라피 API 키 입력
- [ ] 상품 등록
- [ ] 이미지 업로드 (Cloudinary 확인)
- [ ] 이미지 합성
- [ ] 연락처 추가
- [ ] **MMS 이미지 발송 테스트** ⭐
- [ ] 메시지 수신 확인
- [ ] 통계 확인

---

## 8️⃣ 도메인 연결 (선택사항, 10분)

### 작업
1. Vercel Dashboard → Domains
2. Add Domain
3. 도메인 입력 (예: moodon.com)
4. DNS 설정 (Vercel 안내 따라 진행)

### 체크
- [ ] 도메인 연결 완료 (선택사항)
- [ ] SSL 인증서 자동 발급 확인

---

## ✅ 최종 확인

### 배포 완료
- [ ] 백엔드 정상 작동
- [ ] 프론트엔드 정상 작동
- [ ] 데이터베이스 연결 정상
- [ ] 이미지 업로드 정상 (Cloudinary)
- [ ] MMS 이미지 발송 정상 ⭐
- [ ] 모든 기능 테스트 완료

### 배포 URL 기록
```
백엔드: https://_____________________.vercel.app
프론트엔드: https://_____________________.vercel.app
```

### API 키 안전 보관
- [ ] Supabase DATABASE_URL
- [ ] Cloudinary 키 3개
- [ ] Solapi 키 3개
- [ ] ENCRYPTION_KEY

---

## 🎉 배포 완료!

축하합니다! Moodon이 성공적으로 배포되었습니다.

이제 MMS로 이미지가 포함된 메시지를 발송할 수 있습니다!

---

**작성일**: 2025-11-08  
**예상 소요 시간**: 2-3시간  
**난이도**: 중급
