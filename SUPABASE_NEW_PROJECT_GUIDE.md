# 🆕 Supabase 신규 프로젝트 생성 가이드

## 📋 개요

Moodon 전용 Supabase 프로젝트를 새로 생성합니다.
- 깔끔한 시작
- 다른 프로젝트와 완전히 분리
- 무료 티어 사용 가능

**예상 소요 시간**: 15분

---

## 1단계: Supabase 프로젝트 생성 (5분)

### 1.1 Supabase 접속
1. https://supabase.com 접속
2. 로그인 (yohan73@gmail.com)
3. Dashboard 화면에서 **New Project** 버튼 클릭

### 1.2 프로젝트 정보 입력

#### Organization 선택
- 기존 Organization 선택 또는
- 새로 생성 (권장: "Personal" 또는 "Moodon")

#### 프로젝트 설정
```
Name: moodon
(또는 원하는 이름)

Database Password: 
[강력한 비밀번호 생성]
⚠️ 중요: 이 비밀번호를 반드시 저장하세요!

Region: 
Northeast Asia (Seoul) - ap-northeast-2
(한국 서버 선택 - 가장 빠름)

Pricing Plan:
Free (무료)
```

#### 비밀번호 생성 팁
- 최소 12자 이상
- 대소문자, 숫자, 특수문자 포함
- 예: `Moodon2025!@#$Secure`
- **반드시 안전한 곳에 저장!**

### 1.3 프로젝트 생성
1. **Create new project** 버튼 클릭
2. 프로젝트 생성 대기 (2-3분 소요)
3. "Setting up project..." 메시지 표시됨

### 1.4 생성 완료 확인
- Dashboard에 프로젝트가 표시됨
- 초록색 "Active" 상태 확인

---

## 2단계: DATABASE_URL 확인 (2분)

### 2.1 Project Settings 접속
1. 왼쪽 하단 **⚙️ Project Settings** 클릭
2. 왼쪽 메뉴에서 **Database** 클릭

### 2.2 Connection String 복사
1. **Connection string** 섹션 찾기
2. **URI** 탭 선택 (기본 선택됨)
3. 복사 버튼 클릭

### 2.3 URL 형식 확인
```
postgresql://postgres.PROJECT-REF:PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

또는

```
postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres
```

**중요**: 
- `PASSWORD` 부분이 1단계에서 설정한 비밀번호로 표시됨
- 전체 URL을 복사하세요

### 2.4 안전하게 저장
```
DATABASE_URL=postgresql://postgres:YOUR-PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

메모장이나 안전한 곳에 저장하세요.

---

## 3단계: 로컬에서 데이터베이스 마이그레이션 (5분)

### 3.1 환경 변수 파일 생성
```bash
# backend 디렉토리에서
cd backend

# .env 파일 생성
cat > .env << 'EOF'
DATABASE_URL="복사한-Supabase-URL"
EOF
```

**또는 직접 파일 생성**:
1. `backend/.env` 파일 생성
2. 다음 내용 입력:
```
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres"
```
3. PASSWORD를 실제 비밀번호로 교체
4. 저장

### 3.2 Prisma 클라이언트 생성
```bash
npx prisma generate
```

**예상 출력**:
```
✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

### 3.3 마이그레이션 실행
```bash
npx prisma migrate deploy
```

**예상 출력**:
```
1 migration found in prisma/migrations

Applying migration `20251105055607_init`
Applying migration `20251105172717_add_product_fields`
Applying migration `20251107163851_add_settings_table`

The following migration(s) have been applied:

migrations/
  └─ 20251105055607_init/
      └─ migration.sql
  └─ 20251105172717_add_product_fields/
      └─ migration.sql
  └─ 20251107163851_add_settings_table/
      └─ migration.sql

