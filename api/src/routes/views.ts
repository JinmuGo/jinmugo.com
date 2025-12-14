import type { Router } from "express";
import { Router as ExpressRouter } from "express";
import { statsService } from "../services/stats.service";

export const viewsRouter: Router = ExpressRouter();

// 포스트 조회수 조회
viewsRouter.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // 통합 서비스 호출 (Firestore 우선, PocketBase fallback)
    const views = await statsService.getViews(slug);

    res.json({
      success: true,
      data: {
        views,
        slug,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch views",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
