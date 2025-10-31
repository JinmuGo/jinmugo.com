#!/usr/bin/env tsx

/**
 * 마이그레이션 검증 스크립트
 * PocketBase와 Redis의 데이터 일치성을 확인
 */

import { config } from "dotenv";
import { createScriptLogger } from "../src/lib/logger";
import { authenticatePocketBase, COLLECTIONS, pb } from "../src/lib/pocketbase";
import { closeRedis, getRedisClient } from "../src/lib/redis";

// 환경변수 로드
config();

interface ValidationResult {
  pocketbaseCount: number;
  redisCount: number;
  mismatches: Array<{
    slug: string;
    pocketbaseViews: number;
    redisViews: number;
  }>;
  missingInRedis: string[];
  missingInPocketBase: string[];
}

class MigrationValidator {
  private logger = createScriptLogger();

  /**
   * 마이그레이션 검증 실행
   */
  async validate(): Promise<ValidationResult> {
    this.logger.info("🔍 마이그레이션 검증 시작");
    this.logger.info("=".repeat(50));

    const result: ValidationResult = {
      pocketbaseCount: 0,
      redisCount: 0,
      mismatches: [],
      missingInRedis: [],
      missingInPocketBase: [],
    };

    try {
      // 0. PocketBase 인증
      await authenticatePocketBase();

      // 1. PocketBase 데이터 조회
      const pocketbaseData = await this.fetchPocketBaseData();
      result.pocketbaseCount = pocketbaseData.length;

      // 2. Redis 데이터 조회
      const redisData = await this.fetchRedisData();
      result.redisCount = redisData.size;

      // 3. 데이터 비교
      await this.compareData(pocketbaseData, redisData, result);

      // 4. 결과 출력
      this.printValidationResults(result);

      return result;
    } catch (error) {
      this.logger.error("❌ 검증 실패:", error);
      throw error;
    } finally {
      await closeRedis();
    }
  }

  /**
   * PocketBase에서 조회수 데이터 조회
   */
  private async fetchPocketBaseData(): Promise<Array<{ slug: string; views: number }>> {
    this.logger.info("📊 PocketBase 데이터 조회 중...");

    // 모든 포스트와 조회수 조회
    const posts = await pb.collection(COLLECTIONS.POSTS).getList(1, 1000, {
      fields: "id,slug",
    });

    const data: Array<{ slug: string; views: number }> = [];

    for (const post of posts.items) {
      try {
        // 각 포스트의 조회수 조회
        const viewsResult = await pb.collection(COLLECTIONS.POST_VIEWS).getList(1, 1, {
          filter: `post_id = "${post.id}"`,
          fields: "count",
        });

        const views = viewsResult.items.length > 0 ? viewsResult.items[0].count || 0 : 0;
        data.push({ slug: post.slug, views });
      } catch (error) {
        this.logger.warn(`⚠️  포스트 ${post.slug} 조회 실패:`, error);
        data.push({ slug: post.slug, views: 0 });
      }
    }

    this.logger.info(`✅ PocketBase에서 ${data.length}개 포스트 조회 완료`);
    return data;
  }

  /**
   * Redis에서 조회수 데이터 조회
   */
  private async fetchRedisData(): Promise<Map<string, number>> {
    this.logger.info("📊 Redis 데이터 조회 중...");

    const redis = await getRedisClient();
    const prefix = process.env.VIEW_CACHE_PREFIX || "view_count:";
    const keys = await redis.keys(`${prefix}*`);

    const data = new Map<string, number>();

    for (const key of keys) {
      try {
        const value = await redis.get(key);
        if (value) {
          const slug = key.replace(prefix, "");
          data.set(slug, parseInt(value));
        }
      } catch (error) {
        this.logger.warn(`⚠️  Redis 키 ${key} 조회 실패:`, error);
      }
    }

    this.logger.info(`✅ Redis에서 ${data.size}개 조회수 키 조회 완료`);
    return data;
  }

  /**
   * PocketBase와 Redis 데이터 비교
   */
  private async compareData(
    pocketbaseData: Array<{ slug: string; views: number }>,
    redisData: Map<string, number>,
    result: ValidationResult,
  ): Promise<void> {
    this.logger.info("🔄 데이터 비교 중...");

    // PocketBase 데이터를 Map으로 변환
    const pbMap = new Map<string, number>();
    pocketbaseData.forEach((item) => {
      pbMap.set(item.slug, item.views);
    });

    // Redis에 있지만 PocketBase에 없는 데이터
    for (const [slug] of redisData) {
      if (!pbMap.has(slug)) {
        result.missingInPocketBase.push(slug);
      }
    }

    // PocketBase에 있지만 Redis에 없는 데이터, 또는 값이 다른 데이터
    for (const [slug, pbViews] of pbMap) {
      const redisViews = redisData.get(slug);

      if (redisViews === undefined) {
        result.missingInRedis.push(slug);
      } else if (pbViews !== redisViews) {
        result.mismatches.push({
          slug,
          pocketbaseViews: pbViews,
          redisViews,
        });
      }
    }
  }

  /**
   * 검증 결과 출력
   */
  private printValidationResults(result: ValidationResult): void {
    this.logger.info(`\n${"=".repeat(50)}`);
    this.logger.info("📊 검증 결과");
    this.logger.info("=".repeat(50));
    this.logger.info(`📝 PocketBase 포스트 수: ${result.pocketbaseCount}개`);
    this.logger.info(`📝 Redis 조회수 키 수: ${result.redisCount}개`);
    this.logger.info(`❌ Redis에 없는 포스트: ${result.missingInRedis.length}개`);
    this.logger.info(`❌ PocketBase에 없는 Redis 키: ${result.missingInPocketBase.length}개`);
    this.logger.info(`⚠️  값이 다른 포스트: ${result.mismatches.length}개`);

    // 상세 불일치 정보 출력
    if (result.mismatches.length > 0) {
      this.logger.info("\n🔍 값이 다른 포스트 상세:");
      result.mismatches.slice(0, 10).forEach((mismatch) => {
        this.logger.info(
          `  ${mismatch.slug}: PB=${mismatch.pocketbaseViews}, Redis=${mismatch.redisViews}`,
        );
      });
      if (result.mismatches.length > 10) {
        this.logger.info(`  ... 및 ${result.mismatches.length - 10}개 더`);
      }
    }

    // Redis에 없는 포스트 상세
    if (result.missingInRedis.length > 0) {
      this.logger.info("\n🔍 Redis에 없는 포스트:");
      result.missingInRedis.slice(0, 10).forEach((slug) => {
        this.logger.info(`  ${slug}`);
      });
      if (result.missingInRedis.length > 10) {
        this.logger.info(`  ... 및 ${result.missingInRedis.length - 10}개 더`);
      }
    }

    // 검증 성공 여부 판단
    const isSuccess =
      result.missingInRedis.length === 0 &&
      result.missingInPocketBase.length === 0 &&
      result.mismatches.length === 0;

    if (isSuccess) {
      this.logger.info("\n🎉 마이그레이션이 완벽하게 완료되었습니다!");
    } else {
      this.logger.warn("\n⚠️  마이그레이션에 문제가 있습니다. 위의 불일치 사항을 확인해주세요.");
    }
  }
}

// 스크립트 실행
async function main() {
  const validator = new MigrationValidator();

  try {
    await validator.validate();
  } catch (error) {
    this.logger.error("\n💥 검증 실패:", error);
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main();
}

export { MigrationValidator };
