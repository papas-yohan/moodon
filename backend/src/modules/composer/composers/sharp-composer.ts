import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs/promises';
import {
  IImageComposer,
  ImageInput,
  ComposeOptions,
  ComposedImage,
} from '../interfaces/image-composer.interface';

/**
 * Sharp 라이브러리 기반 이미지 합성기
 * 무료이며 빠르지만 단순한 레이아웃 합성만 가능
 */
@Injectable()
export class SharpComposer implements IImageComposer {
  private readonly logger = new Logger(SharpComposer.name);

  async compose(
    images: ImageInput[],
    options: ComposeOptions,
  ): Promise<ComposedImage> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Sharp composer: Starting composition with ${images.length} images`);
      
      // 이미지 다운로드
      const imageBuffers = await this.downloadImages(images);
      
      // 템플릿에 따른 합성
      let composedBuffer: Buffer;
      
      switch (options.templateType) {
        case 'grid':
          composedBuffer = await this.createGridLayout(imageBuffers, options.productInfo);
          break;
        case 'highlight':
          composedBuffer = await this.createHighlightLayout(imageBuffers, options.productInfo);
          break;
        case 'simple':
          composedBuffer = await this.createSimpleLayout(imageBuffers, options.productInfo);
          break;
        default:
          throw new Error(`Unsupported template type: ${options.templateType}`);
      }

      // 메타데이터 추출
      const metadata = await sharp(composedBuffer).metadata();
      
      const processingTime = (Date.now() - startTime) / 1000;
      
      this.logger.log(`Sharp composer: Completed in ${processingTime}s`);
      
      return {
        buffer: composedBuffer,
        metadata: {
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: metadata.format || 'jpeg',
          size: composedBuffer.length,
        },
        processingTime,
        composer: 'sharp',
      };
    } catch (error) {
      this.logger.error('Sharp composer: Composition failed', error);
      throw error;
    }
  }

  getSupportedTemplates(): string[] {
    return ['grid', 'highlight', 'simple'];
  }

  canCompose(imageCount: number): boolean {
    return imageCount >= 1 && imageCount <= 10;
  }

  getEstimatedTime(imageCount: number): number {
    // Sharp는 매우 빠름 (이미지당 약 0.5초)
    return imageCount * 0.5;
  }

  private async downloadImages(images: ImageInput[]): Promise<Buffer[]> {
    const buffers: Buffer[] = [];
    
    for (const image of images) {
      try {
        let localPath: string;
        
        if (image.url.startsWith('http://localhost:3000/uploads/')) {
          localPath = image.url.replace('http://localhost:3000/', './');
        } else if (image.url.startsWith('/uploads/')) {
          localPath = '.' + image.url;
        } else if (image.url.startsWith('uploads/')) {
          localPath = './' + image.url;
        } else {
          throw new Error(`Unsupported URL format: ${image.url}`);
        }
        
        this.logger.debug(`Reading image from: ${localPath}`);
        const buffer = await fs.readFile(localPath);
        buffers.push(buffer);
      } catch (error) {
        this.logger.error(`Failed to download image: ${image.url}`, error);
        throw error;
      }
    }
    
    return buffers;
  }

  private async createGridLayout(
    imageBuffers: Buffer[],
    productInfo: any,
  ): Promise<Buffer> {
    const canvasWidth = 1080;
    const canvasHeight = 1350;
    const imageSize = 320;
    const padding = 30;
    const headerHeight = 180;
    const cardPadding = 20;
    const ctaButtonHeight = 80;
    const bottomPadding = 30;
    
    // 그라데이션 배경 생성
    const gradientBackground = await this.createGradientBackground(canvasWidth, canvasHeight);
    
    const background = sharp(gradientBackground);

    // 이미지 그리드 끝 위치 계산
    const imageRows = Math.ceil(Math.min(imageBuffers.length, 6) / 3);
    const imageGridEndY = headerHeight + imageRows * (imageSize + padding);

    // 이미지들을 라운드 코너와 그림자 효과로 처리
    const processedImages = await Promise.all(
      imageBuffers.slice(0, 6).map(async (buffer, index) => {
        // 이미지 리사이즈 및 라운드 코너
        const processedImage = await this.addRoundedCorners(buffer, imageSize, 20);
        
        const row = Math.floor(index / 3);
        const col = index % 3;
        const left = padding + col * (imageSize + padding);
        const top = headerHeight + row * (imageSize + padding);
        
        return { input: processedImage, left, top };
      }),
    );

    // 상단 헤더 카드
    const headerCard = await this.createHeaderCard(productInfo, canvasWidth);
    
    const compositeElements = [
      {
        input: headerCard,
        top: 20,
        left: 20,
      },
      ...processedImages,
    ];

    // 하단 요소들의 위치 계산
    let currentY = imageGridEndY + padding;
    
    // 설명이 있으면 추가
    if (productInfo.description && productInfo.description.trim() !== '') {
      const descriptionCard = await this.createDescriptionCard(
        productInfo.description,
        canvasWidth,
      );
      
      // 설명 카드의 높이를 계산 (최대 5줄 * 32px + 패딩)
      const descriptionHeight = Math.min(
        this.wrapText(productInfo.description, 28).length * 32 + 60,
        200
      );
      
      compositeElements.push({
        input: descriptionCard,
        top: currentY,
        left: 40,
      });
      
      currentY += descriptionHeight + padding;
    }

    // CTA 버튼 추가
    const ctaButton = await this.createCTAButton(canvasWidth);
    compositeElements.push({
      input: ctaButton,
      top: currentY,
      left: (canvasWidth - 600) / 2,
    });
    
    const result = await background
      .composite(compositeElements)
      .jpeg({ quality: 95 })
      .toBuffer();

    return result;
  }

  private async createHighlightLayout(
    imageBuffers: Buffer[],
    productInfo: any,
  ): Promise<Buffer> {
    const canvasWidth = 1080;
    const canvasHeight = 1350;
    const mainImageSize = 700;
    const thumbSize = 150;
    const padding = 30;
    
    // 그라데이션 배경
    const gradientBackground = await this.createGradientBackground(canvasWidth, canvasHeight);
    const background = sharp(gradientBackground);

    const compositeImages = [];
    
    // 메인 이미지 (라운드 코너 + 그림자)
    const mainImageTop = 200;
    if (imageBuffers.length > 0) {
      const mainImage = await this.addRoundedCorners(imageBuffers[0], mainImageSize, 30);
      
      compositeImages.push({
        input: mainImage,
        left: (canvasWidth - mainImageSize) / 2,
        top: mainImageTop,
      });
    }

    // 썸네일 이미지들 (라운드 코너)
    const thumbnails = imageBuffers.slice(1, 5);
    const thumbStartX = (canvasWidth - (thumbnails.length * (thumbSize + 15) - 15)) / 2;
    const thumbTop = mainImageTop + mainImageSize + padding;
    
    for (let i = 0; i < thumbnails.length; i++) {
      const thumbnail = await this.addRoundedCorners(thumbnails[i], thumbSize, 15);
      
      const left = thumbStartX + i * (thumbSize + 15);
      
      compositeImages.push({
        input: thumbnail,
        left,
        top: thumbTop,
      });
    }

    // 상단 헤더 카드
    const headerCard = await this.createHeaderCard(productInfo, canvasWidth);
    compositeImages.push({
      input: headerCard,
      top: 20,
      left: 20,
    });

    // 하단 요소들의 위치 계산
    let currentY = thumbTop + thumbSize + padding;

    // 상품 설명 카드
    if (productInfo.description && productInfo.description.trim() !== '') {
      const descriptionCard = await this.createDescriptionCard(
        productInfo.description,
        canvasWidth,
      );
      
      const descriptionHeight = Math.min(
        this.wrapText(productInfo.description, 28).length * 32 + 60,
        200
      );
      
      compositeImages.push({
        input: descriptionCard,
        top: currentY,
        left: 40,
      });
      
      currentY += descriptionHeight + padding;
    }

    // 하단 CTA 버튼
    const ctaButton = await this.createCTAButton(canvasWidth);
    compositeImages.push({
      input: ctaButton,
      top: currentY,
      left: (canvasWidth - 600) / 2,
    });

    const result = await background
      .composite(compositeImages)
      .jpeg({ quality: 95 })
      .toBuffer();

    return result;
  }

  private async createSimpleLayout(
    imageBuffers: Buffer[],
    productInfo: any,
  ): Promise<Buffer> {
    const canvasWidth = 1080;
    const canvasHeight = 1350;
    const imageSize = 500;
    const padding = 30;
    const headerHeight = 180;
    
    // 그라데이션 배경
    const gradientBackground = await this.createGradientBackground(canvasWidth, canvasHeight);
    const background = sharp(gradientBackground);

    const compositeImages = [];
    
    // 이미지들을 세로로 배치 (라운드 코너)
    const imagesToShow = Math.min(imageBuffers.length, 2);
    const startY = headerHeight;
    
    for (let i = 0; i < imagesToShow; i++) {
      const processedImage = await this.addRoundedCorners(imageBuffers[i], imageSize, 25);
      
      const left = (canvasWidth - imageSize) / 2;
      const top = startY + i * (imageSize + padding);
      
      compositeImages.push({
        input: processedImage,
        left,
        top,
      });
    }

    // 상단 헤더 카드
    const headerCard = await this.createHeaderCard(productInfo, canvasWidth);
    compositeImages.push({
      input: headerCard,
      top: 20,
      left: 20,
    });

    // 하단 요소들의 위치 계산
    const imageGridEndY = startY + imagesToShow * (imageSize + padding);
    let currentY = imageGridEndY + padding;

    // 상품 설명 카드
    if (productInfo.description && productInfo.description.trim() !== '') {
      const descriptionCard = await this.createDescriptionCard(
        productInfo.description,
        canvasWidth,
      );
      
      const descriptionHeight = Math.min(
        this.wrapText(productInfo.description, 28).length * 32 + 60,
        200
      );
      
      compositeImages.push({
        input: descriptionCard,
        top: currentY,
        left: 40,
      });
      
      currentY += descriptionHeight + padding;
    }

    // 하단 CTA 버튼
    const ctaButton = await this.createCTAButton(canvasWidth);
    compositeImages.push({
      input: ctaButton,
      top: currentY,
      left: (canvasWidth - 600) / 2,
    });

    const result = await background
      .composite(compositeImages)
      .jpeg({ quality: 95 })
      .toBuffer();

    return result;
  }

  /**
   * 그라데이션 배경 생성
   */
  private async createGradientBackground(width: number, height: number): Promise<Buffer> {
    // 부드러운 그라데이션 배경 (연한 파스텔 톤)
    const svg = `
      <svg width="${width}" height="${height}">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#e9ecef;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#dee2e6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad1)"/>
      </svg>
    `;
    
    return Buffer.from(svg);
  }

  /**
   * 라운드 코너 이미지 생성
   */
  private async addRoundedCorners(
    imageBuffer: Buffer,
    size: number,
    radius: number,
  ): Promise<Buffer> {
    // 이미지 리사이즈
    const resized = await sharp(imageBuffer)
      .resize(size, size, { fit: 'cover' })
      .toBuffer();

    // 라운드 마스크 SVG 생성
    const mask = Buffer.from(
      `<svg width="${size}" height="${size}">
        <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/>
      </svg>`,
    );

    // 흰색 배경 생성
    const whiteBackground = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    // 배경 + 이미지 + 마스크 합성
    const result = await sharp(whiteBackground)
      .composite([
        {
          input: resized,
          blend: 'over',
        },
        {
          input: mask,
          blend: 'dest-in',
        },
      ])
      .png()
      .toBuffer();

    return result;
  }

  /**
   * 헤더 카드 생성 (상품 정보)
   */
  private async createHeaderCard(productInfo: any, canvasWidth: number): Promise<Buffer> {
    const cardWidth = canvasWidth - 40;
    const cardHeight = 140;
    const priceText = `₩${productInfo.price.toLocaleString()}`;
    const sizeColorText = [productInfo.size, productInfo.color]
      .filter(Boolean)
      .join(' · ');

    const svg = `
      <svg width="${cardWidth}" height="${cardHeight}">
        <defs>
          <style>
            .card-title { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              font-size: 36px; 
              font-weight: 700; 
              fill: #212529;
              letter-spacing: -0.5px;
            }
            .card-price { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              font-size: 42px; 
              font-weight: 800; 
              fill: #ff6b6b;
              letter-spacing: -1px;
            }
            .card-info { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              font-size: 20px; 
              font-weight: 500;
              fill: #6c757d;
            }
          </style>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- 카드 배경 -->
        <rect x="0" y="0" width="${cardWidth}" height="${cardHeight}" 
              rx="20" fill="white" filter="url(#shadow)" opacity="0.95"/>
        
