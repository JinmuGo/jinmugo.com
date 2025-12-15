import type { Router } from "express";
import { Router as ExpressRouter } from "express";
import { z } from "zod";
import { statsService } from "../services/stats.service";

export const viewsRouter: Router = ExpressRouter();

// Validation schema
const viewSchema = z.object({
  count: z.number().int().min(1).max(100),
});

// 조회수 증가
viewsRouter.post("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { count } = req.body;

    // Validate input
    const validation = viewSchema.safeParse({ count });
    if (!validation.success) {
      res.status(400).json({
        error: "Invalid input",
        details: validation.error.issues,
      });
      return;
    }

    const result = await statsService.incrementViews(slug, count);

    res.json({
      success: true,
      data: {
        views: result.total_views,
        slug,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to increment views",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

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