✔ All migrations have been successfully applied.
```

### 3.4 테이블 생성 확인
```bash
npx prisma studio
```

브라우저가 자동으로 열립니다 (http://localhost:5555)

**확인 사항**:
- 왼쪽에 8개 테이블 표시:
  - `mo_products`
  - `mo_product_images`
  - `mo_contacts`
  - `mo_send_jobs`
  - `mo_send_logs`
  - `mo_tracking_events`
  - `mo_compose_jobs`
  - `mo_settings`

**확인 후**: Ctrl+C로 Prisma Studio 종료

---

## 4단계: Supabase Dashboard에서 확인 (3분)

### 4.1 Table Editor 접속
1. Supabase Dashboard로 돌아가기
2. 왼쪽 메뉴에서 **🗂️ Table Editor** 클릭

### 4.2 테이블 확인
왼쪽 테이블 목록에서 8개 테이블 확인:

```
✓ mo_compose_jobs
✓ mo_contacts
✓ mo_product_images
✓ mo_products
✓ mo_send_jobs
✓ mo_send_logs
✓ mo_settings
✓ mo_tracking_events
```

### 4.3 테이블 구조 확인
`mo_products` 테이블 클릭:
- 컬럼: id, name, description, price, category, size, color 등
- 데이터: 비어있음 (정상)

---

## 5단계: Row Level Security (RLS) 비활성화 (3분)

Moodon은 백엔드 API를 통해서만 접근하므로 RLS를 비활성화합니다.

### 5.1 SQL Editor 접속
1. 왼쪽 메뉴에서 **🔧 SQL Editor** 클릭
2. **New query** 버튼 클릭

### 5.2 SQL 실행
다음 SQL을 복사하여 붙여넣기:

```sql
-- Moodon 테이블의 RLS 비활성화
ALTER TABLE mo_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE mo_product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE mo_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE mo_send_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE mo_send_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE mo_tracking_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE mo_compose_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE mo_settings DISABLE ROW LEVEL SECURITY;
```

### 5.3 실행
1. **Run** 버튼 클릭 (또는 Ctrl+Enter)
2. 성공 메시지 확인: "Success. No rows returned"

### 5.4 확인
Table Editor로 돌아가서:
1. 아무 테이블 선택 (예: mo_products)
2. 오른쪽 상단 **⚙️** 아이콘 클릭
3. "RLS enabled" 가 **OFF** 인지 확인

---

## 6단계: 환경 변수 정리 (2분)

### 6.1 DATABASE_URL 최종 확인
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

### 6.2 ENVIRONMENT_VARIABLES.md 업데이트
`ENVIRONMENT_VARIABLES.md` 파일을 열어서:

```bash
# Supabase (✅ 완료)
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

실제 URL로 업데이트하세요.

---

## ✅ 완료 체크리스트

### Supabase 프로젝트 생성
- [ ] Supabase 프로젝트 생성 완료
- [ ] 프로젝트 이름: moodon
- [ ] Region: Seoul (ap-northeast-2)
- [ ] Database Password 저장 완료

### DATABASE_URL
- [ ] DATABASE_URL 복사 완료
- [ ] 안전한 곳에 저장 완료

### 데이터베이스 마이그레이션
- [ ] .env 파일 생성 완료
- [ ] `npx prisma generate` 실행 완료
- [ ] `npx prisma migrate deploy` 실행 완료
- [ ] Prisma Studio에서 테이블 8개 확인

### Supabase Dashboard 확인
- [ ] Table Editor에서 테이블 8개 확인
- [ ] RLS 비활성화 완료
- [ ] 모든 테이블 RLS OFF 확인

---

## 🎯 다음 단계

Supabase 설정이 완료되면:

1. ✅ DATABASE_URL 확인 완료
2. ✅ 테이블 생성 완료
3. ⏭️ Vercel 백엔드 배포
4. ⏭️ Vercel 프론트엔드 배포
5. ⏭️ 기능 테스트

---

## 🔍 문제 해결

### 문제 1: "프로젝트 생성이 너무 오래 걸림"
**원인**: Supabase 서버 부하

**해결**:
- 3-5분 정도 기다리기
- 페이지 새로고침
- 여전히 안 되면 다른 Region 선택 (Tokyo 등)

### 문제 2: "Database connection failed"
**원인**: DATABASE_URL이 잘못되었거나 비밀번호 오류

**해결**:
```bash
# URL 형식 확인
echo $DATABASE_URL

# 비밀번호 특수문자 인코딩 필요할 수 있음
# 예: @ → %40, # → %23
```

### 문제 3: "Migration failed"
**원인**: 네트워크 문제 또는 권한 문제

**해결**:
```bash
# 다시 시도
npx prisma migrate deploy

# 또는 강제 리셋 (주의: 데이터 삭제됨)
npx prisma migrate reset
```

### 문제 4: "RLS policy error"
**원인**: RLS가 활성화되어 있음

**해결**:
- 5단계의 SQL을 다시 실행
- 각 테이블마다 RLS OFF 확인

---

## 📊 Supabase 무료 티어 한도

```
Database: 500MB
API Requests: 무제한
Bandwidth: 2GB/월
File Storage: 1GB
```

**Moodon 예상 사용량**:
- Database: ~50MB (충분)
- Bandwidth: ~500MB/월 (충분)
- File Storage: 0 (Cloudinary 사용)

**결론**: 무료 티어로 충분합니다! ✅

---

## 🔐 보안 팁

### Database Password
- 절대 GitHub에 커밋하지 마세요
- .env 파일은 .gitignore에 포함됨
- 안전한 비밀번호 관리자에 저장

### DATABASE_URL
- 환경 변수로만 사용
- 코드에 하드코딩 금지
- Vercel에서만 환경 변수로 설정

---

**작성일**: 2025-11-08  
**예상 소요 시간**: 15분  
**난이도**: 초급
