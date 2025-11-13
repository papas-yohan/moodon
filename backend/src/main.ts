import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn', 'log'] 
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // 보안 헤더 설정
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        imgSrc: [`'self'`, 'data:', 'https:', 'http://localhost:5173'],
      },
    },
  }));

  // Gzip 압축 활성화
  app.use(compression());

  // Global prefix (exclude root controller)
  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: '', method: RequestMethod.GET }, 
      { path: 'favicon.ico', method: RequestMethod.GET }
    ],
  });

  // Serve static files (for favicon, etc.)
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static/',
  });
  
  // Serve uploaded files - 개발/프로덕션 모두 지원
  const uploadsPath = process.env.NODE_ENV === 'production'
    ? join(__dirname, '..', 'uploads')
    : join(process.cwd(), 'uploads');
  
  logger.log(`Serving uploads from: ${uploadsPath}`);
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });
  
  // Also serve static files from root for favicon
  app.use(express.static(join(__dirname, '..', 'public')));
  
  // Enable trust proxy for proper IP handling
  app.set('trust proxy', 1);

  // CORS 설정 - Vercel 도메인 패턴 자동 허용
  const corsOrigin = process.env.NODE_ENV === 'production' 
    ? (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
        // 환경 변수에 설정된 도메인 확인
        const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || [];
        
        // origin이 없으면 (서버 간 요청) 허용
        if (!origin) {
          callback(null, true);
          return;
        }
        
        // 명시적으로 허용된 도메인
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        
        // Vercel 도메인 패턴 허용 (*.vercel.app)
        if (origin.endsWith('.vercel.app')) {
          callback(null, true);
          return;
        }
        
        // 그 외는 거부
        callback(new Error('Not allowed by CORS'));
      }
    : ['http://localhost:5173', 'http://localhost:3000'];

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_DOCS === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Moodon API')
      .setDescription('상품 마케팅 자동화 플랫폼 API')
      .setVersion('1.0')
      .addTag('products', '상품 관리')
      .addTag('composer', '이미지 합성')
      .addTag('contacts', '연락처 관리')
      .addTag('messaging', '메시지 발송')
      .addTag('tracking', '추적 및 분석')
      .addTag('settings', '설정 관리')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Moodon API Documentation',
      customfavIcon: '/favicon.svg',
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_DOCS === 'true') {
    logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  }
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`🔒 CORS: Allowing all *.vercel.app domains`);
}

bootstrap().catch((error) => {
  console.error('❌ Application failed to start:', error);
  process.exit(1);
});