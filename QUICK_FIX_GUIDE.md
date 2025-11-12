# ⚡ 빠른 해결 가이드

## 🔴 현재 문제
설정 페이지에서 Solapi API 키 저장 시 `ERR_CONNECTION_REFUSED` 오류 발생

## ✅ 해결 완료
1. ✅ 프론트엔드 환경 변수 설정 완료
2. ✅ 프론트엔드 재배포 완료
3. 🔄 Railway CORS 설정 업데이트 필요 (사용자 작업)

---

## 📋 지금 해야 할 작업

### Railway에서 CORS 설정 업데이트 (3분)

#### 1. Railway 대시보드 접속
```
https://railway.app/dashboard
```

#### 2. 환경 변수 업데이트
1. **moodon** 프로젝트 → **backend** 서비스 클릭
2. **Variables** 탭 클릭
3. **CORS_ORIGIN** 찾기
4. 값을 다음으로 변경:

```
https://frontend-m28a3iepf-yohans-projects-de3234df.vercel.app
```

5. **Save** 클릭
6. 자동 재배포 대기 (1-2분)

---

## 🎯 업데이트 후 테스트

### 새 프론트엔드 URL
```
https://frontend-m28a3iepf-yohans-projects-de3234df.vercel.app
```

### 테스트 순서
1. 위 URL로 접속
2. 설정 페이지 이동
3. Solapi API 키 입력:
   ```
   API Key: NCSM4OQZXGZLFBWW
   API Secret: HIUEVKUJFFJTODQ1QB1J57ARFO1N9JPM
   발신번호: 01042151128
   ```
4. 저장 클릭
5. ✅ 성공 메시지 확인

---

## 🔍 문제가 계속되면

### 1. 브라우저 캐시 삭제
- Chrome: `Ctrl+Shift+Delete` (Windows) / `Cmd+Shift+Delete` (Mac)
- 또는 **시크릿 모드**로 접속

### 2. Railway 재배포 확인
```
Railway Dashboard → Deployments
최신 배포 상태가 "Active"인지 확인
```

### 3. 백엔드 로그 확인
```
Railway Dashboard → Deployments → Deploy Logs
"Application is running on..." 메시지 확인
```

---

## 📊 시스템 상태

### ✅ 정상 작동
- 백엔드 (Railway): https://backend-production-c41fe.up.railway.app
- 데이터베이스 (Supabase): 연결 정상
- API Health Check: 정상

### 🔄 업데이트 필요
- Railway CORS 설정: 새 프론트엔드 URL로 변경 필요

### ✅ 완료
- 프론트엔드 환경 변수: 설정 완료
- 프론트엔드 배포: 완료

---

## 💡 왜 이런 일이 발생했나요?

Vercel은 매번 배포할 때마다 새로운 URL을 생성합니다:
- 이전: `frontend-5nty8738z-...`
- 현재: `frontend-m28a3iepf-...`

백엔드의 CORS 설정이 이전 URL을 가리키고 있어서 새 URL에서의 요청이 차단되었습니다.

**해결책**: Railway에서 CORS_ORIGIN을 새 URL로 업데이트

---

## 🎉 완료 후

모든 기능이 정상 작동합니다:
- ✅ 상품 관리
- ✅ 이미지 합성
- ✅ 연락처 관리
- ✅ 메시지 발송
- ✅ 통계 확인

**즐거운 마케팅 되세요!** 🚀

---

**작성일**: 2025-11-12  
**예상 소요 시간**: 3분  
**난이도**: 쉬움
