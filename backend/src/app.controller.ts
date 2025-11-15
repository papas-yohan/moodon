import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("App")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("info")
  @ApiOperation({ summary: "Get application info" })
  @ApiResponse({ status: 200, description: "Application information" })
  getHello(): object {
    return this.appService.getAppInfo();
  }

  @Get("api/v1/health")
  @ApiExcludeEndpoint()  // Swagger 문서에서 제외
  healthCheck() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
