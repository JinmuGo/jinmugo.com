#!/usr/bin/env tsx

/**
 * PocketBase에서 Redis로 pageView 데이터 마이그레이션 스크립트
 * Cache-Aside 패턴을 적용하여 기존 조회수 데이터를 Redis로 이전
 */

import { config } from "dotenv";
import { createScriptLogger } from "../src/lib/logger";
import {
  authenticatePocketBase,
  type BlogPost,
  COLLECTIONS,
  type PostView,
  pb,
} from "../src/lib/pocketbase";
import {
  closeRedis,
  getRedisClient,
  getViewCacheKey,
  getViewCacheTTL,
  type RedisClient,
} from "../src/lib/redis";

// 환경변수 로드
config();

interface MigrationStats {
  totalPosts: number;
  totalViews: number;
  migratedViews: number;
  errors: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

class PageViewMigration {
  private logger = createScriptLogger();
  private stats: MigrationStats = {
    totalPosts: 0,
    totalViews: 0,
    migratedViews: 0,
    errors: 0,
    startTime: new Date(),
  };

  /**
   * 마이그레이션 실행
   */
  async migrate(): Promise<void> {
    this.logger.info("🚀 PocketBase → Redis pageView 마이그레이션 시작");
    this.logger.info("=".repeat(60));

    try {
      // 0. PocketBase 인증
      await authenticatePocketBase();

      // 1. PocketBase에서 모든 포스트와 조회수 데이터 조회
      const { posts, views } = await this.fetchAllData();

      // 2. Redis 클라이언트 초기화
      const redis = await getRedisClient();

      // 3. 데이터 마이그레이션
      await this.migrateDataToRedis(redis, posts, views);

      // 4. 마이그레이션 결과 출력
      this.printResults();
    } catch (error) {
      this.logger.error("❌ 마이그레이션 실패:", error);
      throw error;
    } finally {
      // Redis 연결 종료
      await closeRedis();
    }
  }

  /**
   * PocketBase에서 모든 데이터 조회
   */
  private async fetchAllData(): Promise<{ posts: BlogPost[]; views: PostView[] }> {
    this.logger.info("📊 PocketBase에서 데이터 조회 중...");

    // 모든 포스트 조회
    const postsResult = await pb.collection(COLLECTIONS.POSTS).getList(1, 1000, {
      fields: "id,slug,type,created,updated",
    });
    const posts = postsResult.items as unknown as BlogPost[];

    // 모든 조회수 데이터 조회
    const viewsResult = await pb.collection(COLLECTIONS.POST_VIEWS).getList(1, 1000, {
      fields: "id,post_id,count,created,updated",
    });
    const views = viewsResult.items as unknown as PostView[];

    this.stats.totalPosts = posts.length;
    this.stats.totalViews = views.length;

    this.logger.info(`✅ 포스트 ${posts.length}개, 조회수 기록 ${views.length}개 조회 완료`);
    return { posts, views };
  }

  /**
   * Redis로 데이터 마이그레이션
   */
  private async migrateDataToRedis(
    redis: unknown,
    posts: BlogPost[],
    views: PostView[],
  ): Promise<void> {
    this.logger.info("🔄 Redis로 데이터 마이그레이션 중...");

    const ttl = getViewCacheTTL();
    const pipeline = (redis as RedisClient).pipeline();

    // 포스트별로 조회수 매핑
    const viewMap = new Map<string, number>();
    views.forEach((view) => {
      viewMap.set(view.post_id, view.count);
    });

    // 각 포스트에 대해 Redis 키 생성
    for (const post of posts) {
      try {
        const cacheKey = getViewCacheKey(post.slug);
        const viewCount = viewMap.get(post.id) || 0;

        // Redis에 조회수 저장 (TTL 설정)
        pipeline.setex(cacheKey, ttl, viewCount.toString());

        this.stats.migratedViews++;

        if (this.stats.migratedViews % 100 === 0) {
          this.logger.info(`📈 진행률: ${this.stats.migratedViews}/${this.stats.totalPosts}`);
        }
      } catch (error) {
        this.logger.error(`❌ 포스트 ${post.slug} 마이그레이션 실패:`, error);
        this.stats.errors++;
      }
    }

    // 파이프라인 실행
    try {
      await pipeline.exec();
      this.logger.info("✅ Redis 파이프라인 실행 완료");
    } catch (error) {
      this.logger.error("❌ Redis 파이프라인 실행 실패:", error);
      throw error;
    }
  }

  /**
   * 마이그레이션 결과 출력
   */
  private printResults(): void {
    this.stats.endTime = new Date();
    this.stats.duration = this.stats.endTime.getTime() - this.stats.startTime.getTime();

    this.logger.info(`\n${"=".repeat(60)}`);
    this.logger.info("📊 마이그레이션 완료!");
    this.logger.info("=".repeat(60));
    this.logger.info(`📝 총 포스트: ${this.stats.totalPosts}개`);
    this.logger.info(`👀 총 조회수 기록: ${this.stats.totalViews}개`);
    this.logger.info(`✅ 마이그레이션된 조회수: ${this.stats.migratedViews}개`);
    this.logger.info(`❌ 오류: ${this.stats.errors}개`);
    this.logger.info(`⏱️  소요 시간: ${this.stats.duration}ms`);
    this.logger.info(
      `📈 성공률: ${((this.stats.migratedViews / this.stats.totalPosts) * 100).toFixed(2)}%`,
    );
  }

  /**
   * 마이그레이션 검증
   */
  async validate(): Promise<void> {
    this.logger.info("\n🔍 마이그레이션 검증 중...");

    const redis = await getRedisClient();
    const prefix = process.env.VIEW_CACHE_PREFIX || "view_count:";

    try {
      // Redis에서 모든 조회수 키 조회
      const keys = await redis.keys(`${prefix}*`);
      this.logger.info(`✅ Redis에 ${keys.length}개의 조회수 키가 저장됨`);

      // 샘플 데이터 검증
      if (keys.length > 0) {
        const sampleKey = keys[0];
        const sampleValue = await redis.get(sampleKey);
        this.logger.info(`📋 샘플 데이터: ${sampleKey} = ${sampleValue}`);
      }
    } catch (error) {
      this.logger.error("❌ 검증 실패:", error);
    }
  }
}

// 스크립트 실행
async function main() {
  const migration = new PageViewMigration();

  try {
    await migration.migrate();
    await migration.validate();
    console.log("\n🎉 마이그레이션이 성공적으로 완료되었습니다!");
  } catch (error) {
    console.error("\n💥 마이그레이션 실패:", error);
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main();
}

export { PageViewMigration };
