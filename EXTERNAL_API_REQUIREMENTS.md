# 외부 API 연동 요구사항

## 1. AI 이미지 합성 API

### 옵션 1: OpenAI DALL-E 3 (권장)

**사용 목적**
- 다중 이미지 편집 및 합성
- 텍스트 오버레이가 포함된 마케팅 이미지 생성

**가입 및 설정**
- OpenAI 계정 생성: https://platform.openai.com
- API 키 발급: Dashboard > API Keys
- 결제 수단 등록 필요

**비용**
- DALL-E 3 Standard: $0.040 / 이미지 (1024x1024)
- DALL-E 3 HD: $0.080 / 이미지 (1024x1024)
- 월 $5 크레딧으로 시작 가능

**제한사항**
- Rate Limit: 분당 5회 요청 (Tier 1)
- 이미지 크기: 1024x1024, 1024x1792, 1792x1024
- 입력 이미지: 최대 4MB
- 상업적 이용: 가능 (생성된 이미지 소유권 보유)

**API 예시**
```typescript
const response = await openai.images.edit({
  image: fs.createReadStream("base.png"),
  mask: fs.createReadStream("mask.png"),
  prompt: "상품 이미지 5장을 그리드 레이아웃으로 배치하고, 하단에 '봄 신상 원피스 45,000원' 텍스트 추가",
  n: 1,
  size: "1024x1792"
});
```

**주의사항**
- 비동기 처리 필수 (응답 시간 10-30초)
- 실패 시 재시도 로직 구현
- 프롬프트 엔지니어링 필요

### 옵션 2: Stability AI (대안)

**사용 목적**
- 고품질 이미지 생성 및 편집

**비용**
- $10 / 1,000 크레딧
- 이미지 생성: 0.2 크레딧/이미지

**제한사항**
- Rate Limit: 초당 10회
- 상업적 이용: Membership 플랜 필요

### 옵션 3: 자체 구현 (Node-Canvas)

**장점**
- 비용 없음
- 완전한 제어 가능
- 빠른 응답 속도

**단점**
- AI 기반 레이아웃 최적화 없음
- 수동 템플릿 디자인 필요

**권장 라이브러리**
```bash
npm install canvas sharp
```

**구현 예시**
```typescript
import { createCanvas, loadImage } from 'canvas';
import sharp from 'sharp';

async function composeImages(images: Buffer[], product: Product) {
  const canvas = createCanvas(1200, 1600);
  const ctx = canvas.getContext('2d');

  // 배경
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1200, 1600);

  // 이미지 그리드 배치
  const positions = calculateGridPositions(images.length);
  for (let i = 0; i < images.length; i++) {
    const img = await loadImage(images[i]);
    const { x, y, width, height } = positions[i];
    ctx.drawImage(img, x, y, width, height);
  }

  // 텍스트 오버레이
  ctx.font = 'bold 48px Pretendard';
  ctx.fillStyle = '#000000';
  ctx.fillText(product.name, 50, 1450);

  ctx.font = '36px Pretendard';
  ctx.fillStyle = '#FF6B6B';
  ctx.fillText(`${product.price.toLocaleString()}원`, 50, 1500);

  return canvas.toBuffer('image/jpeg', { quality: 0.9 });
}
```

---

## 2. SMS/카카오톡 전송 API

### 솔라피 (SOLAPI) - 권장 ⭐

**사용 목적**
- SMS/LMS/MMS/카카오톡 통합 전송 서비스

**장점**
- SMS와 카카오톡을 하나의 API로 통합 관리
- 현대적이고 안정적인 REST API
- 실시간 전송 상태 확인
- 풍부한 SDK 및 문서
- 합리적인 가격

**가입 절차**
1. 솔라피 회원가입: https://solapi.com
2. 본인인증 (개인) 또는 사업자등록증 (법인)
3. API Key 및 API Secret 발급
4. 발신번호 등록 및 인증
5. 카카오톡 채널 연동 (카카오톡 사용 시)

**비용**
- SMS (단문, 90바이트): 8원
- LMS (장문, 2,000바이트): 24원  
- MMS (이미지): 36원
- 카카오톡 알림톡: 9원
- 카카오톡 친구톡: 15원
- 충전식 (최소 1만원)

**제한사항**
- 발신번호 사전 등록 필수
- 광고성 메시지: 수신동의 필수, (광고) 표기 의무
- 야간 발송 제한 (21:00 ~ 08:00)
- Rate Limit: 초당 1,000건 (기본)
- 카카오톡: 채널 친구 추가 또는 템플릿 승인 필요

