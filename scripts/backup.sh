#!/bin/bash

# Moodon 데이터베이스 백업 스크립트
set -e

# 설정
BACKUP_DIR="./backup"
DATE=$(date +%Y%m%d_%H%M%S)
POSTGRES_CONTAINER="moodon-postgres-prod"
DB_NAME="moodon_prod"
DB_USER="moodon_user"

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

echo "💾 데이터베이스 백업을 시작합니다..."
echo "   날짜: $(date)"
echo "   데이터베이스: $DB_NAME"

# PostgreSQL 백업
echo "📦 PostgreSQL 데이터를 백업합니다..."
docker exec $POSTGRES_CONTAINER pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_DIR/postgres_backup_$DATE.sql

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL 백업 완료: $BACKUP_DIR/postgres_backup_$DATE.sql"
else
    echo "❌ PostgreSQL 백업 실패"
    exit 1
fi

# 파일 백업 (업로드된 이미지 등)
echo "📁 업로드 파일을 백업합니다..."
if [ -d "./uploads" ]; then
    tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz ./uploads
    echo "✅ 파일 백업 완료: $BACKUP_DIR/uploads_backup_$DATE.tar.gz"
else
    echo "⚠️  업로드 디렉토리가 없습니다."
fi

# 설정 파일 백업
echo "⚙️ 설정 파일을 백업합니다..."
tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz \
    --exclude=node_modules \
    --exclude=dist \
    --exclude=.git \
    --exclude=backup \
    .

echo "✅ 설정 파일 백업 완료: $BACKUP_DIR/config_backup_$DATE.tar.gz"

# 오래된 백업 파일 정리 (30일 이상)
echo "🧹 오래된 백업 파일을 정리합니다..."
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

# 백업 파일 목록 표시
echo ""
echo "📋 백업 파일 목록:"
ls -lh $BACKUP_DIR/*$DATE*

# 백업 파일 크기 확인
TOTAL_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
echo ""
echo "💽 총 백업 크기: $TOTAL_SIZE"

echo ""
echo "🎉 백업이 완료되었습니다!"
echo ""
echo "📍 복원 방법:"
echo "   1. PostgreSQL 복원:"
echo "      docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d $DB_NAME < $BACKUP_DIR/postgres_backup_$DATE.sql"
echo ""
echo "   2. 파일 복원:"
echo "      tar -xzf $BACKUP_DIR/uploads_backup_$DATE.tar.gz"
echo ""
echo "   3. 설정 복원:"
echo "      tar -xzf $BACKUP_DIR/config_backup_$DATE.tar.gz"