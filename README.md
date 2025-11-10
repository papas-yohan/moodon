# 🚀 Moodon - 상품 마케팅 자동화 플랫폼

> 상품 이미지 합성부터 대량 메시지 발송까지, 마케팅 전 과정을 자동화하는 올인원 플랫폼

## 📋 프로젝트 개요

**Moodon**은 상품 사진 5~6장을 AI로 자동 합성하여 하나의 마케팅 이미지로 생성하고, 등록된 주소록으로 SMS/카카오톡을 일괄 전송하며, 전송·열람·클릭 등 마케팅 효율을 측정/관리하는 시스템입니다.

### 🎯 핵심 기능

1. **상품 관리 시스템**
   - 상품 정보 등록 (이름, 가격, 사이즈, 색상, 링크)
   - 다중 이미지 업로드 및 관리
   - 이미지 자동 리사이즈 및 최적화

2. **AI 이미지 합성**
   - 5~6장 상품 이미지를 1장으로 자동 합성
   - 3가지 템플릿 (Grid, Highlight, Simple)
   - 텍스트 오버레이 (상품명, 가격, 주문 버튼)

3. **주소록 관리**
   - Excel/CSV 파일 업로드
   - 그룹별 관리 및 필터링
   - 중복 체크 및 유효성 검사

4. **대량 메시지 발송**
   - SMS/카카오톡 통합 발송 (솔라피 API)
   - 배치 처리 및 발송 상태 추적
   - 예약 발송 기능

5. **실시간 모니터링**
   - 발송 진행률 실시간 표시
   - 성공/실패 로그 상세 조회
   - 재발송 기능

6. **상세 분석 시스템**
   - ROI 계산 및 분석
   - 고객 세그먼트 분석
   - 시계열 성과 트렌드

7. **설정 관리**
   - API 키 관리 (보안 마스킹)
   - 메시지 템플릿 관리
   - 시스템 설정 및 알림 설정

## 🏗️ 기술 스택

### Backend
- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Queue**: Redis + BullMQ
- **Image Processing**: Sharp
- **File Upload**: Multer
- **API Documentation**: Swagger
- **Testing**: Jest (104개 테스트 통과)

### Frontend
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: TanStack Query + Zustand
- **Data Grid**: AG Grid
- **Charts**: Recharts
- **Icons**: Lucide React

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint + Prettier
- **File Storage**: Local Storage (확장 가능)

### External APIs
- **Messaging**: 솔라피(SOLAPI) 통합 API
  - SMS/LMS/MMS 전송
  - 카카오톡 알림톡/친구톡 전송
  - 실시간 전송 상태 확인

## 📊 프로젝트 현황

### ✅ 완료된 기능 (100%)

| 모듈 | 기능 | 상태 | API 수 | 테스트 수 |
|------|------|------|--------|-----------|
| 상품 관리 | CRUD, 이미지 업로드 | ✅ | 11개 | 26개 |
| 이미지 합성 | AI 합성, 템플릿 시스템 | ✅ | 6개 | 19개 |
| 주소록 관리 | Excel/CSV 업로드, 그룹 관리 | ✅ | 11개 | 23개 |
| 메시지 발송 | SMS/카카오톡 대량 발송 | ✅ | 8개 | 15개 |
| 추적 분석 | 클릭/읽음 추적, 통계 | ✅ | 6개 | 12개 |
| 모니터링 | 실시간 발송 모니터링 | ✅ | 4개 | 5개 |
| 상세 분석 | ROI, 세그먼트 분석 | ✅ | 5개 | 8개 |
| 설정 관리 | API 키, 템플릿, 시스템 설정 | ✅ | 8개 | 6개 |

**총 통계**:
- **API 엔드포인트**: 59개
- **테스트 케이스**: 114개 (모두 통과)
- **프론트엔드 페이지**: 7개
- **코드 커버리지**: 높은 수준 유지

## 🚀 빠른 시작

### 1. 환경 요구사항
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### 2. 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd moodon

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 필요한 값들 설정

# Docker 컨테이너 시작
docker-compose up -d

# 의존성 설치
npm install

# 데이터베이스 마이그레이션
cd backend
npx prisma migrate dev --name init
npx prisma generate

