import type { Router } from "express";
import { Router as ExpressRouter } from "express";
import { z } from "zod";
import { statsService } from "../services/stats.service";

export const likesRouter: Router = ExpressRouter();

// Validation schema
const likeSchema = z.object({
  count: z.number().int().min(1).max(5),
});

// 좋아요 추가
likesRouter.post("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { count } = req.body;
    const clientIP = req.clientIP;

    // Validate input
    const validation = likeSchema.safeParse({ count });
    if (!validation.success) {
      res.status(400).json({
        error: "Invalid input",
        details: validation.error.issues,
      });
      return;
    }

    const result = await statsService.incrementLikes(slug, clientIP, count);

    res.json({
      success: true,
      data: {
        count: result.my_likes,
        total_likes: result.total_likes,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Post not found")) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
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
    const clientIP = req.clientIP;

    const myLikes = await statsService.getMyLikes(slug, clientIP);

    res.json({
      success: true,
      data: {
        count: myLikes,
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

    // 통합 서비스 호출 (Firestore 우선 - O(1), PocketBase fallback - O(N))
    const totalLikes = await statsService.getTotalLikes(slug);

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
