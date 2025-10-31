import type { Router } from "express";
import { Router as ExpressRouter } from "express";
import type { RecordModel } from "pocketbase";
import { logger } from "../lib/logger";
import { COLLECTIONS, pb } from "../lib/pocketbase";
import {
  batchIncrementViews,
  getRedisClient,
  getViewCacheKey,
  getViewCacheTTL,
} from "../lib/redis";

export const viewsRouter: Router = ExpressRouter();

// 포스트 조회수 증가 (Cache-Aside 패턴)
viewsRouter.post("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { count = 1 } = req.body; // 증가할 조회수 (기본값 1)

    // Redis 클라이언트 가져오기
    const redis = await getRedisClient();
    const cacheKey = getViewCacheKey(slug);
    const ttl = getViewCacheTTL();

    // 1. 캐시에서 현재 조회수 확인 (현재는 사용하지 않지만 향후 확장 가능)
    try {
      await redis.get(cacheKey);
    } catch (cacheError) {
      logger.warn("📊 캐시 조회 실패, DB에서 조회:", cacheError);
    }

    // 2. DB에서 실제 조회수 조회 (Cache-Aside 패턴)
    const posts = await pb.collection(COLLECTIONS.POSTS).getList(1, 1, {
      filter: `slug = "${slug}"`,
    });

    let post: RecordModel;
    if (posts.items.length === 0) {
      // 포스트가 없으면 기본 정보로 생성
      post = await pb.collection(COLLECTIONS.POSTS).create({
        slug,
        type: "post",
      });
    } else {
      post = posts.items[0];
    }

    // 기존 조회 기록 확인
    const existingViews = await pb.collection(COLLECTIONS.POST_VIEWS).getList(1, 1, {
      filter: `post_id = "${post.id}"`,
    });

    let viewRecord: RecordModel;
    let dbViews = 0;

    if (existingViews.items.length > 0) {
      // 기존 조회수 업데이트
      const existingView = existingViews.items[0];
      dbViews = existingView.count || 0;
      const newCount = dbViews + Number(count);

      viewRecord = await pb.collection(COLLECTIONS.POST_VIEWS).update(existingView.id, {
        count: newCount,
      });
    } else {
      // 새 조회 기록 생성
      viewRecord = await pb.collection(COLLECTIONS.POST_VIEWS).create({
        post_id: post.id,
        count: Number(count),
      });
    }

    // 3. 캐시 업데이트 (새로운 조회수로)
    try {
      await redis.setex(cacheKey, ttl, viewRecord.count.toString());
    } catch (cacheError) {
      logger.warn("📊 캐시 업데이트 실패:", cacheError);
    }

    res.json({
      success: true,
      data: {
        post_id: post.id,
        slug: post.slug,
        views: viewRecord.count,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to increment view",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// 포스트 조회수 조회 (Cache-Aside 패턴)
viewsRouter.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // Redis 클라이언트 가져오기
    const redis = await getRedisClient();
    const cacheKey = getViewCacheKey(slug);
    const ttl = getViewCacheTTL();

    // 1. 캐시에서 조회수 확인 (Cache-Aside 패턴)
    try {
      const cachedViews = await redis.get(cacheKey);
      if (cachedViews) {
        const views = parseInt(cachedViews);
        return res.json({
          success: true,
          data: {
            views,
            slug,
            cached: true, // 캐시에서 가져왔음을 표시
          },
        });
      }
    } catch (cacheError) {
      logger.warn("📊 캐시 조회 실패, DB에서 조회:", cacheError);
    }

    // 2. 캐시에 없으면 DB에서 조회
    const posts = await pb.collection(COLLECTIONS.POSTS).getList(1, 1, {
      filter: `slug = "${slug}"`,
    });

    if (posts.items.length === 0) {
      return res.json({
        success: true,
        data: { views: 0, slug },
      });
    }

    const post = posts.items[0];

    // 조회수 가져오기 (count 필드 사용)
    const viewsResult = await pb.collection(COLLECTIONS.POST_VIEWS).getList(1, 1, {
      filter: `post_id = "${post.id}"`,
      fields: "count",
    });

    const views = viewsResult.items.length > 0 ? viewsResult.items[0].count || 0 : 0;

    // 3. DB에서 가져온 데이터를 캐시에 저장
    try {
      await redis.setex(cacheKey, ttl, views.toString());
    } catch (cacheError) {
      logger.warn("📊 캐시 저장 실패:", cacheError);
    }

    res.json({
      success: true,
      data: {
        views,
        slug: post.slug,
        cached: false, // DB에서 가져왔음을 표시
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch views",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// 조회수 배치 증가 (Cache-Aside 패턴)
viewsRouter.post("/batch", async (req, res) => {
  try {
    const { updates } = req.body; // [{ slug: string, count: number }] 형태의 배열

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        error: "Invalid request",
        details: "updates must be a non-empty array",
      });
    }

    // 유효성 검사
    for (const update of updates) {
      if (!update.slug || typeof update.count !== "number" || update.count <= 0) {
        return res.status(400).json({
          error: "Invalid update format",
          details: "Each update must have slug (string) and count (positive number)",
        });
      }
    }

    // Redis 배치 처리
    await batchIncrementViews(updates);

    // PocketBase 업데이트 (비동기 처리)
    const updatePromises = updates.map(async ({ slug, count }) => {
      try {
        // 포스트 조회 또는 생성
        const posts = await pb.collection(COLLECTIONS.POSTS).getList(1, 1, {
          filter: `slug = "${slug}"`,
        });

        let post: RecordModel;
        if (posts.items.length === 0) {
          post = await pb.collection(COLLECTIONS.POSTS).create({
            slug,
            type: "post",
          });
        } else {
          post = posts.items[0];
        }

        // 조회수 업데이트
        const existingViews = await pb.collection(COLLECTIONS.POST_VIEWS).getList(1, 1, {
          filter: `post_id = "${post.id}"`,
        });

        if (existingViews.items.length > 0) {
          const existingView = existingViews.items[0];
          const newCount = (existingView.count || 0) + count;
          await pb.collection(COLLECTIONS.POST_VIEWS).update(existingView.id, {
            count: newCount,
          });
        } else {
          await pb.collection(COLLECTIONS.POST_VIEWS).create({
            post_id: post.id,
            count: count,
          });
        }
      } catch (error) {
        logger.error(`❌ 포스트 ${slug} 업데이트 실패:`, error);
        // 개별 실패는 로그만 남기고 계속 진행
      }
    });

    // PocketBase 업데이트는 백그라운드에서 처리
    Promise.all(updatePromises).catch((error) => {
      logger.error("📊 배치 PocketBase 업데이트 실패:", error);
    });

    res.json({
      success: true,
      data: {
        processed: updates.length,
        message: "Batch update initiated",
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to process batch update",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
