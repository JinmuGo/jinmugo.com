import Redis, { type Redis as RedisType } from "ioredis";
import { logger } from "./logger";

// Redis 클라이언트 타입
export type RedisClient = RedisType;

// Redis 클라이언트 인스턴스
let redisClient: RedisClient | null = null;

// Redis 클라이언트 초기화
export const initRedis = async (): Promise<RedisClient> => {
  if (redisClient) {
    return redisClient;
  }

  // Docker Compose 환경에서는 직접 호스트와 포트 사용
  const host = process.env.REDIS_HOST || "localhost";
  const port = parseInt(process.env.REDIS_PORT || "6379");
  const password = process.env.REDIS_PASSWORD || undefined;
  const db = parseInt(process.env.REDIS_DB || "0");

  logger.info("🔗 Redis 연결 설정:", { host, port, db });

  // Redis 클라이언트 생성 (최소한의 설정)
  redisClient = new Redis({
    host,
    port,
    password,
    db,
  });

  // 연결 이벤트 핸들러
  redisClient.on("connect", () => {
    logger.info("🔴 Redis 연결 중...");
  });

  redisClient.on("ready", () => {
    logger.info("✅ Redis 연결 완료");
  });

  redisClient.on("error", (error) => {
    logger.error("❌ Redis 연결 오류:", error);
  });

  redisClient.on("close", () => {
    logger.info("🔴 Redis 연결 종료");
  });

  redisClient.on("reconnecting", () => {
    logger.info("🔄 Redis 재연결 중...");
  });

  // 연결 테스트
  try {
    const result = await redisClient.ping();
    if (result !== "PONG") {
      throw new Error("Redis ping 실패");
    }
    logger.info("✅ Redis ping 성공");
  } catch (error) {
    logger.error("❌ Redis 연결 실패:", error);
    // Redis 연결 실패 시 클라이언트 정리
    if (redisClient) {
      await redisClient.disconnect();
      redisClient = null;
    }
    throw error;
  }

  return redisClient;
};

// Redis 클라이언트 가져오기
export const getRedisClient = async (): Promise<RedisClient> => {
  if (!redisClient) {
    return await initRedis();
  }

  // 연결 상태 확인
  try {
    await redisClient.ping();
    return redisClient;
  } catch (error) {
    logger.warn("Redis 연결 상태 확인 실패, 재연결 시도:", error);
    redisClient = null;
    return await initRedis();
  }
};

// Redis 연결 종료
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
  }
};

// 조회수 캐시 관련 유틸리티
export const getViewCacheKey = (slug: string): string => {
  const prefix = process.env.VIEW_CACHE_PREFIX || "view_count:";
  return `${prefix}${slug}`;
};

export const getViewCacheTTL = (): number => {
  return parseInt(process.env.VIEW_CACHE_TTL || "3600"); // 기본 1시간
};

// 조회수 배치 처리 (ioredis의 파이프라인 활용)
export const batchIncrementViews = async (
  viewUpdates: Array<{ slug: string; count: number }>,
): Promise<void> => {
  const redis = await getRedisClient();
  const pipeline = redis.pipeline();

  viewUpdates.forEach(({ slug, count }) => {
    const cacheKey = getViewCacheKey(slug);
    pipeline.incrby(cacheKey, count);
    pipeline.expire(cacheKey, getViewCacheTTL());
  });

  await pipeline.exec();
};

// 조회수 통계 (ioredis의 스크립팅 활용)
export const getViewStats = async (): Promise<{ totalKeys: number; memoryUsage: string }> => {
  const redis = await getRedisClient();
  const prefix = process.env.VIEW_CACHE_PREFIX || "view_count:";

  const keys = await redis.keys(`${prefix}*`);

  // Redis INFO 명령어로 메모리 사용량 조회
  const info = await redis.info("memory");
  const memoryLines = info.split("\r\n").filter((line) => line.startsWith("used_memory:"));

  const usedMemory = memoryLines.length > 0 ? memoryLines[0].split(":")[1] || "0" : "0";

  return {
    totalKeys: keys.length,
    memoryUsage: `${Math.round(parseInt(usedMemory) / 1024 / 1024)}MB`,
  };
};

// Redis 데이터 구조 최적화를 위한 추가 유틸리티들

