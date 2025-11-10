# 📱 솔라피(SOLAPI) API 연동 계획

## 📅 작업 정보
- **예상 소요 시간**: 1-2일
- **우선순위**: 🔥 높음 (핵심 기능)
- **상태**: 📋 계획 단계

## 🎯 목표

실제 SMS/카카오톡 발송 기능을 솔라피 API로 구현하여 MVP 완성

---

## 📊 현재 상태

### ✅ 이미 구현된 것
1. **백엔드 구조**
   - `MessagingService` - 발송 로직
   - `SendJob` Entity - 발송 작업 관리
   - `SendLog` Entity - 발송 로그
   - API 엔드포인트 완성

2. **프론트엔드 UI**
   - 발송 페이지 (`/send`)
   - 4단계 발송 프로세스
   - 채널 선택 (SMS/카카오톡)
   - 예약 발송 기능

3. **환경 설정**
   - `.env.example`에 솔라피 설정 준비됨
   ```bash
   SOLAPI_API_KEY=your-solapi-api-key
   SOLAPI_API_SECRET=your-solapi-api-secret
   SOLAPI_SENDER=01012345678
   SOLAPI_KAKAO_PFID=your-kakao-plus-friend-id
   ```

### ❓ 구현 필요한 것
1. **실제 API 연동**
   - 솔라피 계정 생성
   - API 키 발급
   - 실제 발송 테스트

2. **메시지 템플릿 적용**
   - 합성 이미지 URL 포함
   - 추적 URL 생성
   - 상품 정보 삽입

3. **에러 처리**
   - 잔액 부족
   - 잘못된 전화번호
   - API 오류

---

## 🚀 구현 계획

### Phase 1: 솔라피 계정 설정 (30분)

#### 1.1 계정 생성
```
1. https://solapi.com 접속
2. 회원가입
3. 본인인증 완료
4. 발신번호 등록 (080 무료 번호 또는 실제 번호)
```

#### 1.2 API 키 발급
```
1. 콘솔 → API 설정
2. API Key 생성
3. API Key, API Secret 복사
4. .env 파일에 저장
```

#### 1.3 테스트 크레딧
```
- 신규 가입 시 무료 크레딧 제공
- 또는 소액 충전 (5,000원)
- SMS: 8원/건
- 카카오톡: 9-15원/건
```

---

### Phase 2: 백엔드 구현 (3-4시간)

#### 2.1 솔라피 SDK 설치
```bash
cd backend
npm install solapi
```

#### 2.2 SolapiAdapter 구현

**파일**: `backend/src/modules/messaging/adapters/solapi.adapter.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SolapiMessageService } from 'solapi';

@Injectable()
export class SolapiAdapter {
  private readonly logger = new Logger(SolapiAdapter.name);
  private messageService: SolapiMessageService;

  constructor(private configService: ConfigService) {
    this.messageService = new SolapiMessageService(
      this.configService.get('SOLAPI_API_KEY'),
      this.configService.get('SOLAPI_API_SECRET'),
    );
  }

  /**
   * SMS 발송
   */
  async sendSMS(to: string, text: string): Promise<any> {
    try {
      const result = await this.messageService.sendOne({
        to,
        from: this.configService.get('SOLAPI_SENDER'),
        text,
      });

      this.logger.log(`SMS 발송 성공: ${to}`);
      return result;
    } catch (error) {
      this.logger.error(`SMS 발송 실패: ${to}`, error);
      throw error;
    }
  }

  /**
   * MMS 발송 (이미지 포함)
   */
  async sendMMS(to: string, text: string, imageUrl: string): Promise<any> {
    try {
      const result = await this.messageService.sendOne({
        to,
        from: this.configService.get('SOLAPI_SENDER'),
        text,
        type: 'MMS',
        imageId: await this.uploadImage(imageUrl),
      });

      this.logger.log(`MMS 발송 성공: ${to}`);
      return result;
    } catch (error) {
      this.logger.error(`MMS 발송 실패: ${to}`, error);
      throw error;
    }
  }

  /**
   * 카카오톡 알림톡 발송
   */
  async sendKakao(to: string, templateCode: string, params: any): Promise<any> {
    try {
      const result = await this.messageService.sendOne({
        to,
        from: this.configService.get('SOLAPI_SENDER'),
        type: 'ATA', // 알림톡
        kakaoOptions: {
          pfId: this.configService.get('SOLAPI_KAKAO_PFID'),
          templateId: templateCode,
          variables: params,
        },
      });

      this.logger.log(`카카오톡 발송 성공: ${to}`);
      return result;
    } catch (error) {
      this.logger.error(`카카오톡 발송 실패: ${to}`, error);
      throw error;
    }
  }

  /**
   * 이미지 업로드
   */
  private async uploadImage(imageUrl: string): Promise<string> {
    // 솔라피에 이미지 업로드
    const result = await this.messageService.uploadFile(imageUrl);
    return result.fileId;
  }

  /**
   * 잔액 조회
   */
  async getBalance(): Promise<number> {
    const result = await this.messageService.getBalance();
    return result.balance;
  }
}
```

