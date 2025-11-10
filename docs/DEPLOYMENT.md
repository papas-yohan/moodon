# 🚀 Moodon 배포 가이드

이 문서는 Moodon 플랫폼을 프로덕션 환경에 배포하는 방법을 설명합니다.

## 📋 사전 요구사항

### 시스템 요구사항
- **OS**: Ubuntu 20.04 LTS 이상 또는 CentOS 8 이상
- **CPU**: 최소 2 코어 (권장 4 코어)
- **RAM**: 최소 4GB (권장 8GB)
- **Storage**: 최소 50GB (권장 100GB)
- **Network**: 인터넷 연결 및 도메인

### 필수 소프트웨어
- Docker 20.10+
- Docker Compose 2.0+
- Git
- SSL 인증서 (Let's Encrypt 권장)

## 🔧 1단계: 서버 준비

### 1.1 Docker 설치
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 1.2 방화벽 설정
```bash
# Ubuntu UFW
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# CentOS/RHEL firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 📦 2단계: 애플리케이션 배포

### 2.1 소스 코드 다운로드
```bash
# 프로덕션 서버에서 실행
git clone <your-repository-url> moodon
cd moodon
```

### 2.2 환경 변수 설정
```bash
# 환경 변수 파일 생성
cp .env.production.example .env.production

# 환경 변수 편집
nano .env.production
```

**필수 설정 항목:**
```bash
# 강력한 비밀번호 설정
POSTGRES_PASSWORD=your_very_secure_password_here
REDIS_PASSWORD=another_secure_password_here
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# 솔라피 API 설정
SOLAPI_API_KEY=your_solapi_api_key
SOLAPI_API_SECRET=your_solapi_api_secret
SOLAPI_FROM_NUMBER=01012345678

# 도메인 설정
CORS_ORIGIN=https://yourdomain.com
```

### 2.3 SSL 인증서 설정

#### Let's Encrypt 사용 (권장)
```bash
# Certbot 설치
sudo apt update
sudo apt install certbot

# 인증서 발급 (도메인 소유 확인 필요)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# 인증서 복사
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
sudo chown -R $USER:$USER nginx/ssl
```

#### 자체 서명 인증서 (테스트용)
```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=KR/ST=Seoul/L=Seoul/O=Moodon/CN=yourdomain.com"
```

### 2.4 Nginx 설정 수정
```bash
# nginx/nginx.conf 파일에서 도메인 수정
sed -i 's/your-domain.com/yourdomain.com/g' nginx/nginx.conf
```

### 2.5 배포 실행
```bash
# 배포 스크립트 실행
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 🔍 3단계: 배포 확인

### 3.1 서비스 상태 확인
```bash
# 컨테이너 상태 확인
docker-compose -f docker-compose.prod.yml ps

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f
```

### 3.2 헬스체크
```bash
# 백엔드 API 확인
curl -f http://localhost:3000/health

# 프론트엔드 확인
curl -f http://localhost

# HTTPS 확인 (SSL 설정 후)
curl -f https://yourdomain.com
```

### 3.3 기능 테스트
1. 웹 브라우저에서 `https://yourdomain.com` 접속
2. 상품 등록 테스트
3. 이미지 업로드 테스트
4. 연락처 업로드 테스트
5. 메시지 발송 테스트 (테스트 모드)

## 📊 4단계: 모니터링 설정

### 4.1 시스템 모니터링
```bash
# 모니터링 스크립트 실행
./scripts/monitor.sh

# Cron으로 정기 모니터링 설정
crontab -e
# 매 10분마다 모니터링
*/10 * * * * /path/to/moodon/scripts/monitor.sh >> /var/log/moodon-monitor.log 2>&1
```

### 4.2 백업 설정
```bash
# 백업 스크립트 실행
./scripts/backup.sh

# 매일 새벽 2시 자동 백업
crontab -e
0 2 * * * /path/to/moodon/scripts/backup.sh >> /var/log/moodon-backup.log 2>&1
```

### 4.3 로그 로테이션
```bash
# 로그 로테이션 설정
sudo nano /etc/logrotate.d/moodon

# 내용 추가:
/path/to/moodon/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 $USER $USER
}
```

## 🔒 5단계: 보안 강화

### 5.1 SSH 보안 설정
```bash
# SSH 키 기반 인증 설정
ssh-keygen -t rsa -b 4096
# 공개키를 ~/.ssh/authorized_keys에 추가

# SSH 설정 강화
sudo nano /etc/ssh/sshd_config
# PasswordAuthentication no
# PermitRootLogin no
# Port 2222  # 기본 포트 변경

sudo systemctl restart sshd
```

### 5.2 Fail2Ban 설정
```bash
# Fail2Ban 설치
sudo apt install fail2ban

# 설정 파일 생성
sudo nano /etc/fail2ban/jail.local

# 내용:
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 2222
```

### 5.3 정기 보안 업데이트
```bash
# 자동 보안 업데이트 설정
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 🔄 6단계: 업데이트 및 유지보수

### 6.1 애플리케이션 업데이트
```bash
# 새 버전 배포
git pull origin main
./scripts/deploy.sh
```

### 6.2 데이터베이스 마이그레이션
```bash
# 마이그레이션 실행
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### 6.3 백업에서 복원
```bash
# 데이터베이스 복원
docker exec -i moodon-postgres-prod psql -U moodon_user -d moodon_prod < backup/postgres_backup_YYYYMMDD_HHMMSS.sql

# 파일 복원
tar -xzf backup/uploads_backup_YYYYMMDD_HHMMSS.tar.gz
```

## 🚨 7단계: 트러블슈팅

### 7.1 일반적인 문제들

#### 컨테이너가 시작되지 않는 경우
```bash
# 로그 확인
docker-compose -f docker-compose.prod.yml logs [service-name]

# 컨테이너 재시작
docker-compose -f docker-compose.prod.yml restart [service-name]
```

#### 데이터베이스 연결 실패
```bash
# PostgreSQL 상태 확인
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U moodon_user

# 연결 테스트
docker-compose -f docker-compose.prod.yml exec backend npx prisma db pull
```

#### 파일 업로드 실패
```bash
# 업로드 디렉토리 권한 확인
ls -la uploads/
sudo chown -R 1001:1001 uploads/
```

#### SSL 인증서 문제
```bash
# 인증서 갱신
sudo certbot renew

# Nginx 재시작
docker-compose -f docker-compose.prod.yml restart nginx
```

### 7.2 성능 최적화

#### 데이터베이스 최적화
```bash
# PostgreSQL 설정 튜닝
docker-compose -f docker-compose.prod.yml exec postgres psql -U moodon_user -d moodon_prod -c "
  ALTER SYSTEM SET shared_buffers = '256MB';
  ALTER SYSTEM SET effective_cache_size = '1GB';
  SELECT pg_reload_conf();
"
```

#### Redis 최적화
```bash
# Redis 메모리 정책 설정
docker-compose -f docker-compose.prod.yml exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

## 📞 지원 및 문의

배포 과정에서 문제가 발생하면:

1. **로그 확인**: `docker-compose -f docker-compose.prod.yml logs`
2. **모니터링 실행**: `./scripts/monitor.sh`
3. **GitHub Issues**: 프로젝트 저장소에 이슈 등록
4. **문서 참조**: README.md 및 기타 문서 확인

## 📚 추가 자료

- [Docker 공식 문서](https://docs.docker.com/)
- [Nginx 설정 가이드](https://nginx.org/en/docs/)
- [Let's Encrypt 가이드](https://letsencrypt.org/getting-started/)
- [PostgreSQL 튜닝 가이드](https://wiki.postgresql.org/wiki/Tuning_Your_PostgreSQL_Server)

---

**⚠️ 중요**: 프로덕션 배포 전에 반드시 테스트 환경에서 전체 과정을 검증하세요.