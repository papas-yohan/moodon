import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SettingsService } from "../../settings/settings.service";
import axios from "axios";
import * as crypto from "crypto";

export interface MessagePayload {
  to: string;
  text: string;
  imageUrl?: string;
  trackingUrl?: string;
  templateCode?: string; // 카카오톡 템플릿용
}

export interface SendResult {
  messageId: string;
  status: "success" | "failed";
  errorCode?: string;
  errorMessage?: string;
}

@Injectable()
export class SolapiAdapter {
  private readonly logger = new Logger(SolapiAdapter.name);
  private messageService: any;
  private isInitialized = false;
  private apiKey: string;
  private apiSecret: string;
  private readonly SOLAPI_API_URL = "https://api.solapi.com";

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService,
  ) {
    this.initializeSolapi();
  }

  /**
   * 솔라피 서비스 초기화 (동적)
   */
  private async initializeSolapi() {
    try {
      // 데이터베이스에서 API 키 가져오기
      this.apiKey =
        await this.settingsService.getActualApiKey("SOLAPI_API_KEY");
      this.apiSecret =
        await this.settingsService.getActualApiKey("SOLAPI_API_SECRET");

      if (!this.apiKey || !this.apiSecret) {
        this.logger.warn(
          "솔라피 API 키가 설정되지 않았습니다. 테스트 모드로 실행됩니다.",
        );
        return;
      }

      // Solapi v4 SDK 사용 (기존 호환성 유지)
      const solapi = await import("solapi");

      // config 설정
      solapi.config.init({
        apiKey: this.apiKey,
        apiSecret: this.apiSecret,
      });

      this.messageService = solapi.msg;
      this.isInitialized = true;

      this.logger.log("솔라피 서비스 초기화 완료");
    } catch (error) {
      this.logger.error("솔라피 서비스 초기화 실패:", error);
    }
  }

  /**
   * 솔라피 REST API 인증 헤더 생성
   */
  private getAuthHeaders(): Record<string, string> {
    const date = new Date().toISOString();
    const salt = crypto.randomBytes(16).toString("hex");
    const signature = crypto
      .createHmac("sha256", this.apiSecret)
      .update(date + salt)
      .digest("hex");

    return {
      Authorization: `HMAC-SHA256 apiKey=${this.apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * API 키 재로드 (설정 변경 시 호출)
   */
  async reloadApiKeys() {
    this.logger.log("솔라피 API 키 재로드 중...");
    this.isInitialized = false;
    this.messageService = null;
    await this.initializeSolapi();
  }

  /**
   * SMS 전송
   */
  async sendSMS(payload: MessagePayload): Promise<SendResult> {
    try {
      if (!this.isInitialized || !this.messageService) {
        this.logger.warn("테스트 모드: SMS 발송 시뮬레이션");
        return {
          messageId: `test-${Date.now()}`,
          status: "success",
        };
      }

      const sender =
        await this.settingsService.getActualApiKey("SOLAPI_SENDER");

      // Solapi v4 API 사용
      const result = await this.messageService.send({
        messages: [
          {
            to: payload.to,
            from: sender,
            text: payload.text,
          },
        ],
      });

      const messageId = result.groupId || `msg-${Date.now()}`;
      this.logger.log(`SMS sent successfully: ${messageId}`);

      return {
        messageId,
        status: "success",
      };
    } catch (error) {
      this.logger.error(`SMS send failed: ${error.message}`, error.stack);

      return {
        messageId: "",
        status: "failed",
        errorCode: error.code || "UNKNOWN_ERROR",
        errorMessage: error.message,
      };
    }
  }

  /**
   * LMS (장문 문자) 전송
   */
  async sendLMS(payload: MessagePayload): Promise<SendResult> {
    try {
      if (!this.isInitialized || !this.messageService) {
        this.logger.warn("테스트 모드: LMS 발송 시뮬레이션");
        return {
          messageId: `test-${Date.now()}`,
          status: "success",
        };
      }

      const sender =
        await this.settingsService.getActualApiKey("SOLAPI_SENDER");

      const result = await this.messageService.send({
        messages: [
          {
            to: payload.to,
            from: sender,
            text: payload.text,
            subject: "신상품 안내",
            type: "LMS",
          },
        ],
      });

      const messageId = result.groupId || `msg-${Date.now()}`;
      this.logger.log(`LMS sent successfully: ${messageId}`);

      return {
        messageId,
        status: "success",
      };
    } catch (error) {
      this.logger.error(`LMS send failed: ${error.message}`, error.stack);

      return {
        messageId: "",
        status: "failed",
        errorCode: error.code || "UNKNOWN_ERROR",
        errorMessage: error.message,
      };
    }
  }

  /**
   * MMS (이미지 문자) 전송 - REST API 직접 사용
   */
  async sendMMS(payload: MessagePayload): Promise<SendResult> {
    try {
      if (!this.isInitialized || !this.apiKey || !this.apiSecret) {
        this.logger.warn("테스트 모드: MMS 발송 시뮬레이션");
        return {
          messageId: `test-${Date.now()}`,
          status: "success",
        };
      }

      const sender =
        await this.settingsService.getActualApiKey("SOLAPI_SENDER");

      // 이미지가 있으면 MMS로, 없으면 LMS로 발송
      if (payload.imageUrl) {
        this.logger.log(`Sending MMS with image: ${payload.imageUrl}`);

        // 1단계: 이미지 파일 읽기
        const fs = await import("fs");
        const path = await import("path");

        let imagePath = payload.imageUrl;
        if (imagePath.startsWith("/uploads/")) {
          imagePath = path.join(process.cwd(), imagePath);
        } else if (imagePath.startsWith("uploads/")) {
          imagePath = path.join(process.cwd(), imagePath);
        }

        if (!fs.existsSync(imagePath)) {
          this.logger.warn(
            `Image file not found: ${imagePath}, sending as LMS`,
          );
          return this.sendLMS(payload);
        }

        // 2단계: 이미지를 솔라피 스토리지에 업로드
        this.logger.log(`Uploading image to Solapi storage: ${imagePath}`);
        const imageBuffer = fs.readFileSync(imagePath);
        const imageId = await this.uploadImageToSolapi(
          imageBuffer,
          path.basename(imagePath),
        );

        if (!imageId) {
          this.logger.warn("Image upload failed, sending as LMS");
          return this.sendLMS(payload);
        }

        this.logger.log(`Image uploaded successfully: ${imageId}`);

        // 3단계: MMS 발송
        const messageData = {
          messages: [
            {
              to: payload.to,
              from: sender,
              text: payload.text,
              subject: "신상품 안내",
              type: "MMS",
              imageId: imageId,
            },
          ],
        };

        const response = await axios.post(
          `${this.SOLAPI_API_URL}/messages/v4/send`,
          messageData,
          { headers: this.getAuthHeaders() },
        );

        const messageId = response.data.groupId || `msg-${Date.now()}`;
        this.logger.log(`MMS sent successfully: ${messageId}`);

        return {
          messageId,
          status: "success",
        };
      } else {
        // 이미지가 없으면 LMS로 발송
        return this.sendLMS(payload);
      }
    } catch (error) {
      this.logger.error(`MMS send failed: ${error.message}`, error.stack);
      if (error.response) {
        this.logger.error(`Response: ${JSON.stringify(error.response.data)}`);
      }

      // MMS 실패 시 LMS로 대체 시도
      try {
        this.logger.log("Retrying as LMS...");
        return await this.sendLMS(payload);
      } catch (lmsError) {
        return {
          messageId: "",
          status: "failed",
          errorCode: error.code || "UNKNOWN_ERROR",
          errorMessage: error.message,
        };
      }
    }
  }

  /**
   * 이미지를 솔라피 스토리지에 업로드
   */
  private async uploadImageToSolapi(
    imageBuffer: Buffer,
    filename: string,
  ): Promise<string | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const FormData = require("form-data");
      const formData = new FormData();

      formData.append("file", imageBuffer, {
        filename: filename,
        contentType: "image/jpeg",
      });

      const response = await axios.post(
        `${this.SOLAPI_API_URL}/storage/v1/files`,
        formData,
        {
          headers: {
            ...this.getAuthHeaders(),
            ...formData.getHeaders(),
          },
        },
      );

      return response.data.fileId || response.data.id;
    } catch (error) {
      this.logger.error(`Image upload to Solapi failed: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response: ${JSON.stringify(error.response.data)}`);
      }
      return null;
    }
  }

  /**
   * 카카오톡 알림톡 전송
   */
  async sendKakaoAlimtalk(payload: MessagePayload): Promise<SendResult> {
    try {
      if (!this.isInitialized || !this.messageService) {
        this.logger.warn("테스트 모드: 카카오톡 알림톡 발송 시뮬레이션");
        return {
          messageId: `test-${Date.now()}`,
          status: "success",
        };
      }

      const pfId =
        await this.settingsService.getActualApiKey("SOLAPI_KAKAO_PFID");

      if (!pfId) {
        throw new Error("Kakao Plus Friend ID not configured");
      }

      const result = await this.messageService.send({
        messages: [
          {
            to: payload.to,
            from: pfId,
            text: payload.text,
            type: "ATA",
            kakaoOptions: {
              pfId,
              templateId: payload.templateCode || "default_template",
              buttons: payload.trackingUrl
                ? [
                    {
                      buttonType: "WL",
                      buttonName: "바로주문하기",
                      linkMo: payload.trackingUrl,
                      linkPc: payload.trackingUrl,
                    },
                  ]
                : undefined,
            },
          },
        ],
      });

      const messageId = result.groupId || `msg-${Date.now()}`;
      this.logger.log(`Kakao Alimtalk sent successfully: ${messageId}`);

      return {
        messageId,
        status: "success",
      };
    } catch (error) {
      this.logger.error(
        `Kakao Alimtalk send failed: ${error.message}`,
        error.stack,
      );

      // 카카오톡 실패 시 SMS로 대체
      this.logger.log("카카오톡 실패, SMS로 대체 발송");
      return this.sendSMS(payload);
    }
  }

  /**
   * 카카오톡 친구톡 전송
   */
  async sendKakaoFriendtalk(payload: MessagePayload): Promise<SendResult> {
    try {
      if (!this.isInitialized || !this.messageService) {
        this.logger.warn("테스트 모드: 카카오톡 친구톡 발송 시뮬레이션");
        return {
          messageId: `test-${Date.now()}`,
          status: "success",
        };
      }

      const pfId =
        await this.settingsService.getActualApiKey("SOLAPI_KAKAO_PFID");

      if (!pfId) {
        throw new Error("Kakao Plus Friend ID not configured");
      }

      const result = await this.messageService.send({
        messages: [
          {
            to: payload.to,
            from: pfId,
            text: payload.text,
            type: "CTA",
            imageId: payload.imageUrl,
            kakaoOptions: {
              pfId,
              buttons: payload.trackingUrl
                ? [
                    {
                      buttonType: "WL",
                      buttonName: "바로주문하기",
                      linkMo: payload.trackingUrl,
                      linkPc: payload.trackingUrl,
                    },
                  ]
                : undefined,
            },
          },
        ],
      });

      const messageId = result.groupId || `msg-${Date.now()}`;
      this.logger.log(`Kakao Friendtalk sent successfully: ${messageId}`);

      return {
        messageId,
        status: "success",
      };
    } catch (error) {
      this.logger.error(
        `Kakao Friendtalk send failed: ${error.message}`,
        error.stack,
      );

      // 카카오톡 실패 시 SMS로 대체
      this.logger.log("카카오톡 실패, SMS로 대체 발송");
      return this.sendSMS(payload);
    }
  }

  /**
   * 이미지를 솔라피에 업로드
   */
  async uploadImage(imageBuffer: Buffer, filename: string): Promise<string> {
    try {
      if (!this.isInitialized || !this.messageService) {
        this.logger.warn("테스트 모드: 이미지 업로드 시뮬레이션");
        return `test-image-${Date.now()}`;
      }

      // Solapi v4 SDK의 storage 모듈 사용
      const solapi = await import("solapi");

      // 파일 확장자 추출
      const ext = filename.split(".").pop() || "jpg";

      // FormData를 사용하여 파일 업로드
      const FormData = (await import("form-data")).default;
      const formData = new FormData();
      formData.append("file", imageBuffer, {
        filename: filename,
        contentType: `image/${ext}`,
      });

      // 솔라피 storage API 직접 호출
      const result = await solapi.storage.uploadFile(formData);

      this.logger.log(`Image uploaded successfully: ${result.fileId}`);
      return result.fileId;
    } catch (error) {
      this.logger.error(`Image upload failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 메시지 전송 상태 조회
   */
  async getMessageStatus(messageId: string) {
    try {
      if (!this.isInitialized || !this.messageService) {
        this.logger.warn("테스트 모드: 메시지 상태 조회 시뮬레이션");
        return { status: "COMPLETED", statusMessage: "Test mode" };
      }

      const result = await this.messageService.getMessageStatus(messageId);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get message status: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 발송 가능한 잔액 조회
   */
  async getBalance() {
    try {
      if (!this.isInitialized || !this.messageService) {
        this.logger.warn("테스트 모드: 잔액 조회 시뮬레이션");
        return { balance: 10000, point: 0 };
      }

      const result = await this.messageService.getBalance();
      return result;
    } catch (error) {
      this.logger.error(`Failed to get balance: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 서비스 상태 확인
   */
  isConfigured(): boolean {
    return this.isInitialized && !!this.messageService;
  }
}
