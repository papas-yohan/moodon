#!/bin/bash

# Moodon 프로덕션 배포 스크립트
set -e

echo "🚀 Moodon 프로덕션 배포를 시작합니다..."

# 환경 변수 확인
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production 파일이 없습니다."
    echo "   .env.production.example을 참고하여 생성해주세요."
    exit 1
fi

# Docker 및 Docker Compose 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되지 않았습니다."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose가 설치되지 않았습니다."
    exit 1
fi

# 기존 컨테이너 중지 및 제거
echo "📦 기존 컨테이너를 중지합니다..."
docker-compose -f docker-compose.prod.yml down

# 이미지 빌드
echo "🔨 Docker 이미지를 빌드합니다..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 데이터베이스 백업 (기존 데이터가 있는 경우)
if [ -d "postgres_data" ]; then
    echo "💾 데이터베이스를 백업합니다..."
    mkdir -p backup
    docker run --rm \
        -v moodon_postgres_data:/var/lib/postgresql/data \
        -v $(pwd)/backup:/backup \
        postgres:15-alpine \
        pg_dump -h localhost -U moodon_user -d moodon_prod > backup/backup_$(date +%Y%m%d_%H%M%S).sql
fi

# 프론트엔드 빌드
echo "🎨 프론트엔드를 빌드합니다..."
cd frontend
npm ci
npm run build
cd ..

# 컨테이너 시작
echo "🚀 컨테이너를 시작합니다..."
docker-compose -f docker-compose.prod.yml up -d

# 데이터베이스 마이그레이션
echo "🗄️ 데이터베이스 마이그레이션을 실행합니다..."
sleep 10  # 데이터베이스가 완전히 시작될 때까지 대기
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# 헬스체크
echo "🏥 서비스 상태를 확인합니다..."
sleep 5

# 백엔드 헬스체크
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ 백엔드 서비스가 정상적으로 시작되었습니다."
else
    echo "❌ 백엔드 서비스 시작에 실패했습니다."
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# 프론트엔드 헬스체크
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ 프론트엔드 서비스가 정상적으로 시작되었습니다."
else
    echo "❌ 프론트엔드 서비스 시작에 실패했습니다."
    docker-compose -f docker-compose.prod.yml logs nginx
    exit 1
fi

# 로그 확인
echo "📋 서비스 로그를 확인합니다..."
docker-compose -f docker-compose.prod.yml logs --tail=20

echo ""
echo "🎉 배포가 완료되었습니다!"
echo ""
echo "📍 접속 정보:"
echo "   - 프론트엔드: http://localhost (또는 https://your-domain.com)"
echo "   - 백엔드 API: http://localhost:3000"
echo "   - API 문서: http://localhost:3000/api/docs"
echo ""
echo "📊 모니터링:"
echo "   - 로그 확인: docker-compose -f docker-compose.prod.yml logs -f"
echo "   - 상태 확인: docker-compose -f docker-compose.prod.yml ps"
echo "   - 중지: docker-compose -f docker-compose.prod.yml down"
echo ""
echo "⚠️  주의사항:"
echo "   - SSL 인증서를 설정하여 HTTPS를 활성화하세요."
echo "   - 정기적으로 데이터베이스를 백업하세요."
echo "   - 로그 파일 크기를 모니터링하세요."