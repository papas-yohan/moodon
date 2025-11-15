import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class SendJobMonitorService {
  constructor(private prisma: PrismaService) {}

  // 발송 작업 진행률 조회
  async getJobProgress(jobId: string) {
    const job = await this.prisma.sendJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error("발송 작업을 찾을 수 없습니다.");
    }

    const progress =
      job.recipientCount > 0
        ? Math.round(
            ((job.successCount + job.failCount) / job.recipientCount) * 100,
          )
        : 0;

    return {
      jobId: job.id,
      status: job.status,
      totalCount: job.recipientCount,
      sentCount: job.successCount + job.failCount,
      successCount: job.successCount,
      failedCount: job.failCount,
      progress,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    };
  }

  // 발송 로그 조회 (최근 50개)
  async getJobLogs(jobId: string, limit = 50) {
    const logs = await this.prisma.sendLog.findMany({
      where: { sendJobId: jobId },
      include: {
        contact: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return logs.map((log) => ({
      id: log.id,
      sendJobId: log.sendJobId,
      contactId: log.contactId,
      contactName: log.contact?.name || "알 수 없음",
      phone: log.contact?.phone || "",
      status: log.status,
      channel: log.channel,
      errorMessage: log.errorMessage,
      errorCode: log.errorCode,
      sentAt: log.sentAt,
      createdAt: log.createdAt,
    }));
  }

  // 발송 작업 일시정지
  async pauseJob(jobId: string) {
    const job = await this.prisma.sendJob.update({
      where: { id: jobId },
      data: { status: "PAUSED" },
    });

    return { success: true, message: "발송 작업이 일시정지되었습니다." };
  }

  // 발송 작업 재개
  async resumeJob(jobId: string) {
    const job = await this.prisma.sendJob.update({
      where: { id: jobId },
      data: { status: "PROCESSING" },
    });

    return { success: true, message: "발송 작업이 재개되었습니다." };
  }

  // 실시간 통계 (모든 진행 중인 작업)
  async getLiveStats() {
    const activeJobs = await this.prisma.sendJob.findMany({
      where: {
        status: {
          in: ["PENDING", "PROCESSING", "PAUSED"],
        },
      },
      select: {
        id: true,
        status: true,
        recipientCount: true,
        successCount: true,
        failCount: true,
        startedAt: true,
      },
    });

    return activeJobs.map((job) => ({
      jobId: job.id,
      status: job.status,
      progress:
        job.recipientCount > 0
          ? Math.round(
              ((job.successCount + job.failCount) / job.recipientCount) * 100,
            )
          : 0,
      totalCount: job.recipientCount,
      sentCount: job.successCount + job.failCount,
    }));
  }
}
