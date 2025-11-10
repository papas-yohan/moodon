import { Controller, Get, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class RootController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(@Req() req: Request, @Res() res: Response) {
    const userAgent = req.headers['user-agent'] || '';
    const acceptHeader = req.headers['accept'] || '';
    const isBrowser = acceptHeader.includes('text/html') || userAgent.includes('Mozilla');

    if (isBrowser) {
      // 브라우저 접근 시 HTML 응답
      const appInfo = this.appService.getAppInfo() as any;
      const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appInfo.name}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #f8fafc;
            color: #334155;
        }
        .header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .title {
            color: #1e293b;
            margin-bottom: 0.5rem;
            font-size: 2rem;
            font-weight: 700;
        }
        .description {
            color: #64748b;
            font-size: 1.1rem;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .info-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .info-label {
            font-weight: 600;
            color: #475569;
            margin-bottom: 0.5rem;
        }
        .info-value {
            color: #1e293b;
            font-family: monospace;
        }
        .endpoints {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .endpoint-link {
            display: block;
            color: #3b82f6;
            text-decoration: none;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .endpoint-link:hover {
            background: #f1f5f9;
            padding-left: 0.5rem;
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
        <h1 class="title">🚀 ${appInfo.name}</h1>
        <p class="description">${appInfo.description}</p>
        <span class="status">✅ 서버 실행 중</span>
    </div>

    <div class="info-grid">
        <div class="info-card">
            <div class="info-label">버전</div>
            <div class="info-value">${appInfo.version}</div>
        </div>
        <div class="info-card">
            <div class="info-label">환경</div>
            <div class="info-value">${appInfo.environment}</div>
        </div>
        <div class="info-card">
            <div class="info-label">실행 시간</div>
            <div class="info-value">${new Date(appInfo.timestamp).toLocaleString('ko-KR')}</div>
        </div>
    </div>

    <div class="endpoints">
        <h3>🔗 사용 가능한 엔드포인트</h3>
        <a href="/api/v1" class="endpoint-link">📊 API 정보 - /api/v1</a>
        <a href="/api/v1/health" class="endpoint-link">💚 헬스체크 - /api/v1/health</a>
        <a href="/api/v1/health/detailed" class="endpoint-link">🔍 상세 헬스체크 - /api/v1/health/detailed</a>
        <a href="/api/docs" class="endpoint-link">📚 API 문서 - /api/docs</a>
    </div>

    <div style="text-align: center; margin-top: 2rem; color: #64748b; font-size: 0.875rem;">
        <p>Frontend: <a href="http://localhost:5173" style="color: #3b82f6;">http://localhost:5173</a></p>
        <p>이 페이지는 브라우저 접근 시에만 표시됩니다. API 호출 시에는 JSON 응답을 받습니다.</p>
    </div>
</body>
</html>`;
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } else {
      // API 호출 시 JSON 응답
      res.json(this.appService.getAppInfo());
    }
  }

  @Get('favicon.ico')
  getFavicon(@Res() res: Response) {
    res.redirect('/favicon.svg');
  }
}