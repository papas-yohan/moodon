import { Product } from "@prisma/client";

export interface MessageTemplate {
  sms: string;
  lms: string;
  kakaoAlimtalk: string;
  kakaoFriendtalk: string;
}

export class MessageTemplateService {
  /**
   * 상품 정보를 기반으로 메시지 템플릿 생성
   */
  static createProductMessage(
    product: Product,
    trackingUrl: string,
  ): MessageTemplate {
    const baseInfo = `${product.name}\n💰 ${product.price.toLocaleString()}원`;
    const sizeColor =
      product.size || product.color
        ? `\n📏 ${product.size || ""} ${product.color || ""}`.trim()
        : "";

    return {
      // SMS (90바이트 제한)
      sms: `🎉신상품!\n${product.name}\n${product.price.toLocaleString()}원\n👉${trackingUrl}`,

      // LMS (2000바이트)
      lms: `🎉 신상품 입고 알림!

${baseInfo}${sizeColor}

✨ 지금 바로 확인하고 주문하세요!

👉 바로주문: ${trackingUrl}

📞 문의: 1588-0000
⏰ 영업시간: 09:00-18:00`,

      // 카카오톡 알림톡 (템플릿 승인 필요)
      kakaoAlimtalk: `안녕하세요! 신상품이 입고되었습니다.

${baseInfo}${sizeColor}

지금 바로 확인해보세요!`,

      // 카카오톡 친구톡 (자유 형식)
      kakaoFriendtalk: `🎉 따끈따끈한 신상품 소식!

${baseInfo}${sizeColor}

💝 특별 혜택도 놓치지 마세요!
✅ 무료배송 (5만원 이상)
✅ 당일발송 (오후 2시 이전 주문)

지금 바로 주문하고 스타일을 완성하세요! ✨`,
    };
  }

  /**
   * 다중 상품용 메시지 템플릿
   */
  static createMultiProductMessage(
    products: Product[],
    trackingUrl: string,
  ): MessageTemplate {
    const productCount = products.length;
    const firstProduct = products[0];

    return {
      sms: `🎉신상품 ${productCount}개!\n${firstProduct.name} 외\n👉${trackingUrl}`,

      lms: `🎉 신상품 ${productCount}개 입고!

${products
  .slice(0, 3)
  .map((p) => `• ${p.name} ${p.price.toLocaleString()}원`)
  .join("\n")}
${productCount > 3 ? `외 ${productCount - 3}개 더...` : ""}

👉 전체보기: ${trackingUrl}

📞 문의: 1588-0000`,

      kakaoAlimtalk: `신상품 ${productCount}개가 입고되었습니다.

${products
  .slice(0, 2)
  .map((p) => `• ${p.name}`)
  .join("\n")}
${productCount > 2 ? `외 ${productCount - 2}개` : ""}

지금 바로 확인해보세요!`,

      kakaoFriendtalk: `🛍️ 대박! 신상품 ${productCount}개 동시 입고!

${products
  .slice(0, 3)
  .map((p) => `✨ ${p.name} - ${p.price.toLocaleString()}원`)
  .join("\n")}
${productCount > 3 ? `\n🎁 그리고 ${productCount - 3}개 더!` : ""}

💝 지금 주문하면 특별 혜택까지! 
놓치면 후회하는 기회예요~ 🏃‍♀️💨`,
    };
  }

  /**
   * 메시지 길이 체크 및 자동 조정
   */
  static optimizeMessageLength(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }

    // 줄바꿈 기준으로 자르기
    const lines = text.split("\n");
    let result = "";

    for (const line of lines) {
      if ((result + line + "\n").length > maxLength - 10) {
        // 여유분 10자
        result += "...";
        break;
      }
      result += line + "\n";
    }

    return result.trim();
  }

  /**
   * 추적 URL 단축
   */
  static createShortTrackingUrl(baseUrl: string, trackingCode: string): string {
    return `${baseUrl}/t/${trackingCode}`;
  }

  /**
   * 카카오톡 버튼 생성
   */
  static createKakaoButtons(trackingUrl: string, productName: string) {
    return [
      {
        buttonType: "WL",
        buttonName: "바로주문하기",
        linkMo: trackingUrl,
        linkPc: trackingUrl,
      },
      {
        buttonType: "WL",
        buttonName: "상품상세보기",
        linkMo: trackingUrl,
        linkPc: trackingUrl,
      },
    ];
  }

  /**
   * 시간대별 인사말 생성
   */
  static getTimeBasedGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) return "좋은 아침이에요! ☀️";
    if (hour < 18) return "안녕하세요! 😊";
    return "좋은 저녁이에요! 🌙";
  }

  /**
   * 이모지 추가 (선택적)
   */
  static addEmojis(
    text: string,
    style: "minimal" | "friendly" | "excited" = "friendly",
  ): string {
    const emojiSets = {
      minimal: {
        product: "•",
        price: "",
        action: "→",
      },
      friendly: {
        product: "✨",
        price: "💰",
        action: "👉",
      },
      excited: {
        product: "🎉",
        price: "💸",
        action: "🔥",
      },
    };

    const emojis = emojiSets[style];

    return text
      .replace(/•/g, emojis.product)
      .replace(/원/g, `원${emojis.price}`)
      .replace(/👉/g, emojis.action);
  }
}
