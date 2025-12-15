import type { Router } from "express";
import { Router as ExpressRouter } from "express";
import { COLLECTIONS, pb } from "../lib/pocketbase.js";

export const postsRouter: Router = ExpressRouter();

// 모든 포스트 조회
postsRouter.get("/", async (req, res) => {
  try {
    const { type, limit = "50", offset = "0" } = req.query;

    let filter = "";
    if (type) {
      filter = `type = "${type}"`;
    }

    const posts = await pb
      .collection(COLLECTIONS.POSTS)
      .getList(Math.floor(Number(offset) / Number(limit)) + 1, Number(limit), {
        filter,
        sort: "-created", // created 필드로 정렬 (date 필드가 없음)
        // 현재 스키마에 있는 필드만 선택
        fields: "id,slug,type,created,updated",
      });

    res.json({
      success: true,
      data: posts.items,
      pagination: {
        page: posts.page,
        perPage: posts.perPage,
        totalItems: posts.totalItems,
        totalPages: posts.totalPages,
        hasMore: posts.page < posts.totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch posts",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// 특정 포스트 조회 (slug로)
postsRouter.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const posts = await pb.collection(COLLECTIONS.POSTS).getList(1, 1, {
      filter: `slug = "${slug}"`,
      // 현재 스키마에 있는 필드만 선택
      fields: "id,slug,type,created,updated",
    });

    if (posts.items.length === 0) {
      return res.status(404).json({
        error: "Post not found",
        slug,
      });
    }

    res.json({
      success: true,
      data: posts.items[0],
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch post",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// 태그 및 카테고리 조회 - 현재 스키마에는 해당 필드가 없으므로 빈 응답 반환
postsRouter.get("/meta/tags-and-categories", async (_req, res) => {
  try {
    // 현재 스키마에는 tags, category 필드가 없으므로 빈 배열 반환
    res.json({
      success: true,
      data: {
        tags: [],
        categories: [],
      },
      message: "Tags and categories fields not available in current schema",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch tags and categories",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
