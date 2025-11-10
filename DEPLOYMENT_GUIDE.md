# 배포 및 운영 가이드

## 배포 아키텍처

### 1단계 (MVP) - 간단한 배포

```
┌─────────────────────────────────────────────────────┐
│                   Vercel / Netlify                   │
│                  (Frontend Hosting)                  │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────────┐
│              AWS EC2 / Railway                       │
│              (Backend API Server)                    │
│  ┌──────────────┐  ┌──────────────┐                │
│  │   NestJS     │  │  BullMQ      │                │
│  │   Workers    │  │  Workers     │                │
│  └──────────────┘  └──────────────┘                │
└──────┬────────────────────┬─────────────────────────┘
       │                    │
┌──────▼──────┐      ┌─────▼──────┐
│  PostgreSQL │      │   Redis    │
│  (Supabase) │      │  (Upstash) │
└─────────────┘      └────────────┘
       │
┌──────▼──────┐
│   AWS S3    │
│  (Images)   │
└─────────────┘
```

### 2단계 (SaaS) - 확장 가능한 배포

```
┌─────────────────────────────────────────────────────┐
│                   CloudFlare CDN                     │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│                  Load Balancer                       │
│                  (AWS ALB / Nginx)                   │
└──────┬────────────────────┬─────────────────────────┘
       │                    │
┌──────▼──────┐      ┌─────▼──────┐
│  Frontend   │      │  Backend   │
│  (Vercel)   │      │  (ECS/K8s) │
└─────────────┘      │  Auto Scale│
                     └─────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼────┐ ┌────▼─────┐
       │ PostgreSQL  │ │ Redis │ │   S3     │
       │  (RDS)      │ │Cluster│ │ + CDN    │
       │  Multi-AZ   │ │       │ │          │
       └─────────────┘ └───────┘ └──────────┘
```

---

## 환경별 설정

### 개발 환경 (Local)

**docker-compose.yml**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: product_marketing
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://dev:dev@postgres:5432/product_marketing
      REDIS_URL: redis://redis:6379
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      VITE_API_URL: http://localhost:3000

volumes:
  postgres_data:
  redis_data:
```

**실행**
```bash
# 전체 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

### 스테이징 환경

**특징**
- 프로덕션과 동일한 구성
- 테스트 데이터 사용
- 외부 API는 샌드박스 모드

**환경 변수 (.env.staging)**
```env
NODE_ENV=staging
DATABASE_URL=postgresql://user:pass@staging-db.example.com:5432/db
REDIS_URL=redis://staging-redis.example.com:6379
AWS_S3_BUCKET=staging-bucket
ALIGO_TESTMODE=Y
```

### 프로덕션 환경

**환경 변수 (.env.production)**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/db
REDIS_URL=redis://prod-redis.example.com:6379
AWS_S3_BUCKET=prod-bucket
ALIGO_TESTMODE=N

# 보안
JWT_SECRET=<strong-secret>
ENCRYPTION_KEY=<encryption-key>

# 모니터링
SENTRY_DSN=https://...
```

---

## 배포 방법

### 1. Frontend 배포 (Vercel)

**설정**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "@api-url"
  }
}
```

**배포 명령**
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

**자동 배포 (GitHub 연동)**
1. Vercel 대시보드에서 프로젝트 생성
2. GitHub 저장소 연결
3. main 브랜치 푸시 시 자동 배포

### 2. Backend 배포 (Railway)

**railway.json**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**배포 명령**
```bash
# Railway CLI 설치
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 초기화
railway init

# 배포
railway up
```

### 3. Backend 배포 (AWS EC2)

**Dockerfile**
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**EC2 설정**
```bash
# EC2 인스턴스 접속
ssh -i key.pem ubuntu@ec2-xx-xx-xx-xx.compute.amazonaws.com

# Docker 설치
sudo apt update
sudo apt install docker.io docker-compose -y

# 프로젝트 클론
git clone https://github.com/your-repo.git
cd your-repo

# 환경 변수 설정
nano .env.production

# 빌드 및 실행
docker-compose -f docker-compose.prod.yml up -d

# Nginx 리버스 프록시 설정
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/default
```

**Nginx 설정**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. 데이터베이스 배포

**Supabase (권장 - 1단계)**
1. Supabase 프로젝트 생성: https://supabase.com
2. 데이터베이스 URL 복사
3. Prisma 마이그레이션 실행
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

**AWS RDS (2단계)**
1. RDS PostgreSQL 인스턴스 생성
2. 보안 그룹 설정 (EC2에서 접근 허용)
3. 마이그레이션 실행

### 5. Redis 배포