#### 2.3 MessagingService 업데이트

**파일**: `backend/src/modules/messaging/messaging.service.ts`

```typescript
import { SolapiAdapter } from './adapters/solapi.adapter';

@Injectable()
export class MessagingService {
  constructor(
    private solapiAdapter: SolapiAdapter,
    // ...
  ) {}

  async sendMessage(sendJob: SendJob, contact: Contact, product: Product) {
    // 추적 URL 생성
    const trackingCode = this.generateTrackingCode();
    const trackingUrl = `${process.env.APP_URL}/track/${trackingCode}`;

    // 메시지 내용 생성
    const message = `
🎉 신상품 입고!

${product.name}
💰 ${product.price.toLocaleString()}원
📏 사이즈: ${product.size}
🎨 색상: ${product.color}

👉 바로주문하기: ${trackingUrl}
    `.trim();

    try {
      let result;

      if (sendJob.channel === 'sms' || sendJob.channel === 'both') {
        // MMS 발송 (이미지 포함)
        result = await this.solapiAdapter.sendMMS(
          contact.phone,
          message,
          product.composedImageUrl,
        );
      }

      if (sendJob.channel === 'kakao' || sendJob.channel === 'both') {
        // 카카오톡 발송
        result = await this.solapiAdapter.sendKakao(
          contact.phone,
          'PRODUCT_PROMOTION', // 템플릿 코드
          {
            name: product.name,
            price: product.price.toLocaleString(),
            size: product.size,
            color: product.color,
            url: trackingUrl,
          },
        );
      }

      // 발송 로그 저장
      await this.saveSendLog(sendJob, contact, product, result, 'success');

      return result;
    } catch (error) {
      // 에러 로그 저장
      await this.saveSendLog(sendJob, contact, product, null, 'failed', error);
      throw error;
    }
  }
}
```

---

### Phase 3: 카카오톡 템플릿 등록 (1-2시간)

#### 3.1 템플릿 작성
```
1. 솔라피 콘솔 → 카카오톡 → 템플릿 관리
2. 새 템플릿 등록
3. 템플릿 코드: PRODUCT_PROMOTION
```

**템플릿 내용**:
```
🎉 신상품 입고!

#{name}
💰 #{price}원
📏 사이즈: #{size}
🎨 색상: #{color}

👉 바로주문하기
#{url}
```

**변수**:
- `name`: 상품명
- `price`: 가격
- `size`: 사이즈
- `color`: 색상
- `url`: 추적 URL

#### 3.2 템플릿 승인 대기
```
- 카카오 검수: 1-2일 소요
- 검수 중에는 SMS로 대체 발송
```

---

### Phase 4: 테스트 (2-3시간)