**API 예시**
```typescript
import { SolapiMessageService } from 'solapi';

const messageService = new SolapiMessageService(API_KEY, API_SECRET);

// SMS 전송
const smsResult = await messageService.send({
  to: '01012345678',
  from: '01087654321',
  text: '신상품 입고! 봄 원피스 45,000원',
  type: 'SMS'
});

// 카카오톡 알림톡 전송
const kakaoResult = await messageService.send({
  to: '01012345678',
  from: 'KAKAO_PFID',
  text: '신상품이 입고되었습니다.\n봄 원피스 45,000원',
  type: 'ATA',
  templateCode: 'PRODUCT_NOTIFICATION',
  buttons: [
    {
      buttonType: 'WL',
      buttonName: '바로주문하기',
      linkMo: 'https://example.com/product/123',
      linkPc: 'https://example.com/product/123'
    }
  ]
});

// MMS (이미지) 전송
const mmsResult = await messageService.send({
  to: '01012345678',
  from: '01087654321',
  text: '신상품 이미지를 확인하세요!',
  type: 'MMS',
  subject: '신상품 안내',
  imageId: 'uploaded_image_id'
});
```

**주요 기능**
- 실시간 전송 상태 확인
- 예약 발송
- 대량 발송 (최대 10,000건/회)
- 이미지 업로드 및 관리
- 전송 통계 및 리포트
- Webhook을 통한 실시간 상태 알림

**개발 문서**
- 공식 문서: https://developers.solapi.com
- SDK: https://github.com/solapi/solapi-sdk-js
- 예제: https://github.com/solapi/examples

### 옵션 2: 네이버 클라우드 SENS

**비용**
- SMS: 건당 9원
- LMS: 건당 30원
- MMS: 건당 50원

**장점**
- 안정적인 인프라
- 대량 발송 지원
- 예약 발송 기능

### 옵션 3: Twilio (해외)

**비용**
- 한국 SMS: $0.0655 / 건 (약 85원)

**장점**
- 글로벌 서비스
- 풍부한 SDK 및 문서

**단점**
- 국내 서비스 대비 비쌈
- 한국 통신사 규제 대응 필요

---

### 기존 알리고 (참고용)

**사용 목적**
- SMS/LMS/MMS 전송

**가입 절차**
1. 알리고 회원가입: https://smartsms.aligo.in
2. 사업자등록증 제출 (선택)
3. API 키 발급
4. 발신번호 등록 및 인증

**비용**
- SMS (단문): 건당 9원
- LMS (장문): 건당 30원
- MMS (이미지): 건당 50원

**단점**
- 카카오톡 별도 연동 필요
- 구식 API 방식
- 제한적인 기능

### 네이버 클라우드 SENS

**비용**
- SMS: 건당 9원
- LMS: 건당 30원
- MMS: 건당 50원

**장점**
- 안정적인 인프라
- 대량 발송 지원

**단점**
- 카카오톡 미지원
- 복잡한 설정

---

## 4. URL 단축 및 추적

### 옵션 1: 자체 구현 (권장)

**장점**
- 완전한 제어
- 비용 없음
- 커스텀 도메인 사용

**구현**
```typescript
// 추적 코드 생성
import { nanoid } from 'nanoid';

const trackingCode = nanoid(10); // 예: 'V1StGXR8_Z'
const trackingUrl = `https://yourdomain.com/t/${trackingCode}`;

// DB 저장
await prisma.trackingEvent.create({
  data: {
    trackingCode,
    productId,
    contactId,
    originalLink: product.marketLink,
  }
});

