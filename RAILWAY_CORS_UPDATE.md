# 🔧 Railway CORS 설정 업데이트 필요

## 문제 상황
프론트엔드가 새로운 URL로 재배포되었지만, Railway 백엔드의 CORS 설정이 이전 URL을 가리키고 있습니다.

## 해결 방법

### 1단계: Railway 대시보드 접속
```
https://railway.app/dashboard
```

### 2단계: 프로젝트 선택
- **moodon** 프로젝트 클릭
- **backend** 서비스 클릭

### 3단계: 환경 변수 업데이트
1. **Variables** 탭 클릭
2. **CORS_ORIGIN** 찾기
3. 값을 다음으로 변경:

**이전 값:**
```
https://frontend-5nty8738z-yohans-projects-de3234df.vercel.app
```

**새로운 값:**
```
https://frontend-m28a3iepf-yohans-projects-de3234df.vercel.app
```

4. **Save** 또는 **Update** 클릭

### 4단계: 자동 재배포 대기
- 환경 변수 변경 시 자동으로 재배포됩니다
- 약 1-2분 소요

### 5단계: 확인
새 프론트엔드 URL로 접속:
```
https://frontend-m28a3iepf-yohans-projects-de3234df.vercel.app
```

설정 페이지에서 Solapi API 키 저장 테스트

---

## 빠른 설정 (RAW Editor 사용)

**Variables** 탭 → **RAW Editor** 클릭 후 다음 내용으로 업데이트:

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
CORS_ORIGIN=https://frontend-m28a3iepf-yohans-projects-de3234df.vercel.app
```

**Update Variables** 클릭

---

## 완료 후 테스트

1. 새 프론트엔드 URL 접속
2. 설정 페이지 이동
3. Solapi API 키 입력:
   - API Key: `NCSM4OQZXGZLFBWW`
   - API Secret: `HIUEVKUJFFJTODQ1QB1J57ARFO1N9JPM`
   - 발신번호: `01042151128`
4. 저장 클릭
5. 성공 메시지 확인

---

## 문제가 계속되면

### 브라우저 캐시 삭제
```
Chrome: Ctrl+Shift+Delete (Windows) / Cmd+Shift+Delete (Mac)
또는 시크릿 모드로 접속
```

### Railway 로그 확인
```
Railway Dashboard → Deployments → 최신 배포 → Deploy Logs
"CORS origin updated" 메시지 확인
```

### 백엔드 Health Check
```bash
curl https://backend-production-c41fe.up.railway.app/api/v1/health
```

---

**작성일**: 2025-11-12  
**긴급도**: 높음  
**예상 소요 시간**: 3분
