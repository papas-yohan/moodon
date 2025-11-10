# 🗄️ Supabase 설정 가이드 (기존 프로젝트 사용)

## 📋 개요

기존 Supabase 프로젝트에 Moodon 테이블을 추가합니다.
- 테이블 프리픽스: `mo_`
- 기존 테이블과 완전히 분리됨
- 총 8개 테이블 생성

---

## 1단계: DATABASE_URL 확인 (5분)

### 1.1 Supabase 접속
1. https://supabase.com 접속
2. 로그인 (yohan73@gmail.com)
3. 기존 프로젝트 선택

### 1.2 DATABASE_URL 복사
1. 왼쪽 하단 **⚙️ Project Settings** 클릭
2. 왼쪽 메뉴에서 **Database** 클릭
3. **Connection string** 섹션 찾기
4. **URI** 탭 선택 (기본 선택되어 있음)
5. 복사 버튼 클릭

### 1.3 URL 형식 확인
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**중요**: `[YOUR-PASSWORD]` 부분이 실제 비밀번호로 표시됩니다.

### 1.4 안전하게 저장
- 메모장이나 안전한 곳에 저장
- 이 URL은 나중에 Vercel 환경 변수로 사용됩니다

---

## 2단계: 로컬에서 마이그레이션 테스트 (10분)

### 2.1 환경 변수 설정
```bash
# backend 디렉토리에서
cd backend

# .env 파일 생성 (임시)
echo "DATABASE_URL=<복사한 Supabase URL>" > .env.temp
```

### 2.2 Prisma 클라이언트 생성
```bash
npx prisma generate
```

**예상 출력:**
```
✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

### 2.3 마이그레이션 생성
```bash
npx prisma migrate dev --name init_moodon_with_mo_prefix
```

**프롬프트 응답:**
- "We need to reset the database..." → `y` (yes)

**예상 출력:**
```
✔ Generated Prisma Client
✔ The migration has been created successfully
✔ Applied migration: init_moodon_with_mo_prefix

Database synchronized with Prisma schema.
```

### 2.4 테이블 생성 확인
```bash
npx prisma studio
```

브라우저가 열리면 (http://localhost:5555):
- 왼쪽에 8개 테이블 확인:
  - `mo_products`
  - `mo_product_images`
  - `mo_contacts`
  - `mo_send_jobs`
  - `mo_send_logs`
  - `mo_tracking_events`
  - `mo_compose_jobs`
  - `mo_settings`

**확인 후 Prisma Studio 종료** (Ctrl+C)

---

## 3단계: Supabase Dashboard에서 확인 (5분)

### 3.1 Table Editor 접속
1. Supabase Dashboard
2. 왼쪽 메뉴에서 **🗂️ Table Editor** 클릭

### 3.2 테이블 확인
왼쪽 테이블 목록에서 `mo_` 프리픽스가 붙은 테이블 8개 확인:

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

### 3.3 기존 테이블과 분리 확인
- 기존 테이블들은 그대로 유지됨
- `mo_` 프리픽스로 명확히 구분됨
- 충돌 없음 ✅

---

## 4단계: Row Level Security (RLS) 설정 (5분)

Moodon은 백엔드 API를 통해서만 접근하므로 RLS를 비활성화합니다.

### 4.1 SQL Editor 접속
1. Supabase Dashboard
2. 왼쪽 메뉴에서 **🔧 SQL Editor** 클릭
3. **New query** 클릭

### 4.2 RLS 비활성화 SQL 실행
다음 SQL을 복사하여 실행:

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

**Run** 버튼 클릭

**예상 출력:**
```
Success. No rows returned
```

### 4.3 RLS 상태 확인
Table Editor에서 각 테이블 선택 후:
- 오른쪽 상단 **⚙️** 아이콘 클릭
- "RLS enabled" 가 **OFF** 인지 확인

---

## 5단계: 초기 설정 데이터 삽입 (선택사항, 5분)

### 5.1 Solapi API 키 암호화 저장
Supabase SQL Editor에서 실행:

```sql
-- 암호화 키 확인용 (실제로는 백엔드에서 자동 처리)
-- 이 단계는 선택사항입니다
SELECT * FROM mo_settings;
```

**참고**: 설정 데이터는 웹 UI에서 입력하므로 여기서는 건너뛰어도 됩니다.

---

## 6단계: 마이그레이션 파일 커밋 (5분)

### 6.1 마이그레이션 파일 확인
```bash
ls -la backend/prisma/migrations/
```

새로운 마이그레이션 폴더가 생성되었는지 확인:
```
20251108XXXXXX_init_moodon_with_mo_prefix/
  └── migration.sql
