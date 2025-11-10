import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ImageComposerService } from './image-composer.service';
import { CreateComposeJobDto } from './dto';
import { ComposeJob } from './entities/compose-job.entity';

@Injectable()
export class ComposerService {
  private readonly logger = new Logger(ComposerService.name);

  constructor(
    private prisma: PrismaService,
    private imageComposer: ImageComposerService,
  ) {}

  async createComposeJob(createDto: CreateComposeJobDto): Promise<ComposeJob> {
    try {
      // 상품 존재 확인 및 이미지 조회
      const product = await this.prisma.product.findUnique({
        where: { id: createDto.productId },
        include: {
          images: {
            orderBy: { sequence: 'asc' },
          },
        },
      });

      if (!product) {
        throw new NotFoundException('상품을 찾을 수 없습니다.');
      }

      if (product.images.length === 0) {
        throw new BadRequestException('합성할 이미지가 없습니다.');
      }

      // 합성 작업 생성
      const composeJob = await this.prisma.composeJob.create({
        data: {
          productId: createDto.productId,
          templateType: createDto.templateType || 'grid',
          status: 'PENDING',
        },
      });

      // 비동기로 합성 작업 시작
      this.processComposeJob(composeJob.id).catch((error) => {
        this.logger.error(`Compose job ${composeJob.id} failed`, error);
      });

      return composeJob as ComposeJob;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('합성 작업 생성에 실패했습니다.');
    }
  }

  async findAll(productId?: string) {
    try {
      const where = productId ? { productId } : {};
      
      const jobs = await this.prisma.composeJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return jobs;
    } catch (error) {
      throw new BadRequestException('합성 작업 목록 조회에 실패했습니다.');
    }
  }

  async findOne(id: string): Promise<ComposeJob> {
    try {
      const job = await this.prisma.composeJob.findUnique({
        where: { id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!job) {
        throw new NotFoundException('합성 작업을 찾을 수 없습니다.');
      }

      return job as ComposeJob;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('합성 작업 조회에 실패했습니다.');
    }
  }

  async retryComposeJob(id: string): Promise<ComposeJob> {
    try {
      const job = await this.findOne(id);

      if (job.status === 'PROCESSING') {
        throw new BadRequestException('이미 처리 중인 작업입니다.');
      }

      if (job.retryCount >= 3) {
        throw new BadRequestException('최대 재시도 횟수를 초과했습니다.');
      }

      // 재시도 카운트 증가 및 상태 초기화
      const updatedJob = await this.prisma.composeJob.update({
        where: { id },
        data: {
          status: 'PENDING',
          retryCount: { increment: 1 },
          errorMessage: null,
          startedAt: null,
          completedAt: null,
        },
      });

      // 비동기로 합성 작업 재시작
      this.processComposeJob(id).catch((error) => {
        this.logger.error(`Compose job retry ${id} failed`, error);
      });

      return updatedJob as ComposeJob;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('합성 작업 재시도에 실패했습니다.');
    }
  }

  private async processComposeJob(jobId: string): Promise<void> {
    try {
      this.logger.log(`Processing compose job: ${jobId}`);

      // 작업 시작 상태로 업데이트
      await this.prisma.composeJob.update({
        where: { id: jobId },
        data: {
          status: 'PROCESSING',
          startedAt: new Date(),
        },
      });

      // 작업 정보 조회
      const job = await this.prisma.composeJob.findUnique({
        where: { id: jobId },
        include: {
          product: {
            include: {
              images: {
                orderBy: { sequence: 'asc' },
              },
            },
          },
        },
      });

      if (!job || !job.product) {
        throw new Error('Job or product not found');
      }

      // 이미지 합성 실행
      const imageInputs = job.product.images.map((img) => ({
        url: img.imageUrl,
        sequence: img.sequence,
      }));

      const resultUrl = await this.imageComposer.composeImages(imageInputs, {
        templateType: job.templateType as 'grid' | 'highlight' | 'simple',
        productInfo: {
          name: job.product.name,
          description: job.product.description,
          price: job.product.price,
          size: job.product.size,
          color: job.product.color,
          marketLink: job.product.marketLink,
        },
      });

      // 작업 완료 상태로 업데이트
      await this.prisma.composeJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          resultUrl,
          completedAt: new Date(),
        },
      });

      // 상품의 composedImageUrl 업데이트
      await this.prisma.product.update({
        where: { id: job.productId },
        data: {
          composedImageUrl: resultUrl,
          status: 'READY',
        },
      });

      this.logger.log(`Compose job completed: ${jobId}`);
    } catch (error) {
      this.logger.error(`Compose job failed: ${jobId}`, error);

      // 실패 상태로 업데이트
      await this.prisma.composeJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });
    }
  }

  async getJobStats() {
    try {
      const [total, pending, processing, completed, failed] = await Promise.all([
        this.prisma.composeJob.count(),
        this.prisma.composeJob.count({ where: { status: 'PENDING' } }),
        this.prisma.composeJob.count({ where: { status: 'PROCESSING' } }),
        this.prisma.composeJob.count({ where: { status: 'COMPLETED' } }),
        this.prisma.composeJob.count({ where: { status: 'FAILED' } }),
      ]);

      return {
        total,
        pending,
        processing,
        completed,
        failed,
      };
    } catch (error) {
      throw new BadRequestException('합성 작업 통계 조회에 실패했습니다.');
    }
  }
}