**Upstash (권장 - 1단계)**
1. Upstash 계정 생성: https://upstash.com
2. Redis 데이터베이스 생성
3. 연결 URL 복사

**AWS ElastiCache (2단계)**
1. ElastiCache Redis 클러스터 생성
2. VPC 및 보안 그룹 설정
3. 연결 엔드포인트 사용

---

## CI/CD 파이프라인

### GitHub Actions

**.github/workflows/deploy.yml**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Check coverage
        run: npm run test:cov

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-2
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster prod-cluster \
            --service backend-service \
            --force-new-deployment
```

---

## 모니터링 및 로깅

### 1. Sentry (에러 추적)

**설치**
```bash
npm install @sentry/node @sentry/tracing
```

**설정 (Backend)**
```typescript
// main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// 에러 필터
@Catch()
export class SentryFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    Sentry.captureException(exception);
    // ... 에러 처리
  }
}
```

**설정 (Frontend)**
```typescript
// main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

### 2. CloudWatch (AWS)

**로그 그룹 생성**
```bash
aws logs create-log-group --log-group-name /ecs/backend
```

**메트릭 수집**
- CPU 사용률
- 메모리 사용률
- API 응답 시간
- 에러 발생률

### 3. Prometheus + Grafana (선택)

**Prometheus 설정**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['localhost:3000']
```

**메트릭 엔드포인트 (Backend)**
```typescript
// metrics.controller.ts
@Controller('metrics')
export class MetricsController {
  @Get()
  getMetrics() {
    return register.metrics();
  }
}
```

### 4. 헬스 체크

**엔드포인트**
```typescript
// health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get()
  async check() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkS3(),
    ]);

    const status = checks.every((c) => c.status === 'fulfilled')
      ? 'healthy'
      : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database: checks[0].status,
        redis: checks[1].status,
        s3: checks[2].status,
      },
    };
  }

  private async checkDatabase() {
    await this.prisma.$queryRaw`SELECT 1`;
  }

  private async checkRedis() {
    await this.redis.ping();
  }

  private async checkS3() {
    // S3 연결 확인
  }
}
```

**모니터링 설정**
```bash
# Uptime 체크 (UptimeRobot, Pingdom 등)
# 5분마다 /health 엔드포인트 확인
# 실패 시 알림 (이메일, Slack)
```

---

## 백업 및 복구

### 데이터베이스 백업

**자동 백업 (Supabase)**
- 일일 자동 백업 (7일 보관)
- 수동 백업 가능

**수동 백업 (PostgreSQL)**
```bash
# 백업
pg_dump -h host -U user -d database > backup.sql

# 복구
psql -h host -U user -d database < backup.sql

# S3에 업로드
aws s3 cp backup.sql s3://backups/$(date +%Y%m%d).sql
```

**자동 백업 스크립트**
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$DATE.sql"

# 백업 생성
pg_dump $DATABASE_URL > $BACKUP_FILE

# 압축
gzip $BACKUP_FILE

# S3 업로드
aws s3 cp $BACKUP_FILE.gz s3://backups/

# 로컬 파일 삭제
rm $BACKUP_FILE.gz

# 30일 이상 된 백업 삭제
aws s3 ls s3://backups/ | while read -r line; do
  createDate=$(echo $line | awk {'print $1" "$2'})
  createDate=$(date -d "$createDate" +%s)
  olderThan=$(date -d "30 days ago" +%s)
  if [[ $createDate -lt $olderThan ]]; then
    fileName=$(echo $line | awk {'print $4'})
    aws s3 rm s3://backups/$fileName
  fi
done
```

**Cron 설정**
```bash
# 매일 새벽 2시 백업
0 2 * * * /path/to/backup.sh
```

### Redis 백업

**RDB 스냅샷**
```bash
# 수동 저장
redis-cli SAVE

# 백그라운드 저장
redis-cli BGSAVE
```

**AOF (Append Only File)**
```conf
# redis.conf
appendonly yes
appendfsync everysec
```

---

## 보안 설정

### SSL/TLS 인증서

**Let's Encrypt (무료)**
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# 인증서 발급
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 자동 갱신
sudo certbot renew --dry-run
```

### 환경 변수 관리

**AWS Secrets Manager**
```typescript
// secrets.service.ts
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

export class SecretsService {
  private client = new SecretsManager({ region: 'ap-northeast-2' });

