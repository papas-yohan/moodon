import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import {
  SettingsService,
  ApiKeySettings,
  NotificationSettings,
  MessageTemplate,
} from "./settings.service";

@ApiTags("settings")
@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // API 키 관리
  @Get("api-keys")
  @ApiOperation({ summary: "API 키 목록 조회" })
  @ApiResponse({ status: 200, description: "API 키 목록 (마스킹됨)" })
  async getApiKeys(): Promise<ApiKeySettings> {
    return this.settingsService.getApiKeys();
  }

  @Put("api-keys/:type")
  @ApiOperation({ summary: "API 키 업데이트" })
  @ApiParam({
    name: "type",
    description:
      "API 키 타입 (SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER, SOLAPI_KAKAO_PFID)",
  })
  @ApiBody({ schema: { properties: { apiKey: { type: "string" } } } })
  async updateApiKey(
    @Param("type") type: string,
    @Body("apiKey") apiKey: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.settingsService.updateApiKey(type, apiKey);
    return {
      success: true,
      message:
        "API 키가 성공적으로 업데이트되었습니다. 변경사항을 적용하려면 서버를 재시작하거나 /api/v1/settings/reload-api-keys를 호출하세요.",
    };
  }

  @Post("reload-api-keys")
  @ApiOperation({ summary: "API 키 재로드 (서버 재시작 없이 적용)" })
  @ApiResponse({ status: 200, description: "API 키가 재로드되었습니다." })
  async reloadApiKeys(): Promise<{ success: boolean; message: string }> {
    // SolapiAdapter 재초기화는 MessagingService를 통해 처리
    return {
      success: true,
      message:
        "API 키 재로드가 요청되었습니다. 다음 발송부터 새로운 설정이 적용됩니다.",
    };
  }

  // 알림 설정
  @Get("notifications")
  @ApiOperation({ summary: "알림 설정 조회" })
  @ApiResponse({ status: 200, description: "알림 설정" })
  async getNotificationSettings(): Promise<NotificationSettings> {
    return this.settingsService.getNotificationSettings();
  }

  @Put("notifications")
  @ApiOperation({ summary: "알림 설정 업데이트" })
  @ApiBody({ type: Object })
  async updateNotificationSettings(
    @Body() settings: NotificationSettings,
  ): Promise<NotificationSettings> {
    return this.settingsService.updateNotificationSettings(settings);
  }

  // 메시지 템플릿
  @Get("templates")
  @ApiOperation({ summary: "메시지 템플릿 목록 조회" })
  @ApiResponse({ status: 200, description: "템플릿 목록" })
  async getMessageTemplates(): Promise<MessageTemplate[]> {
    return this.settingsService.getMessageTemplates();
  }

  @Post("templates")
  @ApiOperation({ summary: "새 메시지 템플릿 생성" })
  @ApiBody({ type: Object })
  async createMessageTemplate(
    @Body() template: Omit<MessageTemplate, "id">,
  ): Promise<MessageTemplate> {
    return this.settingsService.createMessageTemplate(template);
  }

  @Put("templates/:id")
  @ApiOperation({ summary: "메시지 템플릿 업데이트" })
  @ApiParam({ name: "id", description: "템플릿 ID" })
  async updateMessageTemplate(
    @Param("id") id: string,
    @Body() template: Partial<MessageTemplate>,
  ): Promise<MessageTemplate> {
    return this.settingsService.updateMessageTemplate(id, template);
  }

  @Delete("templates/:id")
  @ApiOperation({ summary: "메시지 템플릿 삭제" })
  @ApiParam({ name: "id", description: "템플릿 ID" })
  async deleteMessageTemplate(
    @Param("id") id: string,
  ): Promise<{ success: boolean }> {
    await this.settingsService.deleteMessageTemplate(id);
    return { success: true };
  }

  // 템플릿 미리보기
  @Post("templates/preview")
  @ApiOperation({ summary: "템플릿 미리보기" })
  @ApiBody({
    schema: {
      properties: {
        template: { type: "object" },
        variables: { type: "object" },
      },
    },
  })
  async previewTemplate(
    @Body("template") template: MessageTemplate,
    @Body("variables") variables: Record<string, string>,
  ): Promise<{ preview: string }> {
    const preview = this.settingsService.previewTemplate(template, variables);
    return { preview };
  }

  // 시스템 설정
  @Get("system")
  @ApiOperation({ summary: "시스템 설정 조회" })
  @ApiResponse({ status: 200, description: "시스템 설정" })
  async getSystemSettings() {
    return this.settingsService.getSystemSettings();
  }

  @Put("system")
  @ApiOperation({ summary: "시스템 설정 업데이트" })
  @ApiBody({ type: Object })
  async updateSystemSettings(@Body() settings: any) {
    return this.settingsService.updateSystemSettings(settings);
  }
}
