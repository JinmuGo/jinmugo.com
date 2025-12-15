import type { RecordModel } from "pocketbase";
import { COLLECTIONS, pb } from "../lib/pocketbase";
import type { LikeIncrementResult, ViewIncrementResult } from "../types/firestore";

const MAX_LIKES_PER_IP = 5;

/**
 * PocketBase 기반 통계 서비스
 * 기존 views.ts, likes.ts의 로직을 서비스로 추출
 */
export class PocketBaseStatsService {
  /**
   * Post 존재 확인 (없으면 생성)
   */
  private async ensurePostExists(slug: string): Promise<RecordModel> {
    const posts = await pb.collection(COLLECTIONS.POSTS).getList(1, 1, {
      filter: `slug = "${slug}"`,
    });

    if (posts.items.length > 0) {
      return posts.items[0];
    }

    // Post가 없으면 생성
    return await pb.collection(COLLECTIONS.POSTS).create({
      slug,
      type: "post",
    });
  }

  /**
   * View count 증가
   */
  async incrementViews(slug: string, count = 1): Promise<ViewIncrementResult> {
    const post = await this.ensurePostExists(slug);

    // 기존 조회 기록 확인
    const existingViews = await pb.collection(COLLECTIONS.POST_VIEWS).getList(1, 1, {
      filter: `post_id = "${post.id}"`,
    });

    let viewRecord: RecordModel;
    if (existingViews.items.length > 0) {
      // Atomic increment
      const existingView = existingViews.items[0];
      viewRecord = await pb.collection(COLLECTIONS.POST_VIEWS).update(existingView.id, {
        "count+": Number(count),
      });
    } else {
      // 새 조회 기록 생성
      viewRecord = await pb.collection(COLLECTIONS.POST_VIEWS).create({
        post_id: post.id,
        count: Number(count),
      });
    }

    return {
      slug,
      total_views: viewRecord.count,
      success: true,
    };
  }

  /**
   * View count 조회
   */
  async getViews(slug: string): Promise<number> {
    const posts = await pb.collection(COLLECTIONS.POSTS).getList(1, 1, {
      filter: `slug = "${slug}"`,
    });

    if (posts.items.length === 0) {
      return 0;
    }

    const post = posts.items[0];
    const viewsResult = await pb.collection(COLLECTIONS.POST_VIEWS).getList(1, 1, {
      filter: `post_id = "${post.id}"`,
      fields: "count",
    });

    return viewsResult.items.length > 0 ? viewsResult.items[0].count || 0 : 0;
  }

  /**
   * Like count 증가
   */
  async incrementLikes(slug: string, ipAddress: string, count = 1): Promise<LikeIncrementResult> {
    const posts = await pb.collection(COLLECTIONS.POSTS).getList(1, 1, {
      filter: `slug = "${slug}"`,
    });

    if (posts.items.length === 0) {
      throw new Error(`Post not found: ${slug}`);
    }

    const post = posts.items[0];

    if (!post.id) {
      throw new Error("Post ID is missing");
    }

    // 기존 좋아요 확인
    const existingLikes = await pb.collection(COLLECTIONS.POST_LIKES).getList(1, 1, {
      filter: `ip_address = "${ipAddress}" && post_id = "${post.id}"`,
    });

    let newCount: number;

    if (existingLikes.items.length > 0) {
      // 기존 좋아요 업데이트
      const existingLike = existingLikes.items[0];
      newCount = Math.min((existingLike.count || 0) + count, MAX_LIKES_PER_IP);

      await pb.collection(COLLECTIONS.POST_LIKES).update(existingLike.id, {
        count: newCount,
        updated: new Date().toISOString(),
      });
    } else {
      // 새 좋아요 생성
      newCount = Math.min(count, MAX_LIKES_PER_IP);

      await pb.collection(COLLECTIONS.POST_LIKES).create({
        ip_address: ipAddress,
        post_id: post.id,
        count: newCount,
      });
    }

    // 총 좋아요 수 계산
    const allLikes = await pb.collection(COLLECTIONS.POST_LIKES).getFullList({
      filter: `post_id = "${post.id}"`,
    });

    const totalLikes = allLikes.reduce((sum, like) => sum + (like.count || 0), 0);

    return {
      slug,
      my_likes: newCount,
      total_likes: totalLikes,
      success: true,
    };
  }

