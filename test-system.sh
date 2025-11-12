#!/bin/bash

echo "🧪 Moodon 로컬 시스템 테스트"
echo "================================"
echo ""

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 테스트 결과 카운터
PASSED=0
FAILED=0

# 테스트 함수
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "Testing $name... "
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $status)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $status)"
        ((FAILED++))
        return 1
    fi
}

echo "1️⃣ 백엔드 API 테스트"
echo "-------------------"

# Health check (없을 수 있음)
test_endpoint "Health Check" "http://localhost:3000/api/v1/health" "200" || true

# Products API
test_endpoint "Products List" "http://localhost:3000/api/v1/products" "200"
test_endpoint "Products Stats" "http://localhost:3000/api/v1/products/stats" "200"

# Contacts API
test_endpoint "Contacts List" "http://localhost:3000/api/v1/contacts" "200"
test_endpoint "Contacts Stats" "http://localhost:3000/api/v1/contacts/stats" "200"

# Composer API
test_endpoint "Composer Jobs" "http://localhost:3000/api/v1/composer/jobs" "200"
test_endpoint "Composer Stats" "http://localhost:3000/api/v1/composer/jobs/stats" "200"

# Send Jobs API
test_endpoint "Send Jobs" "http://localhost:3000/api/v1/messaging/send-jobs" "200"

# Tracking API
test_endpoint "Tracking Events" "http://localhost:3000/api/v1/tracking/events" "200"
test_endpoint "Tracking Stats" "http://localhost:3000/api/v1/tracking/stats" "200"

# Settings API
test_endpoint "Settings API Keys" "http://localhost:3000/api/v1/settings/api-keys" "200"

echo ""
echo "2️⃣ 데이터베이스 연결 테스트"
echo "-------------------------"

# Products 데이터 확인
products_count=$(curl -s http://localhost:3000/api/v1/products | jq -r '.data | length')
echo -e "Products count: ${YELLOW}$products_count${NC}"

# Contacts 데이터 확인
contacts_count=$(curl -s http://localhost:3000/api/v1/contacts | jq -r '.data | length')
echo -e "Contacts count: ${YELLOW}$contacts_count${NC}"

echo ""
echo "3️⃣ 프론트엔드 테스트"
echo "------------------"

# 프론트엔드 실행 확인
if lsof -ti:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend is running on port 5173"
    test_endpoint "Frontend" "http://localhost:5173" "200"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Frontend is not running on port 5173"
    echo "  Run: cd frontend && npm run dev"
fi

echo ""
echo "================================"
echo "📊 테스트 결과"
echo "================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ 모든 테스트 통과!${NC}"
    echo ""
    echo "다음 단계:"
    echo "1. 브라우저에서 http://localhost:5173 접속"
    echo "2. 상품 등록 테스트"
    echo "3. 이미지 합성 테스트"
    echo "4. 연락처 추가 테스트"
    echo "5. Railway 배포 진행"
    exit 0
else
    echo -e "${RED}❌ 일부 테스트 실패${NC}"
    echo ""
    echo "문제 해결:"
    echo "1. 백엔드가 실행 중인지 확인: cd backend && npm run start:dev"
    echo "2. 프론트엔드가 실행 중인지 확인: cd frontend && npm run dev"
    echo "3. 데이터베이스 연결 확인"
    exit 1
fi
