import { Module } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { TrackingCodeService } from './tracking-code.service';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TrackingController],
  providers: [TrackingService, TrackingCodeService, AnalyticsService],
  exports: [TrackingService, TrackingCodeService, AnalyticsService],
})
export class TrackingModule {}