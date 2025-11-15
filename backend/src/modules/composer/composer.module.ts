import { Module, forwardRef } from "@nestjs/common";
import { ComposerService } from "./composer.service";
import { ComposerController } from "./composer.controller";
import { ImageComposerService } from "./image-composer.service";
import { ComposerFactory } from "./composer.factory";
import { SharpComposer } from "./composers/sharp-composer";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { StorageModule } from "../../common/storage/storage.module";

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [ComposerController],
  providers: [
    ComposerService,
    ImageComposerService,
    ComposerFactory,
    SharpComposer,
  ],
  exports: [ComposerService, ImageComposerService],
})
export class ComposerModule {}
