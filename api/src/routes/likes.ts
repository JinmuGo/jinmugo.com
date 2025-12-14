import type { Router } from "express";
import { Router as ExpressRouter } from "express";
import { statsService } from "../services/stats.service";

export const likesRouter: Router = ExpressRouter();

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