```

### 6.2 Git 커밋
```bash
git add backend/prisma/migrations/
git commit -m "Add Supabase migration with mo_ prefix"
git push origin main
```

---

## 7단계: 프로덕션 마이그레이션 준비 (2분)

### 7.1 마이그레이션 배포 명령어 확인
```bash
# 로컬 테스트용
npx prisma migrate deploy

# Vercel 배포 시 자동 실행됨 (vercel-build 스크립트)
```

### 7.2 환경 변수 준비
Vercel 배포 시 사용할 DATABASE_URL:
```
DATABASE_URL=<1단계에서 복사한 Supabase URL>
```

---

## ✅ 완료 체크리스트

### Supabase 설정
- [ ] DATABASE_URL 복사 완료
- [ ] 로컬에서 마이그레이션 실행 완료
- [ ] Prisma Studio에서 테이블 8개 확인
- [ ] Supabase Table Editor에서 테이블 확인
- [ ] RLS 비활성화 완료
- [ ] 마이그레이션 파일 커밋 완료

### 테이블 확인
- [ ] mo_products
- [ ] mo_product_images
- [ ] mo_contacts
- [ ] mo_send_jobs
- [ ] mo_send_logs
- [ ] mo_tracking_events
- [ ] mo_compose_jobs
- [ ] mo_settings

---

## 🔍 문제 해결

### 문제 1: "Database connection failed"
**원인**: DATABASE_URL이 잘못되었거나 네트워크 문제

**해결**:
```bash
# URL 형식 확인
echo $DATABASE_URL

# Supabase 프로젝트가 활성 상태인지 확인
# Dashboard에서 프로젝트 상태 확인
```

### 문제 2: "Migration failed"
**원인**: 테이블이 이미 존재하거나 권한 문제

**해결**:
```sql
-- Supabase SQL Editor에서 실행
-- 기존 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'mo_%';

-- 필요시 테이블 삭제 후 재시도
DROP TABLE IF EXISTS mo_tracking_events CASCADE;
DROP TABLE IF EXISTS mo_send_logs CASCADE;
-- ... (나머지 테이블)
```

### 문제 3: "RLS policy error"
**원인**: RLS가 활성화되어 있음

**해결**:
```sql
-- 4단계의 RLS 비활성화 SQL 다시 실행
ALTER TABLE mo_products DISABLE ROW LEVEL SECURITY;
-- ... (나머지 테이블)
```

---

## 📊 데이터베이스 구조

### ERD (Entity Relationship Diagram)

```
mo_products (상품)
  ├── mo_product_images (상품 이미지)
  ├── mo_compose_jobs (이미지 합성 작업)
  ├── mo_send_logs (발송 로그)
  └── mo_tracking_events (추적 이벤트)

mo_contacts (연락처)
  ├── mo_send_logs (발송 로그)
  └── mo_tracking_events (추적 이벤트)

mo_send_jobs (발송 작업)
  └── mo_send_logs (발송 로그)

mo_settings (설정)
  - 독립 테이블
```

---

## 🎯 다음 단계

Supabase 설정이 완료되면:

1. ✅ DATABASE_URL 확인 완료
2. ⏭️ Vercel 백엔드 배포
3. ⏭️ Vercel 프론트엔드 배포
4. ⏭️ 기능 테스트

---

**작성일**: 2025-11-08  
**예상 소요 시간**: 30분  
**난이도**: 초급-중급