  /**
   * 내 좋아요 수 조회
   */
  async getMyLikes(slug: string, ipAddress: string): Promise<number> {
    const posts = await pb.collection(COLLECTIONS.POSTS).getList(1, 1, {
      filter: `slug = "${slug}"`,
    });

    if (posts.items.length === 0) {
      return 0;
    }

    const post = posts.items[0];

    if (!post.id) {
      return 0;
    }

    const likes = await pb.collection(COLLECTIONS.POST_LIKES).getList(1, 1, {
      filter: `ip_address = "${ipAddress}" && post_id = "${post.id}"`,
    });

    return likes.items.length > 0 ? likes.items[0].count || 0 : 0;
  }

  /**
   * 총 좋아요 수 조회
   */
  async getTotalLikes(slug: string): Promise<number> {
    const posts = await pb.collection(COLLECTIONS.POSTS).getList(1, 1, {
      filter: `slug = "${slug}"`,
    });

    if (posts.items.length === 0) {
      return 0;
    }

    const post = posts.items[0];

    if (!post.id) {
      return 0;
    }

    const likes = await pb.collection(COLLECTIONS.POST_LIKES).getFullList({
      filter: `post_id = "${post.id}"`,
    });

    return likes.reduce((sum, like) => sum + (like.count || 0), 0);
  }

  /**
   * Firestore → PocketBase 동기화 (views)
   */
  async syncViewsFromFirestore(slug: string, viewCount: number): Promise<void> {
    const post = await this.ensurePostExists(slug);

    const existingViews = await pb.collection(COLLECTIONS.POST_VIEWS).getList(1, 1, {
      filter: `post_id = "${post.id}"`,
    });

    if (existingViews.items.length > 0) {
      // 기존 레코드 업데이트 (Firestore 값으로 덮어쓰기)
      await pb.collection(COLLECTIONS.POST_VIEWS).update(existingViews.items[0].id, {
        count: viewCount,
      });
    } else {
      // 새 레코드 생성
      await pb.collection(COLLECTIONS.POST_VIEWS).create({
        post_id: post.id,
        count: viewCount,
      });
    }
  }

  /**
   * Firestore → PocketBase 동기화 (likes)
   */
  async syncLikesFromFirestore(
    slug: string,
    _totalLikes: number,
    likesByIp: { [ipAddress: string]: number } | null | undefined,
  ): Promise<void> {
    const post = await this.ensurePostExists(slug);

    // 기존 좋아요 모두 삭제 (간단한 동기화 전략)
    const existingLikes = await pb.collection(COLLECTIONS.POST_LIKES).getFullList({
      filter: `post_id = "${post.id}"`,
    });

    for (const like of existingLikes) {
      await pb.collection(COLLECTIONS.POST_LIKES).delete(like.id);
    }

    // Firestore 데이터로 다시 생성
    // likesByIp가 null/undefined일 수 있으므로 기본값 제공
    const likesByIpData = likesByIp || {};
    const _likeCount = Object.keys(likesByIpData).length;

    for (const [ipAddress, count] of Object.entries(likesByIpData)) {
      await pb.collection(COLLECTIONS.POST_LIKES).create({
        ip_address: ipAddress,
        post_id: post.id,
        count,
      });
    }
  }
}

// 싱글톤 인스턴스 생성
let instance: PocketBaseStatsService | null = null;

const getPocketBaseStatsService = (): PocketBaseStatsService => {
  if (!instance) {
    instance = new PocketBaseStatsService();
  }
  return instance;
};

export const pocketbaseStatsService = getPocketBaseStatsService();
