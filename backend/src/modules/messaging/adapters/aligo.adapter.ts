import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

export interface MessagePayload {
  to: string;
  text: string;
  imageUrl?: string;
}

export interface SendResult {
  messageId: string;
  status: "success" | "failed";
  errorCode?: string;
  errorMessage?: string;
}

@Injectable()
export class AligoAdapter {
  private readonly logger = new Logger(AligoAdapter.name);
  private readonly ALIGO_API_URL = "https://apis.aligo.in";
  private apiKey: string;
  private userId: string;
  private sender: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>("ALIGO_API_KEY");
    this.userId = this.configService.get<string>("ALIGO_USER_ID");
    this.sender = this.configService.get<string>("ALIGO_SENDER");

    if (!this.apiKey || !this.userId || !this.sender) {
      this.logger.warn(
        "알리고 API 키가 설정되지 않았습니다. 테스트 모드로 실행됩니다.",
      );
    } else {
      this.logger.log("알리고 서비스 초기화 완료");
    }
  }

  /**
   * SMS 전송 (단문)
   */
  async sendSMS(payload: MessagePayload): Promise<SendResult> {
    try {
      if (!this.apiKey || !this.userId || !this.sender) {
        this.logger.warn("테스트 모드: SMS 발송 시뮬레이션");
        return {
          messageId: `test-${Date.now()}`,
          status: "success",
        };
      }

      this.logger.log(`실제 SMS 발송 시작 - 수신자: ${payload.to}`);

      const FormData = require("form-data");
      const form = new FormData();

      form.append("key", this.apiKey);
      form.append("user_id", this.userId);
      form.append("sender", this.sender);
      form.append("receiver", payload.to);
      form.append("msg", payload.text);
      form.append("testmode_yn", "N");

      const response = await axios.post(`${this.ALIGO_API_URL}/send/`, form, {
        headers: form.getHeaders(),
      });

      if (response.data.result_code === "1") {
        this.logger.log(`SMS 발송 성공: ${response.data.msg_id}`);
        return {
          messageId: response.data.msg_id || `sms-${Date.now()}`,
          status: "success",
        };
      } else {
        throw new Error(response.data.message || "SMS 발송 실패");
      }
    } catch (error) {
      this.logger.error(`SMS 발송 실패: ${error.message}`);
      return {
        messageId: "",
        status: "failed",
        errorCode: error.code || "UNKNOWN_ERROR",
        errorMessage: error.message,
      };
    }
  }

  /**
   * LMS 전송 (장문)
   */
  async sendLMS(payload: MessagePayload): Promise<SendResult> {
    try {
      if (!this.apiKey || !this.userId || !this.sender) {
        this.logger.warn("테스트 모드: LMS 발송 시뮬레이션");
        return {
          messageId: `test-${Date.now()}`,
          status: "success",
        };
      }

      this.logger.log(`실제 LMS 발송 시작 - 수신자: ${payload.to}`);

      const FormData = require("form-data");
      const form = new FormData();

      form.append("key", this.apiKey);
      form.append("user_id", this.userId);
      form.append("sender", this.sender);
      form.append("receiver", payload.to);
      form.append("msg", payload.text);
      form.append("title", "신상품 안내");
      form.append("testmode_yn", "N");

      const response = await axios.post(`${this.ALIGO_API_URL}/send/`, form, {
        headers: form.getHeaders(),
      });

      if (response.data.result_code === "1") {
        this.logger.log(`LMS 발송 성공: ${response.data.msg_id}`);
        return {
          messageId: response.data.msg_id || `lms-${Date.now()}`,
          status: "success",
        };
      } else {
        throw new Error(response.data.message || "LMS 발송 실패");
      }
    } catch (error) {
      this.logger.error(`LMS 발송 실패: ${error.message}`);
      return {
        messageId: "",
        status: "failed",
        errorCode: error.code || "UNKNOWN_ERROR",
        errorMessage: error.message,
      };
    }
  }

  /**
   * MMS 전송 (이미지 포함)
   */
  async sendMMS(payload: MessagePayload): Promise<SendResult> {
    try {
      if (!this.apiKey || !this.userId || !this.sender) {
        this.logger.warn("테스트 모드: MMS 발송 시뮬레이션");
        return {
          messageId: `test-${Date.now()}`,
          status: "success",
        };
      }

      this.logger.log(`실제 MMS 발송 시작 - 수신자: ${payload.to}`);

      if (!payload.imageUrl) {
        this.logger.warn("이미지 URL이 없습니다. LMS로 대체 발송");
        return this.sendLMS(payload);
      }

      const FormData = require("form-data");
      const form = new FormData();

      form.append("key", this.apiKey);
      form.append("user_id", this.userId);
      form.append("sender", this.sender);
      form.append("receiver", payload.to);
      form.append("msg", payload.text);
      form.append("title", "신상품 안내");
      form.append("image_url", payload.imageUrl); // Cloudinary URL 직접 전달
      form.append("testmode_yn", "N");

      this.logger.log(`MMS 발송 - 이미지 URL: ${payload.imageUrl}`);

      const response = await axios.post(`${this.ALIGO_API_URL}/send/`, form, {
        headers: form.getHeaders(),
      });

      if (response.data.result_code === "1") {
        this.logger.log(`MMS 발송 성공: ${response.data.msg_id}`);
        return {
          messageId: response.data.msg_id || `mms-${Date.now()}`,
          status: "success",
        };
      } else {
        throw new Error(response.data.message || "MMS 발송 실패");
      }
    } catch (error) {
      this.logger.error(`MMS 발송 실패: ${error.message}`);
      if (error.response) {
        this.logger.error(`응답 데이터: ${JSON.stringify(error.response.data)}`);
      }

      // MMS 실패 시 LMS로 대체
      this.logger.log("MMS 실패, LMS로 대체 발송");
      return this.sendLMS(payload);
    }
  }

  /**
   * 잔액 조회
   */
  async getBalance(): Promise<number> {
    try {
      if (!this.apiKey || !this.userId) {
        return 0;
      }

      const FormData = require("form-data");
      const form = new FormData();

      form.append("key", this.apiKey);
      form.append("user_id", this.userId);

      const response = await axios.post(
        `${this.ALIGO_API_URL}/remain/`,
        form,
        {
          headers: form.getHeaders(),
        },
      );

      if (response.data.result_code === "1") {
        const smsCount = parseInt(response.data.SMS_CNT || "0");
        const lmsCount = parseInt(response.data.LMS_CNT || "0");
        const mmsCount = parseInt(response.data.MMS_CNT || "0");

        this.logger.log(
          `잔액 조회 - SMS: ${smsCount}, LMS: ${lmsCount}, MMS: ${mmsCount}`,
        );

        return smsCount + lmsCount + mmsCount;
      }

      return 0;
    } catch (error) {
      this.logger.error(`잔액 조회 실패: ${error.message}`);
      return 0;
    }
  }

  /**
   * 서비스 상태 확인
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.userId && this.sender);
  }
}