# 개발 서버 시작 (루트 디렉토리에서)
cd ..
npm run dev
```

### 3. 접속 URL
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API 문서**: http://localhost:3000/api/docs
- **Prisma Studio**: `npx prisma studio` (backend 폴더에서)

## 📱 주요 화면

### 1. 대시보드
- 전체 통계 요약 (발송/읽음/클릭)
- 최근 활동 및 성과 차트
- 빠른 액션 버튼

### 2. 상품 관리
- AG Grid 기반 상품 목록
- 상품 등록/수정 폼
- 이미지 업로드 및 합성

### 3. 연락처 관리
- Excel/CSV 파일 업로드
- 그룹별 필터링 및 검색
- 일괄 작업 (삭제, 그룹 변경)

### 4. 메시지 발송
- 4단계 발송 프로세스
  1. 상품 선택
  2. 연락처 선택
  3. 메시지 작성
  4. 발송 확인
- 채널 선택 (SMS/카카오톡/둘다)
- 예약 발송 및 비용 계산

### 5. 발송 모니터링
- 실시간 발송 진행률
- 성공/실패 로그 상세 조회
- 실패 건 재발송

### 6. 상세 분석
- ROI 분석 차트
- 고객 세그먼트 분석
- 시계열 트렌드 분석
- 데이터 내보내기 (CSV)

### 7. 설정 관리
- API 키 관리 (보안 마스킹)
- 메시지 템플릿 CRUD
- 알림 설정 (이메일/SMS/웹훅)
- 시스템 설정 (발송 제한, 기능 토글)

## 🔧 개발 가이드

### 프로젝트 구조
```
moodon/
├── backend/                 # NestJS 백엔드
│   ├── src/
│   │   ├── modules/        # 기능별 모듈
│   │   ├── common/         # 공통 모듈 (Prisma, Health)
│   │   └── config/         # 설정 파일
│   ├── prisma/             # 데이터베이스 스키마
│   └── uploads/            # 업로드된 파일
├── frontend/               # React 프론트엔드
│   ├── src/
│   │   ├── components/     # 재사용 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── hooks/          # 커스텀 훅
│   │   └── utils/          # 유틸리티 함수
└── docker-compose.yml      # 개발 환경 설정
```

### 주요 모듈

#### Backend 모듈
- **Products**: 상품 CRUD 및 이미지 관리
- **Composer**: 이미지 합성 시스템
- **Contacts**: 주소록 관리 및 파일 업로드
- **Messaging**: SMS/카카오톡 발송
- **Tracking**: 클릭/읽음 추적 및 분석
- **Settings**: 설정 관리

#### Frontend 페이지
- **Dashboard**: 메인 대시보드
- **Products**: 상품 관리
- **Contacts**: 연락처 관리
- **Send**: 메시지 발송
- **SendMonitor**: 발송 모니터링
- **Analytics**: 상세 분석 (미구현)
- **Settings**: 설정 관리

### API 문서
모든 API는 Swagger로 문서화되어 있습니다.
- 접속: http://localhost:3000/api/docs
- 각 엔드포인트별 요청/응답 스키마 확인 가능
- Try it out 기능으로 직접 테스트 가능

### 테스트 실행
```bash
# 백엔드 테스트
cd backend
npm test

# 프론트엔드 테스트
cd frontend
npm test

# 전체 테스트 (루트에서)
npm run test:all
```

## 🔐 보안 고려사항

### 1. API 키 보안
- 환경 변수로 관리
- 프론트엔드에서 마스킹 표시
- 암호화 저장 (향후 구현)

### 2. 파일 업로드 보안
- 파일 타입 검증
- 파일 크기 제한
- 악성 파일 스캔 (향후 구현)

### 3. 개인정보 보호
- 전화번호 등 개인정보 암호화 (향후 구현)
- GDPR 준수 (향후 구현)

## 📈 성능 최적화

### 1. 이미지 처리
- Sharp 라이브러리로 빠른 이미지 처리
- 자동 리사이즈 및 최적화
- 비동기 처리로 사용자 경험 향상

### 2. 대량 발송
- BullMQ 기반 작업 큐
- 배치 처리로 API 제한 준수
- 실패 재시도 로직

### 3. 데이터베이스
- Prisma ORM으로 타입 안전성
- 인덱스 최적화
- 커넥션 풀링

## 🚀 배포 가이드

### 1. 환경 변수 설정
```bash
# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/moodon"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# 솔라피 API
SOLAPI_API_KEY="your_api_key"
SOLAPI_API_SECRET="your_api_secret"

# 파일 업로드
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE="10485760"  # 10MB
```

### 2. 프로덕션 빌드
```bash
# 백엔드 빌드
cd backend
npm run build

# 프론트엔드 빌드
cd frontend
npm run build
```

### 3. 데이터베이스 마이그레이션
```bash
cd backend
npx prisma migrate deploy
```

## 🔄 향후 계획

### Phase 2: SaaS 확장
- [ ] 사용자 인증 시스템
- [ ] 구독 및 결제 시스템
- [ ] 멀티 테넌시
- [ ] API 키 기반 외부 연동
- [ ] 관리자 대시보드

### Phase 3: 고급 기능
- [ ] AI 기반 메시지 최적화
- [ ] A/B 테스트 기능
- [ ] 고급 분석 및 리포트
- [ ] 모바일 앱
- [ ] 다국어 지원

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**Moodon** - 마케팅 자동화의 새로운 기준 🚀