// 인기 포스트 조회 (조회수 기준)
export const getPopularPosts = async (
  limit: number = 10,
): Promise<Array<{ slug: string; views: number }>> => {
  const redis = await getRedisClient();
  const prefix = process.env.VIEW_CACHE_PREFIX || "view_count:";

  const keys = await redis.keys(`${prefix}*`);
  const posts: Array<{ slug: string; views: number }> = [];

  for (const key of keys) {
    const value = await redis.get(key);
    if (value) {
      const slug = key.replace(prefix, "");
      posts.push({ slug, views: parseInt(value) });
    }
  }

  return posts.sort((a, b) => b.views - a.views).slice(0, limit);
};

// 전체 조회수 합계
export const getTotalViews = async (): Promise<number> => {
  const redis = await getRedisClient();
  const prefix = process.env.VIEW_CACHE_PREFIX || "view_count:";

  const keys = await redis.keys(`${prefix}*`);
  let total = 0;

  for (const key of keys) {
    const value = await redis.get(key);
    if (value) {
      total += parseInt(value);
    }
  }

  return total;
};

// Redis 메모리 사용량 상세 정보
export const getDetailedMemoryInfo = async (): Promise<{
  usedMemory: string;
  usedMemoryPeak: string;
  totalKeys: number;
  viewKeys: number;
  memoryPerKey: string;
}> => {
  const redis = await getRedisClient();
  const prefix = process.env.VIEW_CACHE_PREFIX || "view_count:";

  const info = await redis.info("memory");
  const keys = await redis.keys(`${prefix}*`);
  const allKeys = await redis.keys("*");

  // Redis INFO 명령어 결과 파싱
  const memoryLines = info
    .split("\r\n")
    .filter((line) => line.startsWith("used_memory:") || line.startsWith("used_memory_peak:"));

  const usedMemory =
    memoryLines.find((line) => line.startsWith("used_memory:"))?.split(":")[1] || "0";
  const usedMemoryPeak =
    memoryLines.find((line) => line.startsWith("used_memory_peak:"))?.split(":")[1] || "0";

  const memoryPerKey =
    keys.length > 0 ? `${Math.round(parseInt(usedMemory) / keys.length)} bytes` : "0 bytes";

  return {
    usedMemory: `${Math.round(parseInt(usedMemory) / 1024 / 1024)}MB`,
    usedMemoryPeak: `${Math.round(parseInt(usedMemoryPeak) / 1024 / 1024)}MB`,
    totalKeys: allKeys.length,
    viewKeys: keys.length,
    memoryPerKey,
  };
};

// Redis 데이터 백업 (JSON 형태로)
export const backupViewData = async (): Promise<
  Array<{ slug: string; views: number; ttl: number }>
> => {
  const redis = await getRedisClient();
  const prefix = process.env.VIEW_CACHE_PREFIX || "view_count:";

  const keys = await redis.keys(`${prefix}*`);
  const backup: Array<{ slug: string; views: number; ttl: number }> = [];

  for (const key of keys) {
    const value = await redis.get(key);
    const ttl = await redis.ttl(key);

    if (value) {
      const slug = key.replace(prefix, "");
      backup.push({
        slug,
        views: parseInt(value),
        ttl: ttl > 0 ? ttl : -1, // -1은 영구 저장을 의미
      });
    }
  }

  return backup;
};

// Redis 데이터 복원
export const restoreViewData = async (
  backupData: Array<{ slug: string; views: number; ttl?: number }>,
): Promise<void> => {
  const redis = await getRedisClient();
  const pipeline = redis.pipeline();

  for (const data of backupData) {
    const cacheKey = getViewCacheKey(data.slug);
    const ttl = data.ttl || getViewCacheTTL();

    if (ttl > 0) {
      pipeline.setex(cacheKey, ttl, data.views.toString());
    } else {
      pipeline.set(cacheKey, data.views.toString());
    }
  }

  await pipeline.exec();
};

// Redis 데이터 정리 (TTL이 만료된 키 제거)
export const cleanupExpiredKeys = async (): Promise<number> => {
  const redis = await getRedisClient();
  const prefix = process.env.VIEW_CACHE_PREFIX || "view_count:";

  const keys = await redis.keys(`${prefix}*`);
  let cleanedCount = 0;

  for (const key of keys) {
    const ttl = await redis.ttl(key);
    if (ttl === -2) {
      // 키가 존재하지 않음
      cleanedCount++;
    }
  }

  return cleanedCount;
};
