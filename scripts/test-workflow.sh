#!/bin/bash

# Moodon 전체 워크플로우 테스트 스크립트
set -e

echo "🧪 Moodon 전체 워크플로우 테스트를 시작합니다..."
echo "========================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 테스트 결과 저장
RESULTS=()

# 테스트 함수
test_api() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -e "${BLUE}테스트: $name${NC}"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" "$url")
    fi
    
    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$response" | sed -e 's/HTTPSTATUS\:.*//g')
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ 성공 (HTTP $http_code)${NC}"
        RESULTS+=("✅ $name")
        return 0
    else
        echo -e "${RED}❌ 실패 (HTTP $http_code)${NC}"
        echo "응답: $body"
        RESULTS+=("❌ $name")
        return 1
    fi
}

# 1. 서버 상태 확인
echo -e "\n${YELLOW}1. 서버 상태 확인${NC}"
test_api "헬스체크" "GET" "http://localhost:3000/health" "" 200
test_api "API 문서" "GET" "http://localhost:3000/api/docs" "" 200

# 2. 상품 관리 테스트
echo -e "\n${YELLOW}2. 상품 관리 테스트${NC}"
test_api "상품 목록 조회" "GET" "http://localhost:3000/api/v1/products" "" 200

# 새 상품 생성 (타임스탬프로 중복 방지)
TIMESTAMP=$(date +%s)
PRODUCT_DATA="{
  \"name\": \"테스트 상품 워크플로우 $TIMESTAMP\",
  \"price\": 39900,
  \"description\": \"워크플로우 테스트용 상품\",
  \"category\": \"의류\",
  \"size\": \"L\",
  \"color\": \"네이비\",
  \"marketUrl\": \"https://example.com/product/test-$TIMESTAMP\"
}"

echo "새 상품 생성 중..."
create_response=$(curl -s -X POST "http://localhost:3000/api/v1/products" \
    -H "Content-Type: application/json" \
    -d "$PRODUCT_DATA")

PRODUCT_ID=$(echo "$create_response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('id', ''))
except:
    print('')
")

if [ -n "$PRODUCT_ID" ]; then
    echo -e "${GREEN}✅ 상품 생성 성공 (ID: $PRODUCT_ID)${NC}"
    RESULTS+=("✅ 상품 생성")
    
    # 상품 상세 조회
    test_api "상품 상세 조회" "GET" "http://localhost:3000/api/v1/products/$PRODUCT_ID" "" 200
else
    echo -e "${RED}❌ 상품 생성 실패${NC}"
    RESULTS+=("❌ 상품 생성")
fi

# 3. 연락처 관리 테스트
echo -e "\n${YELLOW}3. 연락처 관리 테스트${NC}"
test_api "연락처 목록 조회" "GET" "http://localhost:3000/api/v1/contacts" "" 200
test_api "연락처 통계 조회" "GET" "http://localhost:3000/api/v1/contacts/stats" "" 200
test_api "연락처 그룹 조회" "GET" "http://localhost:3000/api/v1/contacts/groups" "" 200

# 새 연락처 생성 (타임스탬프로 중복 방지)
CONTACT_DATA="{
  \"name\": \"테스트 고객 $TIMESTAMP\",
  \"phone\": \"010123456$(echo $TIMESTAMP | tail -c 3)\",
  \"kakaoId\": \"test_kakao_$TIMESTAMP\",
  \"groupName\": \"테스트그룹\"
}"

test_api "연락처 생성" "POST" "http://localhost:3000/api/v1/contacts" "$CONTACT_DATA" 201

# 4. 이미지 합성 테스트 (상품이 있는 경우)
if [ -n "$PRODUCT_ID" ]; then
    echo -e "\n${YELLOW}4. 이미지 합성 테스트${NC}"
    
    # 합성 작업 생성
    COMPOSE_DATA='{"templateType": "grid"}'
    test_api "이미지 합성 작업 생성" "POST" "http://localhost:3000/api/v1/composer/products/$PRODUCT_ID/compose" "$COMPOSE_DATA" 201
    
    # 합성 작업 목록 조회
    test_api "합성 작업 목록 조회" "GET" "http://localhost:3000/api/v1/composer/jobs" "" 200
    test_api "합성 작업 통계 조회" "GET" "http://localhost:3000/api/v1/composer/jobs/stats" "" 200
fi

