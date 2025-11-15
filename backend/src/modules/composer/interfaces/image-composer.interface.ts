/**
 * 이미지 합성기 인터페이스
 * 다양한 합성 방식(Sharp, AI 등)을 지원하기 위한 공통 인터페이스
 */

export interface ImageInput {
  url: string;
  sequence: number;
}

export interface ProductInfo {
  name: string;
  description?: string;
  price: number;
  size?: string;
  color?: string;
  marketLink?: string;
}

export interface ComposeOptions {
  templateType: "grid" | "highlight" | "simple";
  productInfo: ProductInfo;
}

export interface ComposedImage {
  buffer: Buffer;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
  processingTime: number;
  composer: string;
}

/**
 * 이미지 합성기 인터페이스
 */
export interface IImageComposer {
  /**
   * 이미지 합성
   * @param images 입력 이미지 목록
   * @param options 합성 옵션
   * @returns 합성된 이미지 정보
   */
  compose(
    images: ImageInput[],
    options: ComposeOptions,
  ): Promise<ComposedImage>;

  /**
   * 지원하는 템플릿 목록
   */
  getSupportedTemplates(): string[];

  /**
   * 합성 가능 여부 확인
   * @param imageCount 이미지 개수
   */
  canCompose(imageCount: number): boolean;

  /**
   * 예상 처리 시간 (초)
   * @param imageCount 이미지 개수
   */
  getEstimatedTime(imageCount: number): number;

  /**
   * 비용 계산 (있는 경우)
   * @param imageCount 이미지 개수
   */
  estimateCost?(imageCount: number): number;
}

/**
 * 합성기 타입
 */
export enum ComposerType {
  SHARP = "sharp",
  STABILITY_AI = "stability-ai",
  OPENAI = "openai",
  REPLICATE = "replicate",
}