        <!-- 상품명 -->
        <text x="${cardWidth / 2}" y="45" text-anchor="middle" class="card-title">
          ${this.escapeXml(productInfo.name)}
        </text>
        
        <!-- 가격 -->
        <text x="${cardWidth / 2}" y="95" text-anchor="middle" class="card-price">
          ${priceText}
        </text>
        
        <!-- 사이즈/색상 -->
        ${sizeColorText ? `
        <text x="${cardWidth / 2}" y="125" text-anchor="middle" class="card-info">
          ${this.escapeXml(sizeColorText)}
        </text>
        ` : ''}
      </svg>
    `;

    return Buffer.from(svg);
  }

  /**
   * 상품 설명 카드 생성
   */
  private async createDescriptionCard(
    description: string,
    canvasWidth: number,
  ): Promise<Buffer> {
    if (!description || description.trim() === '') {
      // 설명이 없으면 빈 버퍼 반환
      return Buffer.from('');
    }

    const cardWidth = canvasWidth - 80;
    const maxCharsPerLine = 28; // 한 줄에 표시할 최대 글자 수
    const lineHeight = 32;
    const padding = 30;
    
    // 텍스트를 줄바꿈 처리
    const lines = this.wrapText(description, maxCharsPerLine);
    const cardHeight = Math.min(lines.length * lineHeight + padding * 2, 200); // 최대 높이 제한

    const svg = `
      <svg width="${cardWidth}" height="${cardHeight}">
        <defs>
          <style>
            .desc-text { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              font-size: 22px; 
              font-weight: 400; 
              fill: #495057;
              line-height: 1.6;
              letter-spacing: -0.3px;
            }
          </style>
          <filter id="descShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.15"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- 카드 배경 -->
        <rect x="0" y="0" width="${cardWidth}" height="${cardHeight}" 
              rx="15" fill="white" filter="url(#descShadow)" opacity="0.9"/>
        
