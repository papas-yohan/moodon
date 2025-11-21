import { Module } from "@nestjs/common";
import { MessagingService } from "./messaging.service";
import { MessagingController } from "./messaging.controller";
import { MessageTemplateService } from "./message-template.service";
import { SendJobMonitorService } from "./send-job-monitor.service";
import { AligoAdapter } from "./adapters/aligo.adapter";
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
    AligoAdapter,
  ],
  exports: [MessagingService, MessageTemplateService, SendJobMonitorService],
})
export class MessagingModule {}
