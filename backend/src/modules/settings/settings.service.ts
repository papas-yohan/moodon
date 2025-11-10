import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface ApiKeySettings {
  solapiApiKey?: string;
  solapiApiSecret?: string;
  solapiSender?: string;
  solapiKakaoPfid?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  webhookUrl?: string;
}

export interface MessageTemplate {
  id?: string;
  name: string;
  type: 'SMS' | 'KAKAO' | 'EMAIL';
  subject?: string;
  content: string;
  variables: string[];
  isDefault: boolean;
}

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  private readonly ALGORITHM = 'aes-256-cbc';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * 데이터 암호화
   */
  private encrypt(text: string): string {
    const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * 데이터 복호화
   */
  private decrypt(text: string): string {
    try {
      const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
      const parts = text.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error('복호화 실패:', error);
      return '';
    }
  }

  /**
   * API 키 마스킹 (보안을 위해 일부만 표시)
   */
  private maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) return '****';
    return apiKey.slice(0, 4) + '****' + apiKey.slice(-4);
  }

  /**
   * 솔라피 API 키 조회
   */
  async getApiKeys(): Promise<ApiKeySettings> {
    try {
      // 데이터베이스에서 설정 조회
      const settings = await this.prisma.setting.findMany({
        where: {
          key: {
            in: ['SOLAPI_API_KEY', 'SOLAPI_API_SECRET', 'SOLAPI_SENDER', 'SOLAPI_KAKAO_PFID'],
          },
        },
      });

      const result: ApiKeySettings = {};

      settings.forEach(setting => {
        const decryptedValue = this.decrypt(setting.value);
        
        switch (setting.key) {
          case 'SOLAPI_API_KEY':
            result.solapiApiKey = decryptedValue ? this.maskApiKey(decryptedValue) : undefined;
            break;
          case 'SOLAPI_API_SECRET':
            result.solapiApiSecret = decryptedValue ? this.maskApiKey(decryptedValue) : undefined;
            break;
          case 'SOLAPI_SENDER':
            result.solapiSender = decryptedValue;
            break;
          case 'SOLAPI_KAKAO_PFID':
            result.solapiKakaoPfid = decryptedValue;
            break;
        }
      });

      // DB에 없으면 환경 변수에서 가져오기
      if (!result.solapiApiKey) {
        const envKey = this.configService.get('SOLAPI_API_KEY');
        result.solapiApiKey = envKey ? this.maskApiKey(envKey) : undefined;
      }
      if (!result.solapiApiSecret) {
        const envSecret = this.configService.get('SOLAPI_API_SECRET');
        result.solapiApiSecret = envSecret ? this.maskApiKey(envSecret) : undefined;
      }
      if (!result.solapiSender) {
        result.solapiSender = this.configService.get('SOLAPI_SENDER');
      }
      if (!result.solapiKakaoPfid) {
        result.solapiKakaoPfid = this.configService.get('SOLAPI_KAKAO_PFID');
      }

      return result;
    } catch (error) {
      this.logger.error('API 키 조회 실패:', error);
      return {};
    }
  }

  /**
   * 솔라피 API 키 업데이트
   */
  async updateApiKey(type: string, apiKey: string): Promise<void> {
    try {
      const encryptedValue = this.encrypt(apiKey);
      
      await this.prisma.setting.upsert({
        where: { key: type },
        update: {
          value: encryptedValue,
          updatedAt: new Date(),
        },
        create: {
          key: type,
          value: encryptedValue,
        },
      });

      this.logger.log(`API 키 업데이트 성공: ${type}`);
    } catch (error) {
      this.logger.error(`API 키 업데이트 실패: ${type}`, error);
      throw new Error('API 키 업데이트에 실패했습니다.');
    }
  }

  /**
   * 실제 API 키 가져오기 (내부 사용, 마스킹 없음)
   */
  async getActualApiKey(type: string): Promise<string | undefined> {
    try {
      const setting = await this.prisma.setting.findUnique({
        where: { key: type },
      });

      if (setting) {
        return this.decrypt(setting.value);
      }

      // DB에 없으면 환경 변수에서 가져오기
      return this.configService.get(type);
    } catch (error) {
      this.logger.error(`API 키 조회 실패: ${type}`, error);
      return undefined;
    }
  }

  // 알림 설정 관리
  async getNotificationSettings(): Promise<NotificationSettings> {
    // 기본값 반환 (실제로는 DB에서 조회)
    return {
      emailNotifications: true,
      smsNotifications: false,
      webhookUrl: process.env.WEBHOOK_URL,
    };
  }

  async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    // 실제로는 DB에 저장
    console.log('알림 설정 업데이트:', settings);
    return settings;
  }

  // 메시지 템플릿 관리
  async getMessageTemplates(): Promise<MessageTemplate[]> {
    // 기본 템플릿들 반환
    return [
      {
        id: '1',
        name: '신상품 알림',
        type: 'SMS',
        content: '안녕하세요 {{customerName}}님! 새로운 상품 {{productName}}이 출시되었습니다. 지금 확인해보세요! {{productUrl}}',
        variables: ['customerName', 'productName', 'productUrl'],
        isDefault: true,
      },
      {
        id: '2',
        name: '할인 이벤트',
        type: 'KAKAO',
        content: '🎉 특별 할인 이벤트! {{productName}}을 {{discountRate}}% 할인된 가격에 만나보세요. 기간: {{eventPeriod}}',
        variables: ['productName', 'discountRate', 'eventPeriod'],
        isDefault: true,
      },
      {
        id: '3',
        name: '이메일 뉴스레터',
        type: 'EMAIL',
        subject: '{{companyName}} 주간 뉴스레터',
        content: '안녕하세요 {{customerName}}님,\n\n이번 주 추천 상품을 소개해드립니다.\n\n{{productList}}\n\n감사합니다.',
        variables: ['companyName', 'customerName', 'productList'],
        isDefault: false,
      },
    ];
  }

  async createMessageTemplate(template: Omit<MessageTemplate, 'id'>): Promise<MessageTemplate> {
    const newTemplate: MessageTemplate = {
      ...template,
      id: Date.now().toString(),
    };
    
    console.log('새 템플릿 생성:', newTemplate);
    return newTemplate;
  }

  async updateMessageTemplate(id: string, template: Partial<MessageTemplate>): Promise<MessageTemplate> {
    const templates = await this.getMessageTemplates();
    const existing = templates.find(t => t.id === id);
    
    if (!existing) {
      throw new Error('템플릿을 찾을 수 없습니다.');
    }

    const updated = { ...existing, ...template };
    console.log('템플릿 업데이트:', updated);
    return updated;
  }

  async deleteMessageTemplate(id: string): Promise<void> {
    console.log('템플릿 삭제:', id);
  }

  // 시스템 설정
  async getSystemSettings() {
    return {
      maxSendPerDay: 1000,
      maxSendPerHour: 100,
      defaultSendDelay: 1000, // ms
      enableTracking: true,
      enableAnalytics: true,
      dataRetentionDays: 90,
    };
  }

  async updateSystemSettings(settings: any) {
    console.log('시스템 설정 업데이트:', settings);
    return settings;
  }

  // 템플릿 변수 추출
  extractVariables(content: string): string[] {
    const matches = content.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    
    return matches.map(match => match.replace(/[{}]/g, ''));
  }

  // 템플릿 미리보기
  previewTemplate(template: MessageTemplate, variables: Record<string, string>): string {
    let preview = template.content;
    
    template.variables.forEach(variable => {
      const value = variables[variable] || `[${variable}]`;
      preview = preview.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), value);
    });
    
    return preview;
  }
}