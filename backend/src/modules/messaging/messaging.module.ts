import { Module } from "@nestjs/common";
import { MessagingService } from "./messaging.service";
import { MessagingController } from "./messaging.controller";
import { MessageTemplateService } from "./message-template.service";
import { SendJobMonitorService } from "./send-job-monitor.service";
import { SolapiAdapter } from "./adapters/solapi.adapter";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { TrackingModule } from "../tracking/tracking.module";
import { SettingsModule } from "../settings/settings.module";

@Module({
  imports: [PrismaModule, TrackingModule, SettingsModule],
  controllers: [MessagingController],
  providers: [
    MessagingService,
    MessageTemplateService,
    SendJobMonitorService,
    SolapiAdapter,
  ],
  exports: [MessagingService, MessageTemplateService, SendJobMonitorService],
})
export class MessagingModule {}