  async getSecret(secretName: string) {
    const response = await this.client.getSecretValue({
      SecretId: secretName,
    });
    return JSON.parse(response.SecretString);
  }
}
```

### 방화벽 설정

**AWS Security Group**
```
Inbound Rules:
- HTTP (80) from 0.0.0.0/0
- HTTPS (443) from 0.0.0.0/0
- SSH (22) from My IP only
- PostgreSQL (5432) from Backend SG only
- Redis (6379) from Backend SG only
```

### Rate Limiting

```typescript
// rate-limit.guard.ts
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Request): string {
    return req.ip; // IP 기반
  }
}

// app.module.ts
ThrottlerModule.forRoot({
  ttl: 60,
  limit: 100, // 분당 100회
}),
```

---

## 스케일링 전략

### 수평 스케일링 (Horizontal)

**Backend (ECS Auto Scaling)**
```json
{
  "scalingPolicy": {
    "targetTrackingScaling": {
      "targetValue": 70.0,
      "predefinedMetricType": "ECSServiceAverageCPUUtilization"
    }
  }
}
```

**Worker (BullMQ)**
```typescript
// 여러 워커 인스턴스 실행
// worker1.ts, worker2.ts, worker3.ts
const worker = new Worker('composer', processor, {
  concurrency: 5, // 동시 처리 작업 수
});
```

### 수직 스케일링 (Vertical)

**데이터베이스**
- 인스턴스 타입 업그레이드
- 스토리지 증설

**Redis**
- 메모리 증설
- 클러스터 모드 전환

### 캐싱 전략

**Redis 캐싱**
```typescript
// cache.interceptor.ts
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private redis: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const key = this.generateKey(context);
    const cached = await this.redis.get(key);

    if (cached) {
      return of(JSON.parse(cached));
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.redis.set(key, JSON.stringify(data), 'EX', 300); // 5분
      }),
    );
  }
}
```

**CDN (CloudFlare)**
- 이미지 캐싱
- 정적 파일 캐싱
- 전 세계 엣지 서버

---

## 장애 대응

### 롤백 전략

**Frontend (Vercel)**
```bash
# 이전 배포로 롤백
vercel rollback
```

**Backend (ECS)**
```bash
# 이전 태스크 정의로 롤백
aws ecs update-service \
  --cluster prod-cluster \
  --service backend-service \
  --task-definition backend:previous
```

### 장애 시나리오별 대응

**1. 데이터베이스 다운**
- Read Replica로 자동 전환
- 읽기 전용 모드 활성화
- 알림 발송

**2. Redis 다운**
- 캐시 없이 동작 (성능 저하)
- 데이터베이스 직접 조회
- Redis 재시작

**3. S3 접근 불가**
- 이미지 로딩 실패 처리
- 플레이스홀더 이미지 표시
- 재시도 로직

**4. 외부 API 장애 (SMS/카카오)**
- 큐에 작업 보관
- 재시도 (Exponential Backoff)
- 관리자 알림

---

## 운영 체크리스트

### 일일 체크
- [ ] 시스템 헬스 체크
- [ ] 에러 로그 확인
- [ ] 발송 성공률 확인
- [ ] API 응답 시간 확인

### 주간 체크
- [ ] 데이터베이스 백업 확인
- [ ] 디스크 사용량 확인
- [ ] 보안 업데이트 적용
- [ ] 성능 메트릭 리뷰

### 월간 체크
- [ ] 비용 분석
- [ ] 사용량 추이 분석
- [ ] 보안 감사
- [ ] 백업 복구 테스트

---

## 비용 예측 (1단계 MVP)

### 월 예상 비용 (사용자 100명 기준)

**인프라**
- Vercel (Frontend): $0 (Hobby 플랜)
- Railway (Backend): $5 (Starter)
- Supabase (Database): $0 (Free tier)
- Upstash (Redis): $0 (Free tier)
- AWS S3: $5 (100GB 저장, 10GB 전송)

**외부 API**
- SMS (알리고): 월 10,000건 × 9원 = 90,000원
- 카카오톡: 월 10,000건 × 15원 = 150,000원

**총 예상 비용**: 약 250,000원/월 (약 $200)

### 2단계 SaaS 비용 (사용자 1,000명 기준)

**인프라**
- AWS EC2 (t3.medium × 2): $60
- AWS RDS (db.t3.medium): $70
- AWS ElastiCache (cache.t3.micro): $15
- AWS S3 + CloudFront: $50
- 기타 (로드밸런서, 모니터링): $30

**외부 API**
- SMS: 월 100,000건 × 9원 = 900,000원
- 카카오톡: 월 100,000건 × 15원 = 1,500,000원

**총 예상 비용**: 약 2,600,000원/월 (약 $2,100)

---

## 다음 단계

1. 스프린트 8에서 1단계 배포 진행
2. 모니터링 대시보드 설정
3. 장애 대응 매뉴얼 작성
4. 운영 팀 교육
