# 🔐 Moodon 환경 변수 설정

## 📋 수집한 정보

### Cloudinary (✅ 완료)
```bash
CLOUDINARY_CLOUD_NAME=djxrffrjfg
CLOUDINARY_API_KEY=222333877835831
CLOUDINARY_API_SECRET=QS25mKuuOqzZODDZPNvIji308aA
```

**API Secret 복사 방법:**
1. Cloudinary Dashboard → API Keys
2. Root 행의 API Secret 열
3. 눈 아이콘 클릭하여 보기 또는 복사 아이콘 클릭

---

### Supabase (기존 프로젝트)
```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**DATABASE_URL 확인 방법:**
1. https://supabase.com 로그인
2. 프로젝트 선택
3. Project Settings → Database
4. Connection string → URI 복사

---

### Solapi (✅ 이미 있음)
```bash
SOLAPI_API_KEY=<기존 키>
SOLAPI_API_SECRET=<기존 시크릿>
SOLAPI_SENDER=01042151128
```

---

### 기타 (✅ 자동 생성)
```bash
ENCRYPTION_KEY=3ygDe7hSi2KX3VZAnyVR7aitfpHc8pSR
NODE_ENV=production
```

---

## 🚀 Vercel 배포 시 환경 변수 설정

### 백엔드 환경 변수 (8개)
```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SOLAPI_API_KEY=NCSM4OQZXGZLFBWW
SOLAPI_API_SECRET=HIUEVKUJFFJTODQ1QB1J57ARFO1N9JPM
SOLAPI_SENDER=01042151128
CLOUDINARY_CLOUD_NAME=djxrffrjfg
CLOUDINARY_API_KEY=222333877835831
CLOUDINARY_API_SECRET=QS25mKuuOqzZODDZPNvIji308aA
ENCRYPTION_KEY=3ygDe7hSi2KX3VZAnyVR7aitfpHc8pSR
```

### 프론트엔드 환경 변수 (1개)
```bash
VITE_API_URL=https://moodon-backend.vercel.app/api/v1
```
(백엔드 배포 후 URL 업데이트 필요)

---

## 📝 다음 단계

### 1. Cloudinary API Secret 복사
- [ ] Cloudinary Dashboard에서 API Secret 복사
- [ ] 안전한 곳에 저장

### 2. Supabase DATABASE_URL 확인
- [ ] Supabase 프로젝트에서 DATABASE_URL 복사
- [ ] 안전한 곳에 저장

### 3. Vercel CLI 설치
```bash
npm install -g vercel
```

### 4. 백엔드 배포
```bash
cd backend
vercel login
vercel --prod
```

배포 중 환경 변수 입력 프롬프트가 나오면 위의 값들을 입력하세요.

또는 Vercel Dashboard에서 수동으로 설정:
1. Vercel Dashboard → Project → Settings
2. Environment Variables
3. 위의 8개 변수 추가

---

## ✅ 체크리스트

### 정보 수집
- [x] Cloudinary Cloud Name: djxrffrjfg
- [x] Cloudinary API Key: 222333877835831
- [ ] Cloudinary API Secret (복사 필요)
- [ ] Supabase DATABASE_URL
- [x] Solapi 키 (이미 있음)
- [x] ENCRYPTION_KEY: 3ygDe7hSi2KX3VZAnyVR7aitfpHc8pSR

### 배포 준비
- [ ] Vercel CLI 설치
- [ ] 백엔드 배포
- [ ] 프론트엔드 배포

---

**작성일**: 2025-11-08  
**상태**: Cloudinary 설정 완료, API Secret 복사 대기 중
