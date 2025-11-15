import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import {
  MessageTemplateService,
  ProductInfo,
  ContactInfo,
} from "./message-template.service";
import { SolapiAdapter } from "./adapters/solapi.adapter";
import { CreateSendJobDto, QuerySendJobDto } from "./dto";
import { SendJob, SendLog } from "./entities";

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    private prisma: PrismaService,
    private messageTemplate: MessageTemplateService,
    private solapiAdapter: SolapiAdapter,
  ) {}

  async createSendJob(createDto: CreateSendJobDto): Promise<SendJob> {
    try {
      // 상품 존재 확인
      const products = await this.prisma.product.findMany({
        where: { id: { in: createDto.productIds } },
        include: { images: { take: 1, orderBy: { sequence: "asc" } } },
      });

      if (products.length !== createDto.productIds.length) {
        throw new BadRequestException("일부 상품을 찾을 수 없습니다.");
      }

      // 연락처 존재 확인
      const contacts = await this.prisma.contact.findMany({
        where: {
          id: { in: createDto.contactIds },
          isActive: true,
        },
      });

      if (contacts.length === 0) {
        throw new BadRequestException("활성화된 연락처가 없습니다.");
      }

      // 발송 작업 생성
      const sendJob = await this.prisma.sendJob.create({
        data: {
          productIds: JSON.stringify(createDto.productIds),
          channel: createDto.channel,
          recipientCount: contacts.length,
          status: "PENDING",
          scheduledAt: createDto.scheduledAt
            ? new Date(createDto.scheduledAt)
            : null,
        },
      });

      // 발송 로그 생성 (각 연락처별, 채널별)
      const sendLogs = [];

      for (const contact of contacts) {
        for (const product of products) {
          const channels = this.getChannelsToSend(createDto.channel, contact);

          for (const channel of channels) {
            sendLogs.push({
              sendJobId: sendJob.id,
              productId: product.id,
              contactId: contact.id,
              channel,
              status: "PENDING",
            });
          }
        }
      }

      await this.prisma.sendLog.createMany({
        data: sendLogs,
      });

      // 비동기로 발송 처리 시작
      if (
        !createDto.scheduledAt ||
        new Date(createDto.scheduledAt) <= new Date()
      ) {
        this.processSendJob(sendJob.id, createDto.customMessage).catch(
          (error) => {
            this.logger.error(`Send job ${sendJob.id} failed`, error);
          },
        );
      }

      return sendJob as SendJob;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("발송 작업 생성에 실패했습니다.");
    }
  }

  async findAll(queryDto: QuerySendJobDto) {
    const {
      page = 1,
      limit = 20,
      status,
      channel,
      sort = "createdAt:desc",
    } = queryDto;
    const skip = (page - 1) * limit;

    // 정렬 파싱
    const [sortField, sortOrder] = sort.split(":");
    const orderBy = { [sortField]: sortOrder || "desc" };

    // 검색 조건 구성
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (channel) {
      where.channel = channel;
    }

    try {
      const [sendJobs, total] = await Promise.all([
        this.prisma.sendJob.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        this.prisma.sendJob.count({ where }),
      ]);

      return {
        data: sendJobs as SendJob[],
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException("발송 작업 목록 조회에 실패했습니다.");
    }
  }

  async findOne(id: string): Promise<SendJob> {
    try {
      const sendJob = await this.prisma.sendJob.findUnique({
        where: { id },
      });

      if (!sendJob) {
        throw new NotFoundException("발송 작업을 찾을 수 없습니다.");
      }

      return sendJob as SendJob;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException("발송 작업 조회에 실패했습니다.");
    }
  }

  async getSendLogs(sendJobId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    try {
      const [logs, total] = await Promise.all([
        this.prisma.sendLog.findMany({
          where: { sendJobId },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            product: {
              select: { id: true, name: true },
            },
            contact: {
              select: { id: true, name: true, phone: true },
            },
          },
        }),
        this.prisma.sendLog.count({ where: { sendJobId } }),
      ]);

      return {
        data: logs as SendLog[],
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException("발송 로그 조회에 실패했습니다.");
    }
  }

  async getStats() {
    try {
      const [
        totalJobs,
        pendingJobs,
        processingJobs,
        completedJobs,
        failedJobs,
      ] = await Promise.all([
        this.prisma.sendJob.count(),
        this.prisma.sendJob.count({ where: { status: "PENDING" } }),
        this.prisma.sendJob.count({ where: { status: "PROCESSING" } }),
        this.prisma.sendJob.count({ where: { status: "COMPLETED" } }),
        this.prisma.sendJob.count({ where: { status: "FAILED" } }),
      ]);

      const [totalMessages, successMessages, failedMessages] =
        await Promise.all([
          this.prisma.sendLog.count(),
          this.prisma.sendLog.count({ where: { status: "SUCCESS" } }),
          this.prisma.sendLog.count({ where: { status: "FAILED" } }),
        ]);

      return {
        jobs: {
          total: totalJobs,
          pending: pendingJobs,
          processing: processingJobs,
          completed: completedJobs,
          failed: failedJobs,
        },
        messages: {
          total: totalMessages,
          success: successMessages,
          failed: failedMessages,
          successRate:
            totalMessages > 0
              ? ((successMessages / totalMessages) * 100).toFixed(2)
              : "0.00",
        },
      };
    } catch (error) {
      throw new BadRequestException("발송 통계 조회에 실패했습니다.");
    }
  }

  private async processSendJob(
    sendJobId: string,
    customMessage?: string,
  ): Promise<void> {
    try {
      this.logger.log(`Processing send job: ${sendJobId}`);

      // 작업 시작 상태로 업데이트
      await this.prisma.sendJob.update({
        where: { id: sendJobId },
        data: {
          status: "PROCESSING",
          startedAt: new Date(),
        },
      });

      // 발송 로그 조회
      const sendLogs = await this.prisma.sendLog.findMany({
        where: {
          sendJobId,
          status: "PENDING",
        },
        include: {
          product: true,
          contact: true,
        },
      });

      if (sendLogs.length === 0) {
        await this.prisma.sendJob.update({
          where: { id: sendJobId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });
        return;
      }

      // 상품별로 그룹화
      const productGroups = this.groupLogsByProduct(sendLogs);

      let successCount = 0;
      let failCount = 0;

      // 각 그룹별로 발송 처리
      for (const [productId, logs] of Object.entries(productGroups)) {
        const product = logs[0].product;
        const productInfo: ProductInfo = {
          id: product.id,
          name: product.name,
          price: product.price,
          size: product.size,
          color: product.color,
          marketLink: product.marketLink,
          composedImageUrl: product.composedImageUrl,
        };

        // 연락처별로 메시지 발송
        for (const log of logs) {
          const contactInfo: ContactInfo = {
            id: log.contact.id,
            name: log.contact.name,
            phone: log.contact.phone,
            kakaoId: log.contact.kakaoId,
          };

          try {
            await this.sendMessage(
              log.id,
              [productInfo],
              contactInfo,
              log.channel,
              customMessage,
            );
            successCount++;
          } catch (error) {
            this.logger.error(
              `Failed to send message to ${log.contact.phone}`,
              error,
            );
            failCount++;
          }

          // Rate limiting: 초당 10건으로 제한
          await this.sleep(100);
        }
      }

      // 작업 완료 상태로 업데이트
      await this.prisma.sendJob.update({
        where: { id: sendJobId },
        data: {
          status: successCount > 0 ? "COMPLETED" : "FAILED",
          successCount,
          failCount,
          completedAt: new Date(),
        },
      });

      this.logger.log(
        `Send job completed: ${sendJobId}, success: ${successCount}, failed: ${failCount}`,
      );
    } catch (error) {
      this.logger.error(`Send job failed: ${sendJobId}`, error);

      await this.prisma.sendJob.update({
        where: { id: sendJobId },
        data: {
          status: "FAILED",
          completedAt: new Date(),
        },
      });
    }
  }

  private async sendMessage(
    logId: string,
    products: ProductInfo[],
    contact: ContactInfo,
    channel: string,
    customMessage?: string,
  ): Promise<void> {
    try {
      // 메시지 템플릿 생성
      const messageTemplate = this.messageTemplate.generateMessage(
        products,
        contact,
        customMessage,
      );

      // 실제 솔라피 API 호출
      let result;

      if (channel === "SMS") {
        // 합성된 이미지가 있으면 MMS로 발송, 없으면 SMS/LMS
        const composedImageUrl = products[0]?.composedImageUrl;

        if (composedImageUrl) {
          // MMS 발송 (이미지 첨부)
          this.logger.log(`Sending MMS with image: ${composedImageUrl}`);
          result = await this.solapiAdapter.sendMMS({
            to: contact.phone,
            text: messageTemplate.sms,
            imageUrl: composedImageUrl,
          });
        } else {
          // 이미지가 없으면 SMS/LMS로 발송
          const textLength = messageTemplate.sms.length;

          if (textLength <= 90) {
            // 단문 SMS
            result = await this.solapiAdapter.sendSMS({
              to: contact.phone,
              text: messageTemplate.sms,
            });
          } else {
            // 장문 LMS
            result = await this.solapiAdapter.sendLMS({
              to: contact.phone,
              text: messageTemplate.sms,
            });
          }
        }
      } else if (channel === "KAKAO") {
        // 카카오톡 발송 (알림톡 또는 친구톡)
        result = await this.solapiAdapter.sendKakaoAlimtalk({
          to: contact.phone,
          text: messageTemplate.kakao.message,
          trackingUrl:
            messageTemplate.kakao.buttonUrl ||
            products[0]?.marketLink ||
            undefined,
          templateCode: messageTemplate.kakao.templateCode,
        });
      } else {
        throw new Error(`Unsupported channel: ${channel}`);
      }

      if (result.status === "success") {
        this.logger.log(
          `Message sent successfully to ${contact.phone}: ${result.messageId}`,
        );

        await this.prisma.sendLog.update({
          where: { id: logId },
          data: {
            status: "SUCCESS",
            sentAt: new Date(),
            externalMessageId: result.messageId,
          },
        });
      } else {
        throw new Error(result.errorMessage || "Message send failed");
      }
    } catch (error) {
      this.logger.error(`Failed to send message to ${contact.phone}:`, error);

      await this.prisma.sendLog.update({
        where: { id: logId },
        data: {
          status: "FAILED",
          errorCode: error.code || "UNKNOWN_ERROR",
          errorMessage: error.message,
        },
      });
      throw error;
    }
  }

  private getChannelsToSend(requestedChannel: string, contact: any): string[] {
    const channels = [];

    if (requestedChannel === "SMS" || requestedChannel === "BOTH") {
      channels.push("SMS");
    }

    if (
      (requestedChannel === "KAKAO" || requestedChannel === "BOTH") &&
      contact.kakaoId
    ) {
      channels.push("KAKAO");
    }

    return channels;
  }

  private groupLogsByProduct(logs: any[]): Record<string, any[]> {
    return logs.reduce((groups, log) => {
      const productId = log.productId;
      if (!groups[productId]) {
        groups[productId] = [];
      }
      groups[productId].push(log);
      return groups;
    }, {});
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