#### 4.1 단위 테스트
```typescript
describe('SolapiAdapter', () => {
  it('SMS 발송 성공', async () => {
    const result = await adapter.sendSMS('01012345678', '테스트 메시지');
    expect(result.statusCode).toBe('2000');
  });

  it('MMS 발송 성공', async () => {
    const result = await adapter.sendMMS(
      '01012345678',
      '테스트 메시지',
      'https://example.com/image.jpg',
    );
    expect(result.statusCode).toBe('2000');
  });

  it('잔액 조회', async () => {
    const balance = await adapter.getBalance();
    expect(balance).toBeGreaterThan(0);
  });
});
```

#### 4.2 통합 테스트
```
1. 실제 전화번호로 SMS 발송
2. 이미지 포함 MMS 발송
3. 카카오톡 발송 (템플릿 승인 후)
4. 발송 로그 확인
5. 추적 URL 클릭 테스트
```

#### 4.3 에러 시나리오 테스트
```
- 잘못된 전화번호
- 잔액 부족
- 이미지 업로드 실패
- API 타임아웃
- 네트워크 오류
```

---

### Phase 5: 에러 처리 및 재시도 (1-2시간)

#### 5.1 에러 코드 매핑
```typescript
const ERROR_MESSAGES = {
  '4000': '잘못된 요청입니다.',
  '4001': '잘못된 전화번호입니다.',
  '4100': '잔액이 부족합니다.',
  '5000': '서버 오류가 발생했습니다.',
};
```

#### 5.2 재시도 로직
```typescript
async sendWithRetry(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await this.delay(1000 * (i + 1)); // 지수 백오프
    }
  }
}
```

---

## 📋 체크리스트

### 준비 단계
- [ ] 솔라피 계정 생성
- [ ] 본인인증 완료
- [ ] 발신번호 등록
- [ ] API 키 발급
- [ ] 테스트 크레딧 충전

### 개발 단계
- [ ] solapi SDK 설치
- [ ] SolapiAdapter 구현
- [ ] MessagingService 업데이트
- [ ] 환경 변수 설정
- [ ] 단위 테스트 작성

### 테스트 단계
- [ ] SMS 발송 테스트
- [ ] MMS 발송 테스트
- [ ] 카카오톡 템플릿 등록
- [ ] 카카오톡 발송 테스트
- [ ] 에러 시나리오 테스트

### 배포 단계
- [ ] 프로덕션 API 키 설정
- [ ] 실제 발신번호 등록
- [ ] 모니터링 설정
- [ ] 사용자 문서 작성

---

## 💰 비용 예상

### 테스트 단계
```
- SMS: 8원 x 100건 = 800원
- MMS: 30원 x 50건 = 1,500원
- 카카오톡: 15원 x 50건 = 750원
총: 약 3,000원
```

### 운영 단계 (월 1,000건 기준)
```
- SMS: 8원 x 500건 = 4,000원
- MMS: 30원 x 300건 = 9,000원
- 카카오톡: 15원 x 200건 = 3,000원
총: 약 16,000원/월
```

---

## 🔗 참고 자료

### 공식 문서
- 솔라피 공식 사이트: https://solapi.com
- API 문서: https://docs.solapi.com
- Node.js SDK: https://github.com/solapi/solapi-nodejs

### 예제 코드
- SMS 발송: https://docs.solapi.com/examples/sms
- MMS 발송: https://docs.solapi.com/examples/mms
- 카카오톡: https://docs.solapi.com/examples/kakao

---

## 🎯 성공 기준

1. ✅ SMS 발송 성공률 > 95%
2. ✅ MMS 이미지 정상 표시
3. ✅ 카카오톡 템플릿 승인
4. ✅ 추적 URL 정상 작동
5. ✅ 에러 처리 완료
6. ✅ 발송 로그 정상 저장

---

**작성자**: Kiro AI  
**작성일**: 2025-11-07  
**버전**: 1.0.0  
**상태**: 📋 계획 완료
