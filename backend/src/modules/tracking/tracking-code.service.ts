import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';

export interface TrackingCodeData {
  productId: string;
  contactId?: string;
  sendLogId?: string;
  timestamp: number;
}

@Injectable()
export class TrackingCodeService {
  
  generateTrackingCode(data: TrackingCodeData): string {
    // 추적 코드 생성: track_ + nanoid(10) + timestamp의 마지막 6자리
    const shortTimestamp = data.timestamp.toString().slice(-6);
    const randomId = nanoid(10);
    return `track_${randomId}_${shortTimestamp}`;
  }

  generateTrackingUrl(
    productId: string,
    contactId?: string,
    sendLogId?: string,
  ): { trackingCode: string; trackingUrl: string } {
    const trackingData: TrackingCodeData = {
      productId,
      contactId,
      sendLogId,
      timestamp: Date.now(),
    };

    const trackingCode = this.generateTrackingCode(trackingData);
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const trackingUrl = `${baseUrl}/api/v1/tracking/click/${trackingCode}`;

    return { trackingCode, trackingUrl };
  }

  parseTrackingCode(trackingCode: string): { isValid: boolean; timestamp?: number } {
    try {
      // track_[randomId]_[timestamp] 형식 검증
      const parts = trackingCode.split('_');
      if (parts.length !== 3 || parts[0] !== 'track') {
        return { isValid: false };
      }

      const timestamp = parseInt(parts[2]);
      if (isNaN(timestamp)) {
        return { isValid: false };
      }

      // 추적 코드 유효 기간 체크 (30일)
      const now = Date.now();
      const codeAge = now - timestamp;
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30일

      if (codeAge > maxAge) {
        return { isValid: false };
      }

      return { isValid: true, timestamp };
    } catch (error) {
      return { isValid: false };
    }
  }

  // 마케팅 링크 생성 (상품 페이지로 리다이렉트)
  generateMarketingUrl(productId: string, marketLink?: string): string {
    if (marketLink) {
      return marketLink;
    }

    // 기본 상품 페이지 URL (향후 프론트엔드 구현 시 변경)
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/products/${productId}`;
  }

  // 디바이스 타입 감지
  detectDevice(userAgent?: string): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
      return 'mobile';
    } else if (/tablet|ipad/i.test(ua)) {
      return 'tablet';
    } else if (/desktop|windows|macintosh|linux/i.test(ua)) {
      return 'desktop';
    }
    
    return 'unknown';
  }

  // 브라우저 감지
  detectBrowser(userAgent?: string): string {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();
    
    if (ua.includes('chrome')) return 'chrome';
    if (ua.includes('firefox')) return 'firefox';
    if (ua.includes('safari')) return 'safari';
    if (ua.includes('edge')) return 'edge';
    if (ua.includes('opera')) return 'opera';
    
    return 'unknown';
  }

  // 메타데이터 생성
  generateMetadata(
    userAgent?: string,
    ipAddress?: string,
    referrer?: string,
  ): string {
    const metadata = {
      device: this.detectDevice(userAgent),
      browser: this.detectBrowser(userAgent),
      ipAddress,
      referrer,
      timestamp: Date.now(),
    };

    return JSON.stringify(metadata);
  }
}