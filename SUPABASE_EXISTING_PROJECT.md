# 🗄️ 기존 Supabase 프로젝트 사용 가이드

## ✅ 선택한 방식

**기존 Supabase 프로젝트 + `mo_` 테이블 프리픽스**

이 방식의 장점:
- ✅ 새 프로젝트 생성 불필요
- ✅ 기존 데이터와 완전히 분리
- ✅ 하나의 데이터베이스에서 여러 프로젝트 관리 가능
- ✅ 비용 절감 (하나의 Supabase 프로젝트만 사용)

---

## 📋 테이블 구조

### Moodon 테이블 (mo_ 프리픽스)
```
mo_products          - 상품 정보
mo_product_images    - 상품 이미지
mo_contacts          - 연락처
mo_send_jobs         - 발송 작업
mo_send_logs         - 발송 로그
mo_tracking_events   - 추적 이벤트
mo_compose_jobs      - 이미지 합성 작업
mo_settings          - 설정 (API 키 등)
```

### 기존 테이블
```
(기존 프로젝트의 테이블들)
- 프리픽스가 없거나 다른 프리픽스 사용
- Moodon 테이블과 완전히 분리됨
```

---

## 🔧 Prisma 스키마 설정

모든 모델에 `@@map("mo_테이블명")` 추가됨:

```prisma
model Product {
  id   String @id @default(cuid())
  name String
  // ... 필드들
  
  @@map("mo_products")  // ← 실제 테이블 이름
}

model Contact {
  id    String @id @default(cuid())
  phone String @unique
  // ... 필드들
  
  @@map("mo_contacts")  // ← 실제 테이블 이름
}
```

---

## 🚀 마이그레이션 방법

### 1. DATABASE_URL 설정
```bash
# 기존 Supabase 프로젝트의 연결 문자열 사용
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 2. 마이그레이션 실행
```bash
cd backend

# 개발 환경 (로컬 테스트)
npx prisma migrate dev --name init_with_mo_prefix

# 프로덕션 환경 (Vercel 배포 시 자동 실행)
npx prisma migrate deploy
```

### 3. 확인
```bash
# Prisma Studio로 확인
npx prisma studio

# 또는 Supabase Dashboard → Table Editor에서 확인
```

---

## 🔍 테이블 확인 방법

### Supabase Dashboard
1. https://supabase.com → 프로젝트 선택
2. Table Editor 메뉴
3. `mo_` 프리픽스가 붙은 테이블 8개 확인

### Prisma Studio
```bash
cd backend
npx prisma studio
```
- http://localhost:5555 접속
- 모든 테이블 확인 가능

### SQL 쿼리
```sql
-- Supabase SQL Editor에서 실행
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'mo_%'
ORDER BY table_name;
```

---

## 🗑️ 테이블 삭제 (필요 시)

테스트 후 테이블을 삭제하고 싶다면:

```sql
-- Supabase SQL Editor에서 실행
DROP TABLE IF EXISTS mo_tracking_events CASCADE;
DROP TABLE IF EXISTS mo_send_logs CASCADE;
DROP TABLE IF EXISTS mo_send_jobs CASCADE;
DROP TABLE IF EXISTS mo_compose_jobs CASCADE;
DROP TABLE IF EXISTS mo_product_images CASCADE;
DROP TABLE IF EXISTS mo_products CASCADE;
DROP TABLE IF EXISTS mo_contacts CASCADE;
DROP TABLE IF EXISTS mo_settings CASCADE;
DROP TABLE IF EXISTS _prisma_migrations CASCADE;
```

또는 Prisma 명령어:
```bash
# 주의: 모든 데이터가 삭제됩니다!
npx prisma migrate reset
```

---

## 🔐 보안 고려사항

### Row Level Security (RLS)
Supabase는 기본적으로 RLS가 활성화되어 있습니다.

Moodon은 백엔드 API를 통해서만 접근하므로:
1. RLS를 비활성화하거나
2. 서비스 역할 키 사용

```sql
-- RLS 비활성화 (각 테이블마다)
ALTER TABLE mo_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE mo_contacts DISABLE ROW LEVEL SECURITY;
-- ... 나머지 테이블들
```

또는 Supabase Dashboard:
1. Table Editor → 테이블 선택
2. Settings → Row Level Security
3. Disable RLS

---

## 📊 데이터 마이그레이션 (선택사항)

로컬 SQLite 데이터를 Supabase로 이전하려면:

### 1. 데이터 내보내기
```bash
cd backend
npx prisma studio

# 각 테이블에서 데이터를 CSV로 내보내기
```

### 2. 데이터 가져오기
```bash
# Supabase Dashboard → Table Editor
# Import data from CSV
```

또는 Prisma Seed 스크립트 작성:
```typescript
// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 데이터 삽입 로직
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

---

## ✅ 장점 요약

### 비용
- ✅ 추가 비용 없음 (기존 프로젝트 사용)
- ✅ Supabase 무료 티어 한도 공유

### 관리
- ✅ 하나의 대시보드에서 모든 프로젝트 관리
- ✅ 테이블 프리픽스로 명확한 구분
- ✅ 백업 및 복원 간편

### 확장성
- ✅ 나중에 다른 프로젝트 추가 가능 (다른 프리픽스 사용)
- ✅ 필요 시 별도 프로젝트로 분리 가능

---

## 🎯 다음 단계

1. ✅ Prisma 스키마 업데이트 완료 (`mo_` 프리픽스)
2. ⏭️ 기존 Supabase 프로젝트의 DATABASE_URL 확인
3. ⏭️ 마이그레이션 실행
4. ⏭️ Vercel 배포
5. ⏭️ 테스트

---

**작성일**: 2025-11-08  
**상태**: ✅ 준비 완료
