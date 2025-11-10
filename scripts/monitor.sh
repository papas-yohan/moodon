#!/bin/bash

# Moodon 시스템 모니터링 스크립트
set -e

echo "📊 Moodon 시스템 상태를 확인합니다..."
echo "========================================"

# Docker 컨테이너 상태 확인
echo "🐳 Docker 컨테이너 상태:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "💾 리소스 사용량:"

# CPU 및 메모리 사용량
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" \
    moodon-backend-prod moodon-postgres-prod moodon-redis-prod moodon-nginx-prod 2>/dev/null || echo "컨테이너가 실행 중이지 않습니다."

echo ""
echo "💽 디스크 사용량:"
df -h | grep -E "(Filesystem|/dev/)"

echo ""
echo "🗄️ 데이터베이스 상태:"

# PostgreSQL 연결 테스트
if docker exec moodon-postgres-prod pg_isready -U moodon_user -d moodon_prod > /dev/null 2>&1; then
    echo "✅ PostgreSQL: 정상"
    
    # 데이터베이스 크기 확인
    DB_SIZE=$(docker exec moodon-postgres-prod psql -U moodon_user -d moodon_prod -t -c "SELECT pg_size_pretty(pg_database_size('moodon_prod'));" | xargs)
    echo "   데이터베이스 크기: $DB_SIZE"
    
    # 테이블별 레코드 수
    echo "   테이블별 레코드 수:"
    docker exec moodon-postgres-prod psql -U moodon_user -d moodon_prod -c "
        SELECT 
            schemaname,
            tablename,
            n_tup_ins as inserts,
            n_tup_upd as updates,
            n_tup_del as deletes,
            n_live_tup as live_rows
        FROM pg_stat_user_tables 
        ORDER BY n_live_tup DESC;
    " 2>/dev/null || echo "   테이블 정보를 가져올 수 없습니다."
else
    echo "❌ PostgreSQL: 연결 실패"
fi

echo ""
echo "🔄 Redis 상태:"

# Redis 연결 테스트
if docker exec moodon-redis-prod redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: 정상"
    
    # Redis 메모리 사용량
    REDIS_MEMORY=$(docker exec moodon-redis-prod redis-cli info memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
    echo "   메모리 사용량: $REDIS_MEMORY"
    
    # Redis 키 개수
    REDIS_KEYS=$(docker exec moodon-redis-prod redis-cli dbsize | tr -d '\r')
    echo "   저장된 키 개수: $REDIS_KEYS"
else
    echo "❌ Redis: 연결 실패"
fi

echo ""
echo "🌐 웹 서비스 상태:"

# 백엔드 헬스체크
if curl -f -s http://localhost:3000/health > /dev/null; then
    echo "✅ 백엔드 API: 정상"
    
    # API 응답 시간 측정
    RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:3000/health)
    echo "   응답 시간: ${RESPONSE_TIME}초"
else
    echo "❌ 백엔드 API: 응답 없음"
fi

# 프론트엔드 확인
if curl -f -s http://localhost > /dev/null; then
    echo "✅ 프론트엔드: 정상"
else
    echo "❌ 프론트엔드: 응답 없음"
fi

echo ""
echo "📁 파일 시스템:"

# 업로드 디렉토리 크기
if [ -d "./uploads" ]; then
    UPLOAD_SIZE=$(du -sh ./uploads | cut -f1)
    UPLOAD_COUNT=$(find ./uploads -type f | wc -l)
    echo "✅ 업로드 디렉토리: $UPLOAD_SIZE ($UPLOAD_COUNT 파일)"
else
    echo "⚠️  업로드 디렉토리가 없습니다."
fi

# 로그 디렉토리 크기
if [ -d "./logs" ]; then
    LOG_SIZE=$(du -sh ./logs | cut -f1)
    echo "📋 로그 디렉토리: $LOG_SIZE"
else
    echo "⚠️  로그 디렉토리가 없습니다."
fi

echo ""
echo "🔍 최근 로그 (마지막 10줄):"
echo "----------------------------------------"
docker-compose -f docker-compose.prod.yml logs --tail=10 backend 2>/dev/null || echo "로그를 가져올 수 없습니다."

echo ""
echo "⚠️  알림:"

# 디스크 사용량 경고 (80% 이상)
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "🚨 디스크 사용량이 ${DISK_USAGE}%입니다. 정리가 필요합니다."
fi

# 메모리 사용량 경고 (90% 이상)
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$MEMORY_USAGE" -gt 90 ]; then
    echo "🚨 메모리 사용량이 ${MEMORY_USAGE}%입니다."
fi

echo ""
echo "📊 모니터링 완료 - $(date)"
echo "========================================"

# 결과를 로그 파일에도 저장
mkdir -p ./logs
echo "$(date): 시스템 모니터링 완료" >> ./logs/monitor.log