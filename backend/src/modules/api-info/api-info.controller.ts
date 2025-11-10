import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('API Info')
@Controller('')
export class ApiInfoController {
  @Get()
  @ApiOperation({ summary: 'API Root endpoint' })
  @ApiResponse({ status: 200, description: 'API information' })
  getApiInfo(): object {
    return {
      name: 'Moodon API',
      version: '1.0.0',
      description: 'AI 이미지 합성 기반 상품 마케팅 자동화 플랫폼 API',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      endpoints: {
        products: '/api/v1/products',
        composer: '/api/v1/composer',
        contacts: '/api/v1/contacts',
        messaging: '/api/v1/messaging',
        tracking: '/api/v1/tracking',
        settings: '/api/v1/settings',
        health: '/api/v1/health',
        docs: '/api/docs',
      },
    };
  }
}