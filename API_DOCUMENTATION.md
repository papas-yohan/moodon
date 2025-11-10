# API 문서

> 신상마켓 상품 홍보 시스템 REST API 가이드

## 📌 개요

이 문서는 현재 구현된 API 엔드포인트들을 정리한 것입니다.
모든 API는 Swagger UI에서도 확인할 수 있습니다: `http://localhost:3000/api/docs`

## 🔗 Base URL

- **개발 환경**: `http://localhost:3000/api/v1`
- **프로덕션**: `https://your-domain.com/api/v1`

## 📊 API 통계

- **총 엔드포인트**: 28개
- **상품 관리**: 11개
- **이미지 합성**: 6개
- **주소록 관리**: 11개

---

## 🛍 상품 관리 API

### 기본 CRUD

| 메서드 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| POST | `/products` | 상품 등록 | ✅ |
| GET | `/products` | 상품 목록 조회 | ✅ |
| GET | `/products/stats` | 상품 통계 | ✅ |
| GET | `/products/:id` | 상품 상세 조회 | ✅ |
| PATCH | `/products/:id` | 상품 수정 | ✅ |
| DELETE | `/products/:id` | 상품 삭제 | ✅ |

### 이미지 관리

| 메서드 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| POST | `/products/:id/images` | 단일 이미지 업로드 | ✅ |
| POST | `/products/:id/images/multiple` | 다중 이미지 업로드 | ✅ |
| GET | `/products/:id/images` | 이미지 목록 조회 | ✅ |
| DELETE | `/products/:id/images/:imageId` | 이미지 삭제 | ✅ |
| PATCH | `/products/:id/images/reorder` | 이미지 순서 변경 | ✅ |

### 예시 요청/응답

#### 상품 등록
```http
POST /api/v1/products
Content-Type: application/json

{
  "name": "봄 신상 원피스",
  "price": 45000,
  "size": "Free",
  "color": "베이지",
  "marketLink": "https://example.com/product/123"
}
```

```json
{
  "id": "cm3a8ixqy0000uxqhqhqhqhqh",
  "name": "봄 신상 원피스",
  "price": 45000,
  "size": "Free",
  "color": "베이지",
  "marketLink": "https://example.com/product/123",
  "composedImageUrl": null,
  "sendCount": 0,
  "readCount": 0,
  "clickCount": 0,
  "status": "DRAFT",
  "createdAt": "2025-11-05T09:31:07.070Z",
  "updatedAt": "2025-11-05T09:31:07.070Z",
  "images": []
}
```

---

## 🎨 이미지 합성 API

| 메서드 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| POST | `/composer/jobs` | 합성 작업 생성 | ✅ |
| GET | `/composer/jobs` | 합성 작업 목록 조회 | ✅ |
| GET | `/composer/jobs/stats` | 합성 작업 통계 | ✅ |
| GET | `/composer/jobs/:id` | 합성 작업 상세 조회 | ✅ |
| POST | `/composer/jobs/:id/retry` | 합성 작업 재시도 | ✅ |
| POST | `/composer/products/:productId/compose` | 상품 이미지 합성 | ✅ |

### 템플릿 종류

- **grid**: 6개 이미지를 3x2 그리드로 배치
- **highlight**: 메인 이미지 + 썸네일 4개
- **simple**: 2개 이미지를 세로로 배치

### 예시 요청/응답

#### 이미지 합성 요청
```http
POST /api/v1/composer/products/cm3a8ixqy0000uxqhqhqhqhqh/compose?templateType=grid
```

```json
{
  "id": "cmhlv85y60001xdikys127phk",
  "productId": "cm3a8ixqy0000uxqhqhqhqhqh",
  "status": "PENDING",
  "templateType": "grid",
  "resultUrl": null,
  "errorMessage": null,
  "retryCount": 0,
  "startedAt": null,
  "completedAt": null,
  "createdAt": "2025-11-05T10:39:08.574Z"
}
```

---

## 📞 주소록 관리 API

### 기본 CRUD

| 메서드 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| POST | `/contacts` | 연락처 등록 | ✅ |
| GET | `/contacts` | 연락처 목록 조회 | ✅ |
| GET | `/contacts/stats` | 연락처 통계 | ✅ |
| GET | `/contacts/groups` | 그룹 목록 조회 | ✅ |
| GET | `/contacts/:id` | 연락처 상세 조회 | ✅ |
| PATCH | `/contacts/:id` | 연락처 수정 | ✅ |
| DELETE | `/contacts/:id` | 연락처 삭제 | ✅ |

### 파일 업로드 및 일괄 작업

| 메서드 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| GET | `/contacts/template` | 업로드 템플릿 다운로드 | ✅ |
| POST | `/contacts/upload` | 파일 업로드 (Excel/CSV) | ✅ |
| POST | `/contacts/bulk/delete` | 일괄 삭제 | ✅ |
| POST | `/contacts/bulk/group` | 일괄 그룹 변경 | ✅ |

### 예시 요청/응답

#### 연락처 등록
```http
POST /api/v1/contacts
Content-Type: application/json

{
  "name": "홍길동",
  "phone": "01012345678",
  "kakaoId": "hong123",
  "groupName": "VIP고객",
  "tags": "신규고객,20대"
}
```

#### 파일 업로드
```http
POST /api/v1/contacts/upload
Content-Type: multipart/form-data

file: contacts.xlsx
defaultGroupName: 업로드그룹
overwriteDuplicates: false
skipInvalid: true
```

```json
{
  "summary": {
    "total": 10,
    "valid": 9,
    "invalid": 1,
    "created": 8,
    "updated": 1,
    "skipped": 0
  },
  "errors": [
    {
      "row": 5,
      "data": { "name": "잘못된데이터", "phone": "잘못된번호" },
      "error": "올바르지 않은 전화번호 형식입니다."
    }
  ]
}
```

---

## 🔍 공통 쿼리 파라미터

### 페이지네이션
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)

### 정렬
- `sort`: 정렬 기준 (예: `createdAt:desc`, `name:asc`)

### 검색 및 필터
- `search`: 검색어
- `status`: 상태 필터
- `groupName`: 그룹 필터
- `isActive`: 활성 상태 필터

### 예시
```http
GET /api/v1/products?page=1&limit=10&search=원피스&sort=createdAt:desc
GET /api/v1/contacts?groupName=VIP고객&isActive=true
```

---

## 📝 응답 형식

### 성공 응답
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### 에러 응답
```json
{
  "message": "에러 메시지",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 🔐 인증 (2단계에서 구현 예정)

현재는 인증이 없지만, 2단계에서 JWT 기반 인증을 구현할 예정입니다.

```http
Authorization: Bearer <jwt-token>
```

---

## 📊 상태 코드

- `200`: 성공
- `201`: 생성 성공
- `204`: 삭제 성공 (내용 없음)
- `400`: 잘못된 요청
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 내부 오류

---

## 🧪 테스트

모든 API는 단위 테스트와 통합 테스트를 통과했습니다.

- **총 테스트**: 68개
- **커버리지**: 높은 수준 유지
- **테스트 도구**: Jest, Supertest

---

## 📚 추가 리소스

- [Swagger UI](http://localhost:3000/api/docs) - 대화형 API 문서
- [Postman Collection](./postman_collection.json) - API 테스트용 컬렉션
- [개발 가이드](./DEVELOPMENT_DESIGN.md) - 상세한 개발 문서

---

**업데이트**: 2025-11-05
**버전**: v1.0.0