        <!-- 설명 텍스트 (여러 줄) -->
        ${lines
          .slice(0, 5) // 최대 5줄까지만 표시
          .map(
            (line, index) => `
          <text x="${cardWidth / 2}" y="${padding + (index + 1) * lineHeight}" 
                text-anchor="middle" class="desc-text">
            ${this.escapeXml(line)}
          </text>
        `,
          )
          .join('')}
      </svg>
    `;

    return Buffer.from(svg);
  }

  /**
   * 텍스트를 지정된 길이로 줄바꿈
   */
  private wrapText(text: string, maxCharsPerLine: number): string[] {
    const lines: string[] = [];
    let currentLine = '';
    
    // 먼저 줄바꿈 문자로 분리
    const paragraphs = text.split(/\n/);
    
    for (const paragraph of paragraphs) {
      const words = paragraph.split(' ');
      
      for (const word of words) {
        // 한글/영문 혼합 고려 (한글은 2바이트로 계산)
        const wordLength = this.getTextLength(word);
        const currentLength = this.getTextLength(currentLine);
        
        if (currentLength + wordLength + 1 <= maxCharsPerLine) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) {
            lines.push(currentLine);
          }
          currentLine = word;
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }
    }
    
    return lines;
  }

  /**
   * 텍스트 길이 계산 (한글은 2로 계산)
   */
  private getTextLength(text: string): number {
    let length = 0;
    for (const char of text) {
      // 한글, 한자, 일본어 등은 2로 계산
      if (char.match(/[\u3000-\u9FFF\uAC00-\uD7AF]/)) {
        length += 2;
      } else {
        length += 1;
      }
    }
    return length;
  }

  /**
   * CTA 버튼 생성
   */
  private async createCTAButton(canvasWidth: number): Promise<Buffer> {
    const buttonWidth = 600;
    const buttonHeight = 80;

    const svg = `
      <svg width="${buttonWidth}" height="${buttonHeight}">
        <defs>
          <style>
            .button-text { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              font-size: 28px; 
              font-weight: 700; 
              fill: white;
              letter-spacing: 0.5px;
            }
          </style>
          <linearGradient id="buttonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
          <filter id="buttonShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
            <feOffset dx="0" dy="4" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- 버튼 배경 -->
        <rect x="0" y="0" width="${buttonWidth}" height="${buttonHeight}" 
              rx="40" fill="url(#buttonGrad)" filter="url(#buttonShadow)"/>
        
        <!-- 버튼 텍스트 -->
        <text x="${buttonWidth / 2}" y="${buttonHeight / 2 + 10}" 
              text-anchor="middle" class="button-text">
          🛒 바로 주문하기
        </text>
      </svg>
    `;

    return Buffer.from(svg);
  }

  /**
   * XML 특수문자 이스케이프
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
