import { Injectable, Logger } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs/promises";
import { StorageService } from "../../common/storage/storage.service";
import { ComposerFactory } from "./composer.factory";
import {
  ComposeOptions,
  ImageInput,
  ComposerType,
} from "./interfaces/image-composer.interface";

// 하위 호환성을 위해 export 유지
export { ComposeOptions, ImageInput };

/**
 * 이미지 합성 서비스
 * Factory 패턴을 사용하여 다양한 Composer를 지원
 */
@Injectable()
export class ImageComposerService {
  private readonly logger = new Logger(ImageComposerService.name);

  constructor(
    private storageService: StorageService,
    private composerFactory: ComposerFactory,
  ) {}

  /**
   * 이미지 합성 (기존 메서드 - 하위 호환성 유지)
   */
  async composeImages(
    images: ImageInput[],
    options: ComposeOptions,
  ): Promise<string> {
    try {
      this.logger.log(
        `Starting image composition with ${images.length} images`,
      );

      // Factory에서 Composer 가져오기
      const composer = this.composerFactory.create();

      // 합성 실행
      const result = await composer.compose(images, options);

      // 합성된 이미지를 StorageService를 통해 저장 (Cloudinary 또는 로컬)
      const fileName = `composed-${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
      
      // Multer.File 형식으로 변환
      const file: Express.Multer.File = {
        buffer: result.buffer,
        originalname: fileName,
        mimetype: "image/jpeg",
        size: result.buffer.length,
        fieldname: "image",
        encoding: "7bit",
        stream: null as any,
        destination: "",
        filename: fileName,
        path: "",
      };

      // StorageService를 사용하여 업로드 (Cloudinary 우선)
      const uploadResult = await this.storageService.uploadImage(
        file,
        "composed",
        { quality: 90 },
      );

      const resultUrl = uploadResult.url;

      this.logger.log(
        `Image composition completed: ${resultUrl} (${result.processingTime}s, composer: ${result.composer})`,
      );

      return resultUrl;
    } catch (error) {
      this.logger.error("Image composition failed", error);
      throw error;
    }
  }

  /**
   * 특정 Composer로 합성
   */
  async composeWithType(
    images: ImageInput[],
    options: ComposeOptions,
    composerType: ComposerType,
  ): Promise<string> {
    try {
      this.logger.log(
        `Starting image composition with ${images.length} images using ${composerType}`,
      );

      const composer = this.composerFactory.createByType(composerType);
      const result = await composer.compose(images, options);

      const fileName = `composed-${composerType}-${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
      
      // Multer.File 형식으로 변환
      const file: Express.Multer.File = {
        buffer: result.buffer,
        originalname: fileName,
        mimetype: "image/jpeg",
        size: result.buffer.length,
        fieldname: "image",
        encoding: "7bit",
        stream: null as any,
        destination: "",
        filename: fileName,
        path: "",
      };

      // StorageService를 사용하여 업로드 (Cloudinary 우선)
      const uploadResult = await this.storageService.uploadImage(
        file,
        "composed",
        { quality: 90 },
      );

      const resultUrl = uploadResult.url;

      this.logger.log(
        `Image composition completed: ${resultUrl} (${result.processingTime}s)`,
      );

      return resultUrl;
    } catch (error) {
      this.logger.error("Image composition failed", error);
      throw error;
    }
  }

  /**
   * 사용 가능한 Composer 목록
   */
  getAvailableComposers(): ComposerType[] {
    return this.composerFactory.getAvailableComposers();
  }

  /**
   * Composer 정보 조회
   */
  async getComposerInfo(composerType: ComposerType) {
    const composer = this.composerFactory.createByType(composerType);

    return {
      type: composerType,
      supportedTemplates: composer.getSupportedTemplates(),
      canCompose: (imageCount: number) => composer.canCompose(imageCount),
      estimatedTime: (imageCount: number) =>
        composer.getEstimatedTime(imageCount),
      estimatedCost: composer.estimateCost
        ? (imageCount: number) => composer.estimateCost!(imageCount)
        : undefined,
    };
  }
}
