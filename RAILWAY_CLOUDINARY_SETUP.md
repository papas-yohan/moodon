# 🚨 Railway Cloudinary 환경 변수 설정

## 문제 상황
상품 등록 시 이미지 업로드가 400 Bad Request 오류로 실패하고 있습니다.

## 원인
Railway에 Cloudinary 환경 변수가 설정되지 않아서, 백엔드가 로컬 스토리지를 사용하려고 하지만 Railway의 ephemeral filesystem 때문에 실패합니다.

## 해결 방법

### 1. Railway Dashboard 접속
```
https://railway.app/dashboard
→ backend-production-c41fe 프로젝트 선택
→ Variables 탭 클릭
```

### 2. 다음 환경 변수 추가

```bash
CLOUDINARY_CLOUD_NAME=djxrffrjfg
CLOUDINARY_API_KEY=222333877835831
CLOUDINARY_API_SECRET=QS25mKuuOqzZODDZPNvIji308aA
```

### 3. 저장 후 자동 재배포 대기
Railway는 환경 변수 변경 시 자동으로 재배포됩니다 (2-3분 소요).

### 4. 재배포 확인
```bash
# Health Check로 uptime 확인 (낮으면 재배포됨)
curl https://backend-production-c41fe.up.railway.app/api/v1/health
```

### 5. 로그 확인
Railway Dashboard → Deployments → 최신 배포 → Deploy Logs

다음 로그가 보여야 합니다:
```
✅ "Cloudinary storage initialized successfully"
```

## 테스트

환경 변수 설정 및 재배포 완료 후:

1. 프론트엔드에서 상품 등록
2. 이미지 6장 선택
3. 저장 버튼 클릭
4. 성공 메시지 확인
5. 이미지가 Cloudinary URL로 표시되는지 확인
   - 예: `https://res.cloudinary.com/djxrffrjfg/...`

## 현재 상태

- ✅ 코드 수정 완료 (Cloudinary 통합)
- ✅ Git 푸시 완료
- ⏳ Railway 환경 변수 설정 필요
- ⏳ Railway 재배포 대기

---

**작성일**: 2025-11-15  
**우선순위**: 🔥 긴급