// 리다이렉트 엔드포인트
@Get('t/:code')
async redirect(@Param('code') code: string, @Res() res: Response) {
  const tracking = await this.trackingService.findByCode(code);
  await this.trackingService.recordClick(tracking.id);
  return res.redirect(tracking.originalLink);
}
```

### 옵션 2: Bitly

**비용**
- Free: 월 1,000 링크
- Starter: $29/월, 월 1,500 링크

**장점**
- 간편한 연동
- 분석 대시보드 제공

**단점**
- 비용 발생
- 외부 의존성

---

## 5. 클라우드 스토리지

### 옵션 1: AWS S3

**비용**
- 스토리지: $0.023 / GB / 월
- 전송: $0.09 / GB (아웃바운드)
- 요청: $0.0004 / 1,000 PUT, $0.0004 / 10,000 GET

**설정**
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadImage(buffer: Buffer, key: string) {
  await s3Client.send(new PutObjectCommand({
    Bucket: 'your-bucket',
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    ACL: 'public-read',
  }));

  return `https://your-bucket.s3.ap-northeast-2.amazonaws.com/${key}`;
}
```

### 옵션 2: Cloudflare R2

**비용**
- 스토리지: $0.015 / GB / 월
- 전송: 무료 (아웃바운드)
- 요청: $4.50 / 백만 쓰기, $0.36 / 백만 읽기

**장점**
- S3 호환 API
- 전송 비용 없음
- 저렴한 스토리지

### 옵션 3: 네이버 클라우드 Object Storage

**비용**
- 스토리지: 월 $0.019 / GB
- 전송: $0.08 / GB

**장점**
- 국내 서비스
- 빠른 속도

---

## 6. 결제 및 구독 (2단계)

### 옵션 1: 토스페이먼츠

**가입 절차**
1. 토스페이먼츠 가입: https://www.tosspayments.com
2. 사업자등록증 제출
3. 심사 (1-2일)
4. API 키 발급

**비용**
- 카드 결제: 3.3% + VAT
- 계좌이체: 1.0% + VAT
- 정기결제: 2.8% + VAT

**API 예시**
```typescript
const response = await axios.post(
  'https://api.tosspayments.com/v1/payments',
  {
    amount: 10000,
    orderId: 'order-123',
    orderName: '프로 플랜 월 구독',
    customerName: '홍길동',
    successUrl: 'https://yourdomain.com/payment/success',
    failUrl: 'https://yourdomain.com/payment/fail',
  },
  {
    headers: {
      'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
  }
);
```

### 옵션 2: Stripe

**비용**
- 카드 결제: 3.6% + $0.30
- 정기결제: 3.6% + $0.30

**장점**
- 글로벌 서비스
- 풍부한 기능
- 구독 관리 기능

**단점**
- 국내 결제 수단 제한적

---

## 7. 인증 및 이메일 (2단계)

### 이메일 발송

**옵션 1: SendGrid**
- Free: 월 100통
- Essentials: $19.95/월, 월 50,000통

**옵션 2: AWS SES**
- $0.10 / 1,000통
- 매우 저렴

**옵션 3: 네이버 클라우드 Simple & Easy Notification Service**
- $0.10 / 1,000통

---

## 외부 API 통합 우선순위

### 1단계 (MVP)
1. **이미지 합성**: 자체 구현 (Node-Canvas) - 비용 절감
2. **SMS**: 알리고 - 저렴하고 안정적
3. **카카오톡**: 비즈뿌리오 대행 - 간편한 연동
4. **스토리지**: AWS S3 - 안정적
5. **추적**: 자체 구현 - 완전한 제어

### 2단계 (SaaS)
1. **결제**: 토스페이먼츠 - 국내 최적화
2. **이메일**: AWS SES - 저렴
3. **이미지 합성**: OpenAI DALL-E 추가 - 고급 기능

---

## 환경 변수 설정 예시

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Redis
REDIS_URL="redis://localhost:6379"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="your-bucket"
AWS_REGION="ap-northeast-2"

# SOLAPI (SMS/카카오톡 통합)
SOLAPI_API_KEY="your-api-key"
SOLAPI_API_SECRET="your-api-secret"
SOLAPI_SENDER="01012345678"
SOLAPI_KAKAO_PFID="your-kakao-plus-friend-id"

# OpenAI (선택)
OPENAI_API_KEY="sk-..."

# 앱 설정
APP_URL="https://yourdomain.com"
APP_PORT="3000"

# 2단계
JWT_SECRET="your-jwt-secret"
TOSS_SECRET_KEY="your-toss-secret-key"
```

---

## 법적 준수 사항

### 개인정보보호법
- 수신자 전화번호 암호화 저장
- 수신동의 관리 (동의일시, 동의방법 기록)
- 개인정보 처리방침 게시
- 수신거부 처리 (080 번호 또는 웹)

### 정보통신망법
- 광고성 정보 전송 시 "(광고)" 표기
- 야간 발송 금지 (21:00 ~ 08:00)
- 수신거부 방법 명시
- 발신자 정보 표기

### 전기통신사업법
- 스팸 신고 시 과태료 부과 가능
- 대량 발송 시 통신사 사전 협의 권장

---

## 개발 단계별 API 연동 계획

### 스프린트 1-2 (상품 관리)
- AWS S3 연동
- 이미지 전처리 (Sharp)

### 스프린트 3 (이미지 합성)
- Node-Canvas 자체 구현
- (선택) OpenAI DALL-E 연동

### 스프린트 4 (주소록)
- 엑셀 파싱 (xlsx 라이브러리)

### 스프린트 4 (발송)
- 솔라피 SDK 연동
- SMS/LMS/MMS 전송 구현
- 카카오톡 알림톡/친구톡 전송 구현

### 스프린트 6 (추적)
- 자체 추적 시스템 구현
- 카카오 웹훅 연동

### 2단계
- 토스페이먼츠 결제 연동
- AWS SES 이메일 연동
