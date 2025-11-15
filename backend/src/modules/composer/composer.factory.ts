import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  IImageComposer,
  ComposerType,
} from "./interfaces/image-composer.interface";
import { SharpComposer } from "./composers/sharp-composer";

/**
 * 이미지 합성기 팩토리
 * 환경 설정에 따라 적절한 Composer를 생성
 */
@Injectable()
export class ComposerFactory {
  private readonly logger = new Logger(ComposerFactory.name);

  constructor(
    private configService: ConfigService,
    private sharpComposer: SharpComposer,
  ) {}

  /**
   * 환경 설정에 따라 Composer 생성
   */
  create(): IImageComposer {
    const composerType = this.configService.get<string>(
      "IMAGE_COMPOSER_TYPE",
      ComposerType.SHARP,
    );

    this.logger.log(`Creating composer: ${composerType}`);

    switch (composerType) {
      case ComposerType.SHARP:
        return this.sharpComposer;

      // 향후 AI Composer 추가 예정
      // case ComposerType.STABILITY_AI:
      //   return this.createStabilityAIComposer();
      // case ComposerType.OPENAI:
      //   return this.createOpenAIComposer();
      // case ComposerType.REPLICATE:
      //   return this.createReplicateComposer();

      default:
        this.logger.warn(
          `Unknown composer type: ${composerType}, falling back to Sharp`,
        );
        return this.sharpComposer;
    }
  }

  /**
   * 특정 타입의 Composer 생성
   */
  createByType(type: ComposerType): IImageComposer {
    switch (type) {
      case ComposerType.SHARP:
        return this.sharpComposer;

      default:
        throw new Error(`Unsupported composer type: ${type}`);
    }
  }

  /**
   * 사용 가능한 Composer 목록
   */
  getAvailableComposers(): ComposerType[] {
    const available: ComposerType[] = [ComposerType.SHARP];

    // AI Composer가 설정되어 있으면 추가
    // if (this.configService.get('STABILITY_AI_API_KEY')) {
    //   available.push(ComposerType.STABILITY_AI);
    // }
    // if (this.configService.get('OPENAI_API_KEY')) {
    //   available.push(ComposerType.OPENAI);
    // }
    // if (this.configService.get('REPLICATE_API_TOKEN')) {
    //   available.push(ComposerType.REPLICATE);
    // }

    return available;
  }
}
