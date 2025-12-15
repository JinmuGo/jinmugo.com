import { FIRESTORE_ENABLED } from "../lib/firestore";
import type { LikeIncrementResult, ViewIncrementResult } from "../types/firestore";
import { firestoreStatsService } from "./firestore-stats.service";
import { pocketbaseStatsService } from "./pocketbase-stats.service";

/**
 * 통합 통계 서비스
 *
 * 전략:
 * - Firestore 우선 (빠른 응답)
 * - PocketBase fallback
 * - Feature flag로 Firestore on/off 가능
 * - Write는 Frontend에서 직접 Firestore로 수행 (Backend는 Sync Job으로 마이그레이션)
 */
class StatsService {
  /**
   * View count 증가
   */
  async incrementViews(slug: string, count = 1): Promise<ViewIncrementResult> {
    if (FIRESTORE_ENABLED) {
      try {
        return await firestoreStatsService.incrementViews(slug, count);
      } catch (_error) {}
    }
    return await pocketbaseStatsService.incrementViews(slug, count);
  }

  /**
   * View count 조회
   */
  async getViews(slug: string): Promise<number> {
    // Firestore 우선 조회
    if (FIRESTORE_ENABLED) {
      try {
        return await firestoreStatsService.getViews(slug);
      } catch (_error) {}
    }

    // PocketBase fallback
    return await pocketbaseStatsService.getViews(slug);
  }

  /**
   * Like count 증가
   */
  async incrementLikes(slug: string, ipAddress: string, count = 1): Promise<LikeIncrementResult> {
    if (FIRESTORE_ENABLED) {
      try {
        return await firestoreStatsService.incrementLikes(slug, ipAddress, count);
      } catch (_error) {}
    }
    return await pocketbaseStatsService.incrementLikes(slug, ipAddress, count);
  }

  /**
   * 내 좋아요 수 조회
   */
  async getMyLikes(slug: string, ipAddress: string): Promise<number> {
    if (FIRESTORE_ENABLED) {
      try {
        return await firestoreStatsService.getMyLikes(slug, ipAddress);
      } catch (_error) {}
    }
    return await pocketbaseStatsService.getMyLikes(slug, ipAddress);
  }

  /**
   * 총 좋아요 수 조회
   */
  async getTotalLikes(slug: string): Promise<number> {
    // Firestore 우선 조회 (O(1) - 비정규화된 total_likes)
    if (FIRESTORE_ENABLED) {
      try {
        return await firestoreStatsService.getTotalLikes(slug);
      } catch (_error) {}
    }

    // PocketBase fallback (O(N) - getFullList + reduce)
    return await pocketbaseStatsService.getTotalLikes(slug);
  }
}

export const statsService = new StatsService();
