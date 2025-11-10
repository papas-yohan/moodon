import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    };
  }

  async detailedCheck() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkMemory(),
    ]);

    const database = checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy';
    const redis = checks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy';
    const memory = checks[2].status === 'fulfilled' ? checks[2].value : 'unhealthy';

    const overallStatus = database === 'healthy' && redis === 'healthy' ? 'healthy' : 'unhealthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      checks: {
        database,
        redis,
        memory,
      },
      details: {
        database: checks[0].status === 'rejected' ? checks[0].reason?.message : 'Connected',
        redis: checks[1].status === 'rejected' ? checks[1].reason?.message : 'Connected',
      },
    };
  }

  private async checkDatabase(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }

  private async checkRedis(): Promise<void> {
    // Redis check will be implemented when we add Redis service
    // For now, just resolve
    return Promise.resolve();
  }

  private checkMemory() {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    };

    return {
      status: memUsageMB.heapUsed < 500 ? 'healthy' : 'warning', // 500MB threshold
      usage: memUsageMB,
    };
  }
}