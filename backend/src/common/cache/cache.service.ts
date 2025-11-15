import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, { data: any; expiry: number }>();

  constructor(private configService: ConfigService) {}

  /**
   * 캐시에 데이터 저장
   */
  set(key: string, data: any, ttlSeconds: number = 300): void {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiry });
    this.logger.debug(`Cache set: ${key} (TTL: ${ttlSeconds}s)`);
  }

  /**
   * 캐시에서 데이터 조회
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // 만료 확인
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired: ${key}`);
      return null;
    }

    this.logger.debug(`Cache hit: ${key}`);
    return cached.data as T;
  }

  /**
   * 캐시에서 데이터 삭제
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Cache deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * 패턴으로 캐시 삭제
   */
  deletePattern(pattern: string): number {
    let deletedCount = 0;
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    this.logger.debug(
      `Cache pattern deleted: ${pattern} (${deletedCount} keys)`,
    );
    return deletedCount;
  }

  /**
   * 만료된 캐시 정리
   */
  cleanup(): number {
    let cleanedCount = 0;
    const now = Date.now();

    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiry) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cache cleanup: ${cleanedCount} expired keys removed`);
    }

    return cleanedCount;
  }

  /**
   * 캐시 통계
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * 전체 캐시 클리어
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.debug(`Cache cleared: ${size} keys removed`);
  }
}

/**
 * 캐시 키 생성 헬퍼
 */
export class CacheKeyBuilder {
  static products(filters: any): string {
    const { page, limit, search, category, status, sort } = filters;
    return `products:${page}:${limit}:${search || ""}:${category || ""}:${status || ""}:${sort || ""}`;
  }

  static product(id: string): string {
    return `product:${id}`;
  }

  static contacts(filters: any): string {
    const { page, limit, search, groupName } = filters;
    return `contacts:${page}:${limit}:${search || ""}:${groupName || ""}`;
  }

  static analytics(type: string, params: any): string {
    const paramStr = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(":");
    return `analytics:${type}:${paramStr}`;
  }
}
