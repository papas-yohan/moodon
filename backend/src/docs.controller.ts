import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller('docs')
export class DocsController {
  constructor(private readonly appService: AppService) {}

  @Get('simple')
  getSimpleDocs(@Res() res: Response) {
    const appInfo = this.appService.getAppInfo() as any;
    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API 문서 - ${appInfo.name}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 2rem;
            background: #f8fafc;
            color: #334155;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .title {
            color: #1e293b;
            margin-bottom: 0.5rem;
            font-size: 2.5rem;
            font-weight: 700;
        }
        .description {
            color: #64748b;
            font-size: 1.2rem;
        }
        .section {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        .section h2 {
            color: #1e293b;
            margin-bottom: 1rem;
            font-size: 1.5rem;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 0.5rem;
        }
        .endpoint {
            background: #f1f5f9;
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            border-left: 4px solid #3b82f6;
        }
        .method {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-weight: 600;
            font-size: 0.875rem;
            margin-right: 1rem;
        }
        .get { background: #10b981; color: white; }
        .post { background: #3b82f6; color: white; }
        .patch { background: #f59e0b; color: white; }
        .delete { background: #ef4444; color: white; }
        .path {
            font-family: monospace;
            font-weight: 600;
            color: #1e293b;
        }
        .description-text {
            color: #64748b;
            margin-top: 0.5rem;
        }
        .test-button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            text-decoration: none;
            font-size: 0.875rem;
            margin-top: 0.5rem;
        }
        .test-button:hover {
            background: #2563eb;
        }
        .status {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">📚 API 문서</h1>
        <p class="description">${appInfo.description}</p>
        <span class="status">✅ 서버 실행 중</span>
    </div>

    <div class="section">
        <h2>🏠 기본 정보</h2>
        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/</span>
            <div class="description-text">메인 페이지 (브라우저 접근 시 HTML, API 호출 시 JSON)</div>
            <a href="/" class="test-button" target="_blank">테스트</a>
        </div>
        
        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/v1/info</span>
            <div class="description-text">애플리케이션 정보 조회</div>
            <a href="/api/v1/info" class="test-button" target="_blank">테스트</a>
        </div>
    </div>

    <div class="section">
        <h2>💚 헬스체크</h2>
        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/v1/health</span>
            <div class="description-text">기본 헬스체크 - 서버 상태 확인</div>
            <a href="/api/v1/health" class="test-button" target="_blank">테스트</a>
        </div>
        
        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/v1/health/detailed</span>
            <div class="description-text">상세 헬스체크 - 데이터베이스, Redis, 메모리 상태 확인</div>
            <a href="/api/v1/health/detailed" class="test-button" target="_blank">테스트</a>
        </div>
    </div>

    <div class="section">
        <h2>🚀 향후 추가될 API</h2>
        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/v1/products</span>
            <div class="description-text">상품 등록 (스프린트 1에서 구현 예정)</div>
        </div>
        
        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/v1/products</span>
            <div class="description-text">상품 목록 조회 (스프린트 1에서 구현 예정)</div>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/v1/contacts</span>
            <div class="description-text">주소록 관리 (스프린트 3에서 구현 예정)</div>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/api/v1/send-jobs</span>
            <div class="description-text">메시지 발송 (스프린트 4에서 구현 예정)</div>
        </div>
        
        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/api/v1/analytics</span>
            <div class="description-text">분석 데이터 (스프린트 5에서 구현 예정)</div>
        </div>
    </div>

    <div class="section">
        <h2>🔗 관련 링크</h2>
        <p><strong>Frontend:</strong> <a href="http://localhost:5173" target="_blank">http://localhost:5173</a></p>
        <p><strong>Swagger UI:</strong> <a href="/api/docs" target="_blank">http://localhost:3000/api/docs</a> (문제 해결 중)</p>
        <p><strong>개발 문서:</strong> GitHub Repository</p>
    </div>

    <div style="text-align: center; margin-top: 2rem; color: #64748b; font-size: 0.875rem;">
        <p>현재 스프린트 0 완료 상태 - 기본 인프라 및 헬스체크 API만 구현됨</p>
        <p>버전: ${appInfo.version} | 환경: ${appInfo.environment}</p>
    </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}