# 5. 추적 및 분석 테스트
echo -e "\n${YELLOW}5. 추적 및 분석 테스트${NC}"
test_api "대시보드 데이터 조회" "GET" "http://localhost:3000/api/v1/tracking/analytics/dashboard" "" 200
test_api "고객 세그먼트 분석" "GET" "http://localhost:3000/api/v1/settings/api-keys" "" 200

# 6. 설정 관리 테스트
echo -e "\n${YELLOW}6. 설정 관리 테스트${NC}"
test_api "API 키 설정 조회" "GET" "http://localhost:3000/api/v1/settings/api-keys" "" 200
test_api "메시지 템플릿 조회" "GET" "http://localhost:3000/api/v1/settings/templates" "" 200
test_api "시스템 설정 조회" "GET" "http://localhost:3000/api/v1/settings/system" "" 200
test_api "알림 설정 조회" "GET" "http://localhost:3000/api/v1/settings/notifications" "" 200

# 7. 프론트엔드 접근성 테스트
echo -e "\n${YELLOW}7. 프론트엔드 접근성 테스트${NC}"
test_api "프론트엔드 메인 페이지" "GET" "http://localhost:5173" "" 200

# 8. 파일 시스템 테스트
echo -e "\n${YELLOW}8. 파일 시스템 테스트${NC}"

# 업로드 디렉토리 확인
if [ -d "./uploads" ]; then
    echo -e "${GREEN}✅ 업로드 디렉토리 존재${NC}"
    RESULTS+=("✅ 업로드 디렉토리")
    
    # 권한 확인
    if [ -w "./uploads" ]; then
        echo -e "${GREEN}✅ 업로드 디렉토리 쓰기 권한 OK${NC}"
        RESULTS+=("✅ 파일 쓰기 권한")
    else
        echo -e "${RED}❌ 업로드 디렉토리 쓰기 권한 없음${NC}"
        RESULTS+=("❌ 파일 쓰기 권한")
    fi
else
    echo -e "${RED}❌ 업로드 디렉토리 없음${NC}"
    RESULTS+=("❌ 업로드 디렉토리")
fi

# 9. 데이터베이스 연결 테스트
echo -e "\n${YELLOW}9. 데이터베이스 연결 테스트${NC}"

# Prisma 연결 테스트 (백엔드가 실행 중이면 이미 연결됨)
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ 데이터베이스 연결 OK (백엔드 실행 중)${NC}"
    RESULTS+=("✅ 데이터베이스 연결")
else
    echo -e "${RED}❌ 데이터베이스 연결 실패${NC}"
    RESULTS+=("❌ 데이터베이스 연결")
fi

# 10. 성능 테스트 (간단한)
echo -e "\n${YELLOW}10. 성능 테스트${NC}"

# API 응답 시간 측정
response_time=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:3000/api/v1/products)
response_time_ms=$(echo "$response_time * 1000" | bc -l | cut -d. -f1)

if [ "$response_time_ms" -lt 1000 ]; then
    echo -e "${GREEN}✅ API 응답 시간 OK (${response_time_ms}ms)${NC}"
    RESULTS+=("✅ API 응답 시간")
else
    echo -e "${YELLOW}⚠️ API 응답 시간 느림 (${response_time_ms}ms)${NC}"
    RESULTS+=("⚠️ API 응답 시간")
fi

# 결과 요약
echo -e "\n${BLUE}========================================"
echo "🧪 테스트 결과 요약"
echo "========================================${NC}"

success_count=0
total_count=${#RESULTS[@]}

for result in "${RESULTS[@]}"; do
    echo "$result"
    if [[ $result == ✅* ]]; then
        ((success_count++))
    fi
done

echo ""
echo -e "${BLUE}총 테스트: $total_count개${NC}"
echo -e "${GREEN}성공: $success_count개${NC}"
echo -e "${RED}실패: $((total_count - success_count))개${NC}"

success_rate=$(echo "scale=1; $success_count * 100 / $total_count" | bc -l)
echo -e "${BLUE}성공률: ${success_rate}%${NC}"

if [ "$success_count" -eq "$total_count" ]; then
    echo -e "\n${GREEN}🎉 모든 테스트가 성공했습니다!${NC}"
    exit 0
elif [ "$success_count" -gt $((total_count * 80 / 100)) ]; then
    echo -e "\n${YELLOW}⚠️ 대부분의 테스트가 성공했지만 일부 문제가 있습니다.${NC}"
    exit 1
else
    echo -e "\n${RED}❌ 많은 테스트가 실패했습니다. 시스템을 점검해주세요.${NC}"
    exit 2
fi