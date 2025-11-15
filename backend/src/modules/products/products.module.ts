import { Module, forwardRef } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { StorageModule } from "../../common/storage/storage.module";
import { ComposerModule } from "../composer/composer.module";

@Module({
  imports: [PrismaModule, StorageModule, forwardRef(() => ComposerModule)],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
