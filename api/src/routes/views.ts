import type { Router } from "express";
import { Router as ExpressRouter } from "express";
import type { RecordModel } from "pocketbase";
import { COLLECTIONS, pb } from "../lib/pocketbase";

export const viewsRouter: Router = ExpressRouter();

// 포스트 조회수 증가
viewsRouter.post("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { count = 1 } = req.body; // 증가할 조회수 (기본값 1)

    // 포스트 존재 확인 (없으면 생성)
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
    if (existingViews.items.length > 0) {
      // 기존 조회수 업데이트
      const existingView = existingViews.items[0];
      const newCount = (existingView.count || 0) + Number(count);

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

// 포스트 조회수 조회
viewsRouter.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // 포스트 존재 확인
    const posts = await pb.collection(COLLECTIONS.POSTS).getList(1, 1, {
      filter: `slug = "${slug}"`,
    });

    if (posts.items.length === 0) {
      return res.json({
        success: true,
        data: { views: 0 },
      });
    }

    const post = posts.items[0];

    // 조회수 가져오기 (count 필드 사용)
    const viewsResult = await pb.collection(COLLECTIONS.POST_VIEWS).getList(1, 1, {
      filter: `post_id = "${post.id}"`,
      fields: "count",
    });

    const views = viewsResult.items.length > 0 ? viewsResult.items[0].count || 0 : 0;

    res.json({
      success: true,
      data: {
        views,
        slug: post.slug,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch views",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
