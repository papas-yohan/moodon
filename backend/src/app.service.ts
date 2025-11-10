import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppInfo(): object {
    return {
      name: 'Product Marketing System API',
      version: '1.0.0',
      description: 'AI 이미지 합성 기반 상품 마케팅 자동화 플랫폼',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      endpoints: {
        docs: '/api/docs',
        health: '/api/v1/health',
      },
    };
  }
}