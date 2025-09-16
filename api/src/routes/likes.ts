import type { Router } from "express";
import { Router as ExpressRouter } from "express";
import { COLLECTIONS, pb } from "../lib/pocketbase";

export const likesRouter: Router = ExpressRouter();

// 포스트에 좋아요 추가
likesRouter.post("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { count = 1 } = req.body;
    const clientIP = req.headers.x_forwarded_for || req.headers.origin || req.ip;

    // 포스트 존재 확인
    const posts = await pb.collection(COLLECTIONS.POSTS).getList(1, 1, {
      filter: `slug = "${slug}"`,
    });

    if (posts.items.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = posts.items[0];

    // post.id가 존재하는지 확인 (스키마에서 post_id가 required: false이므로)
    if (!post.id) {
      return res.status(500).json({ error: "Post ID is missing" });
    }

    // 기존 좋아요 확인
    const existingLikes = await pb.collection(COLLECTIONS.POST_LIKES).getList(1, 1, {
      filter: `ip_address = "${clientIP}" && post_id = "${post.id}"`,
    });

    let newCount: number;

    if (existingLikes.items.length > 0) {
      // 기존 좋아요 업데이트
      const existingLike = existingLikes.items[0];
      newCount = Math.min((existingLike.count || 0) + count, 5); // 최대 5개

      await pb.collection(COLLECTIONS.POST_LIKES).update(existingLike.id, {
        count: newCount,
        updated: new Date().toISOString(),
      });
    } else {
      // 새 좋아요 생성
      newCount = Math.min(count, 5); // 최대 5개

      await pb.collection(COLLECTIONS.POST_LIKES).create({
        ip_address: clientIP,
        post_id: post.id,
        count: newCount,
      });
    }

    // 총 좋아요 수 계산
    const allLikes = await pb.collection(COLLECTIONS.POST_LIKES).getFullList({
      filter: `post_id = "${post.id}"`,
    });

    const totalLikes = allLikes.reduce((sum, like) => sum + (like.count || 0), 0);

    res.json({
      success: true,
      data: {
        count: newCount,
        total_likes: totalLikes,
        ip_address: clientIP,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to add like",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// 내 좋아요 수 조회
likesRouter.get("/:slug/my-likes", async (req, res) => {
  try {
    const { slug } = req.params;
    const clientIP = req.headers.x_forwarded_for || req.headers.origin || req.ip;

    // 포스트 존재 확인
    const posts = await pb.collection(COLLECTIONS.POSTS).getList(1, 1, {
      filter: `slug = "${slug}"`,
    });

    if (posts.items.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = posts.items[0];

    // post.id가 존재하는지 확인
    if (!post.id) {
      return res.status(500).json({ error: "Post ID is missing" });
    }

    // IP 기반 좋아요 조회
    const likes = await pb.collection(COLLECTIONS.POST_LIKES).getList(1, 1, {
      filter: `ip_address = "${clientIP}" && post_id = "${post.id}"`,
    });

    const count = likes.items.length > 0 ? likes.items[0].count || 0 : 0;

    res.json({
      success: true,
      data: {
        count,
        ip_address: clientIP,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch my likes",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// 총 좋아요 수 조회
likesRouter.get("/:slug/total", async (req, res) => {
  try {
    const { slug } = req.params;

    // 포스트 존재 확인
    const posts = await pb.collection(COLLECTIONS.POSTS).getList(1, 1, {
      filter: `slug = "${slug}"`,
    });

    if (posts.items.length === 0) {
      return res.json({
        success: true,
        data: { total: 0 },
      });
    }

    const post = posts.items[0];

    // post.id가 존재하는지 확인
    if (!post.id) {
      return res.json({
        success: true,
        data: { total: 0 },
      });
    }

    // 모든 좋아요 조회
    const likes = await pb.collection(COLLECTIONS.POST_LIKES).getFullList({
      filter: `post_id = "${post.id}"`,
    });

    const totalLikes = likes.reduce((sum, like) => sum + (like.count || 0), 0);

    res.json({
      success: true,
      data: { total: totalLikes },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch total likes",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
