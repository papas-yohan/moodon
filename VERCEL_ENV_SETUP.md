# 🔐 Vercel 환경 변수 설정 가이드

## 백엔드 배포 완료! ✅

**배포 URL:** https://backend-4veafqn01-yohans-projects-de3234df.vercel.app

---

## 📋 환경 변수 설정 (필수)

### 1. Vercel Dashboard 접속
1. https://vercel.com/dashboard 접속
2. **backend** 프로젝트 클릭
3. 상단 **Settings** 탭 클릭
4. 왼쪽 메뉴 **Environment Variables** 클릭

### 2. 환경 변수 추가 (9개)

각 변수를 하나씩 추가하세요:

#### DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://postgres.jtdrqyyzeaamogbxtelj:Yohan0817**@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
Environment: Production, Preview, Development (모두 체크)
```

#### SOLAPI_API_KEY
```
Name: SOLAPI_API_KEY
Value: NCSM4OQZXGZLFBWW
Environment: Production, Preview, Development (모두 체크)
```

#### SOLAPI_API_SECRET
```
Name: SOLAPI_API_SECRET
Value: HIUEVKUJFFJTODQ1QB1J57ARFO1N9JPM
Environment: Production, Preview, Development (모두 체크)
```

#### SOLAPI_SENDER
```
Name: SOLAPI_SENDER
Value: 01042151128
Environment: Production, Preview, Development (모두 체크)
```

#### CLOUDINARY_CLOUD_NAME
```
Name: CLOUDINARY_CLOUD_NAME
Value: djxrffrjfg
Environment: Production, Preview, Development (모두 체크)
```

#### CLOUDINARY_API_KEY
```
Name: CLOUDINARY_API_KEY
Value: 222333877835831
Environment: Production, Preview, Development (모두 체크)
```

#### CLOUDINARY_API_SECRET
```
Name: CLOUDINARY_API_SECRET
Value: QS25mKuuOqzZODDZPNvIji308aA
Environment: Production, Preview, Development (모두 체크)
```

#### ENCRYPTION_KEY
```
Name: ENCRYPTION_KEY
Value: 3ygDe7hSi2KX3VZAnyVR7aitfpHc8pSR
Environment: Production, Preview, Development (모두 체크)
```

#### NODE_ENV
```
Name: NODE_ENV
Value: production
Environment: Production, Preview, Development (모두 체크)
```

### 3. 재배포
환경 변수 설정 후:
1. 상단 **Deployments** 탭 클릭
2. 최신 배포 옆 **⋯** 메뉴 클릭
3. **Redeploy** 클릭
4. **Redeploy** 버튼 다시 클릭하여 확인

---

## ✅ 체크리스트

- [ ] DATABASE_URL 추가
- [ ] SOLAPI_API_KEY 추가
- [ ] SOLAPI_API_SECRET 추가
- [ ] SOLAPI_SENDER 추가
- [ ] CLOUDINARY_CLOUD_NAME 추가
- [ ] CLOUDINARY_API_KEY 추가
- [ ] CLOUDINARY_API_SECRET 추가
- [ ] ENCRYPTION_KEY 추가
- [ ] NODE_ENV 추가
- [ ] 재배포 완료

---

## 🧪 배포 확인

환경 변수 설정 및 재배포 후:

```bash
curl https://backend-4veafqn01-yohans-projects-de3234df.vercel.app/api/v1/health
```

예상 응답:
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T..."
}
```

---

**다음 단계:** 환경 변수 설정이 완료되면 프론트엔드 배포를 진행합니다! 🚀
