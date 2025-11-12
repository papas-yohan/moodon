# 🔧 영구적인 해결책

## 문제
Vercel이 매번 새로운 URL을 생성하여 Railway CORS 설정을 계속 변경해야 함

## 해결책 1: CORS 와일드카드 패턴 (임시)

Railway Variables에서 CORS_ORIGIN을 다음으로 변경:

```
https://frontend-yohans-projects-de3234df.vercel.app,https://*.vercel.app
```

또는 개발 중에는:

```
*
```

⚠️ 주의: `*`는 모든 도메인을 허용하므로 보안에 취약합니다. 프로덕션에서는 사용하지 마세요.

## 해결책 2: Vercel 커스텀 도메인 사용 (권장)

### 1. Vercel에서 프로젝트 설정
1. Vercel Dashboard → frontend 프로젝트
2. Settings → Domains
3. 기본 프로덕션 도메인 확인: `frontend-yohans-projects-de3234df.vercel.app`

### 2. Railway CORS 설정
```
https://frontend-yohans-projects-de3234df.vercel.app
```

이 URL은 변경되지 않으므로 한 번만 설정하면 됩니다.

### 3. 이 URL로 항상 접속
```
https://frontend-yohans-projects-de3234df.vercel.app
```

## 해결책 3: 백엔드 CORS 코드 수정 (최선)

백엔드 코드에서 CORS를 동적으로 처리하도록 수정:

```typescript
// backend/src/main.ts
const corsOrigin = process.env.NODE_ENV === 'production' 
  ? (origin: string, callback: any) => {
      // Vercel 도메인 패턴 허용
      if (origin.endsWith('.vercel.app') || origin === process.env.CORS_ORIGIN) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  : ['http://localhost:5173', 'http://localhost:3000'];

app.enableCors({
  origin: corsOrigin,
  credentials: true,
  // ...
});
```

## 당장 해야 할 일

### 옵션 A: 임시 해결 (빠름)
Railway CORS_ORIGIN을 `*`로 설정

### 옵션 B: 영구 해결 (권장)
1. Vercel 기본 도메인 확인
2. Railway CORS를 해당 도메인으로 설정
3. 항상 그 도메인으로 접속

---

## 현재 상황

**최신 프론트엔드 URL:**
```
https://frontend-c1768s650-yohans-projects-de3234df.vercel.app
```

**Vercel 기본 프로덕션 URL (추정):**
```
https://frontend-yohans-projects-de3234df.vercel.app
```

**권장 사항:**
기본 프로덕션 URL을 사용하고 Railway CORS를 그것으로 설정하세요.
