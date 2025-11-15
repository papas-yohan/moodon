import { Injectable } from "@nestjs/common";
import { TrackingCodeService } from "../tracking/tracking-code.service";

export interface ProductInfo {
  id: string;
  name: string;
  price: number;
  size?: string;
  color?: string;
  marketLink?: string;
  composedImageUrl?: string;
}

export interface ContactInfo {
  id: string;
  name?: string;
  phone: string;
  kakaoId?: string;
}

export interface MessageTemplate {
  sms: string;
  kakao: {
    templateCode?: string;
    message: string;
    buttonName?: string;
    buttonUrl?: string;
  };
}

@Injectable()
export class MessageTemplateService {
  constructor(private trackingCodeService: TrackingCodeService) {}

  generateMessage(
    products: ProductInfo[],
    contact: ContactInfo,
    customMessage?: string,
  ): MessageTemplate {
    // 이름이 있으면 "이름님", 없으면 "고객님"
    const customerName = contact.name ? `${contact.name}님` : "고객님";

    if (products.length === 1) {
      return this.generateSingleProductMessage(
        products[0],
        customerName,
        customMessage,
      );
    } else {
      return this.generateMultiProductMessage(
        products,
        customerName,
        customMessage,
      );
    }
  }

  private generateSingleProductMessage(
    product: ProductInfo,
    customerName: string,
    customMessage?: string,
  ): MessageTemplate {
    const priceText = `${product.price.toLocaleString()}원`;
    const productDetails = [product.size, product.color]
      .filter(Boolean)
      .join(" / ");

    // 추적 URL 생성 (카카오톡용)
    const trackingUrl = this.generateTrackingUrl(product.id, "temp-contact-id");

    // SMS/MMS용 메시지 (링크 없이 간단하게)
    const smsMessage =
      customMessage ||
      `[신상품 안내]\n\n` +
        `${customerName}, 신상품이 입고되었습니다!\n\n` +
        `📦 ${product.name}\n` +
        `💰 ${priceText}` +
        (productDetails ? `\n📏 ${productDetails}` : "") +
        `\n\n지금 바로 확인해보세요!`;

    // 카카오톡용 메시지 (버튼 포함)
    const kakaoMessage =
      customMessage ||
      `${customerName}, 신상품이 입고되었습니다!\n\n` +
        `📦 ${product.name}\n` +
        `💰 ${priceText}` +
        (productDetails ? `\n📏 ${productDetails}` : "") +
        `\n\n지금 바로 확인해보세요! 👇`;

    return {
      sms: smsMessage,
      kakao: {
        message: kakaoMessage,
        buttonName: "상품 보기",
        buttonUrl: trackingUrl,
      },
    };
  }

  private generateMultiProductMessage(
    products: ProductInfo[],
    customerName: string,
    customMessage?: string,
  ): MessageTemplate {
    const productCount = products.length;
    const firstProduct = products[0];
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);

    // 대표 상품의 추적 URL 생성 (카카오톡용)
    const trackingUrl = this.generateTrackingUrl(
      firstProduct.id,
      "temp-contact-id",
    );

    // SMS/MMS용 메시지 (링크 없이 간단하게)
    const smsMessage =
      customMessage ||
      `[신상품 안내]\n\n` +
        `${customerName}, 신상품 ${productCount}개가 입고되었습니다!\n\n` +
        `🎁 ${firstProduct.name} 외 ${productCount - 1}개\n` +
        `💰 총 ${totalValue.toLocaleString()}원부터\n\n` +
        `다양한 신상품을 확인해보세요!`;

    // 카카오톡용 메시지 (버튼 포함)
    const kakaoMessage =
      customMessage ||
      `${customerName}, 신상품 ${productCount}개가 입고되었습니다!\n\n` +
        `🎁 ${firstProduct.name} 외 ${productCount - 1}개\n` +
        `💰 총 ${totalValue.toLocaleString()}원부터\n\n` +
        `다양한 신상품을 확인해보세요! 👇`;

    return {
      sms: smsMessage,
      kakao: {
        message: kakaoMessage,
        buttonName: "신상품 보기",
        buttonUrl: trackingUrl,
      },
    };
  }

  private generateTrackingUrl(productId: string, contactId: string): string {
    // TrackingCodeService를 사용하여 추적 URL 생성
    const { trackingUrl } = this.trackingCodeService.generateTrackingUrl(
      productId,
      contactId,
    );
    return trackingUrl;
  }

  // 카카오톡 알림톡 템플릿 (향후 확장)
  generateKakaoTemplate(
    templateCode: string,
    variables: Record<string, string>,
  ): string {
    // 템플릿 변수 치환 로직
    let template = this.getKakaoTemplate(templateCode);

    Object.entries(variables).forEach(([key, value]) => {
      template = template.replace(new RegExp(`{{${key}}}`, "g"), value);
    });

    return template;
  }

  private getKakaoTemplate(templateCode: string): string {
    // 미리 등록된 카카오톡 알림톡 템플릿들
    const templates: Record<string, string> = {
      NEW_PRODUCT: `{{customerName}}님, 신상품이 입고되었습니다!

📦 {{productName}}
💰 {{price}}원
{{#if productDetails}}📏 {{productDetails}}{{/if}}

지금 바로 확인해보세요!`,

      MULTI_PRODUCT: `{{customerName}}님, 신상품 {{productCount}}개가 입고되었습니다!

🎁 {{firstProductName}} 외 {{remainingCount}}개
💰 총 {{totalPrice}}원부터

다양한 신상품을 확인해보세요!`,
    };

    return templates[templateCode] || templates["NEW_PRODUCT"];
  }

  // SMS 길이 체크 및 최적화
  optimizeSmsMessage(message: string, maxLength: number = 90): string {
    if (message.length <= maxLength) {
      return message;
    }

    // 긴 메시지는 LMS로 처리하거나 줄임
    const truncated = message.substring(0, maxLength - 3) + "...";
    return truncated;
  }

  // 메시지 유형 결정
  getMessageType(message: string): "SMS" | "LMS" | "MMS" {
    const length = message.length;

    if (length <= 90) {
      return "SMS";
    } else if (length <= 2000) {
      return "LMS";
    } else {
      return "MMS";
    }
  }
}
