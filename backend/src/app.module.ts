import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { BullModule } from "@nestjs/bullmq";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RootController } from "./root.controller";
import { DocsController } from "./docs.controller";
import { ProductsModule } from "./modules/products/products.module";
import { ComposerModule } from "./modules/composer/composer.module";
import { ContactsModule } from "./modules/contacts/contacts.module";
import { MessagingModule } from "./modules/messaging/messaging.module";
import { TrackingModule } from "./modules/tracking/tracking.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { ApiInfoModule } from "./modules/api-info/api-info.module";
import { PrismaModule } from "./common/prisma/prisma.module";
import { HealthModule } from "./common/health/health.module";

// Configuration
import { databaseConfig } from "./config/database.config";
import { redisConfig } from "./config/redis.config";
import { appConfig } from "./config/app.config";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
      envFilePath: [".env.local", ".env"],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Bull Queue (Redis)
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Common modules
    PrismaModule,
    HealthModule,

    // Feature modules
    ApiInfoModule,
    ProductsModule,
    ComposerModule,
    ContactsModule,
    MessagingModule,
    TrackingModule,
    SettingsModule,
  ],
  controllers: [AppController, RootController, DocsController],
  providers: [AppService],
})
export class AppModule {}
