import { FieldValue } from "firebase-admin/firestore";
import { admin, db, FIRESTORE_COLLECTIONS, FIRESTORE_ENABLED } from "../lib/firestore";
import type {
  LikeIncrementResult,
  PostStatsDocument,
  ViewIncrementResult,
} from "../types/firestore";

const MAX_LIKES_PER_IP = 5;

/**
 * Firestore 기반 통계 서비스
 */
class FirestoreStatsService {
  /**
   * View count 증가 (atomic operation)
   */
  async incrementViews(slug: string, count = 1): Promise<ViewIncrementResult> {
    if (!FIRESTORE_ENABLED || !db) {
      throw new Error("Firestore is not enabled");
    }

    const docRef = db.collection(FIRESTORE_COLLECTIONS.POST_STATS).doc(slug);

    try {
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
          // 문서가 없으면 생성
          transaction.set(docRef, {
            slug,
            total_views: count,
            total_likes: 0,
            likes_by_ip: {},
            created_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp(),
            last_synced_to_pb: null,
          });
        } else {
          // 문서가 있으면 atomic increment
          transaction.update(docRef, {
            total_views: FieldValue.increment(count),
            updated_at: FieldValue.serverTimestamp(),
          });
        }
      });

      // 업데이트 후 최신 데이터 조회
      const updatedDoc = await docRef.get();
      const data = updatedDoc.data() as PostStatsDocument;

      return {
        slug,
        total_views: data.total_views,
        success: true,
      };
    } catch (error) {
      console.error(`[Firestore] Failed to increment views for ${slug}:`, error);
      throw error;
    }
  }

  /**
   * View count 조회
   */
  async getViews(slug: string): Promise<number> {
    if (!FIRESTORE_ENABLED || !db) {
      throw new Error("Firestore is not enabled");
    }

    try {
      const docRef = db.collection(FIRESTORE_COLLECTIONS.POST_STATS).doc(slug);
      const doc = await docRef.get();

      if (!doc.exists) {
        return 0;
      }

      const data = doc.data() as PostStatsDocument;
      return data.total_views || 0;
    } catch (error) {
      console.error(`[Firestore] Failed to get views for ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Like count 증가 (IP별, atomic operation)
   */
  async incrementLikes(slug: string, userId: string, count = 1): Promise<LikeIncrementResult> {
    if (!FIRESTORE_ENABLED || !db) {
      throw new Error("Firestore is not enabled");
    }

    const docRef = db.collection(FIRESTORE_COLLECTIONS.POST_STATS).doc(slug);

    try {
      let myLikes = 0;
      let totalLikes = 0;

      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
          // 문서가 없으면 생성
          myLikes = Math.min(count, MAX_LIKES_PER_IP);
          totalLikes = myLikes;

          transaction.set(docRef, {
            slug,
            total_views: 0,
            total_likes: totalLikes,
            likes_by_ip: {
              [userId]: myLikes,
            },
            created_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp(),
            last_synced_to_pb: null,
          });
        } else {
          const data = doc.data() as PostStatsDocument;
          const currentLikes = data.likes_by_ip[userId] || 0;

          // 최대 좋아요 제한
          const newCount = Math.min(currentLikes + count, MAX_LIKES_PER_IP);
          const increment = newCount - currentLikes;

          myLikes = newCount;
          totalLikes = data.total_likes + increment;

          transaction.update(docRef, {
            [`likes_by_ip.${userId}`]: newCount,
            total_likes: FieldValue.increment(increment),
            updated_at: FieldValue.serverTimestamp(),
          });
        }
      });

      return {
        slug,
        my_likes: myLikes,
        total_likes: totalLikes,
        success: true,
      };
    } catch (error) {
      console.error(`[Firestore] Failed to increment likes for ${slug}:`, error);
      throw error;
    }
  }

  /**
   * 내 좋아요 수 조회
   */
  async getMyLikes(slug: string, userId: string): Promise<number> {
    if (!FIRESTORE_ENABLED || !db) {
      throw new Error("Firestore is not enabled");
    }

    try {
      const docRef = db.collection(FIRESTORE_COLLECTIONS.POST_STATS).doc(slug);
      const doc = await docRef.get();

      if (!doc.exists) {
        return 0;
      }

      const data = doc.data() as PostStatsDocument;
      return data.likes_by_ip[userId] || 0;
    } catch (error) {
      console.error(`[Firestore] Failed to get my likes for ${slug}:`, error);
      throw error;
    }
  }

  /**
   * 총 좋아요 수 조회 (O(1))
   */
  async getTotalLikes(slug: string): Promise<number> {
    if (!FIRESTORE_ENABLED || !db) {
      throw new Error("Firestore is not enabled");
    }

    try {
      const docRef = db.collection(FIRESTORE_COLLECTIONS.POST_STATS).doc(slug);
      const doc = await docRef.get();

      if (!doc.exists) {
        return 0;
      }

      const data = doc.data() as PostStatsDocument;
      return data.total_likes || 0;
    } catch (error) {
      console.error(`[Firestore] Failed to get total likes for ${slug}:`, error);
      throw error;
    }
  }

  /**
   * 전체 post stats 조회 (동기화용)
   */
  async getPostStats(slug: string): Promise<PostStatsDocument | null> {
    if (!FIRESTORE_ENABLED || !db) {
      throw new Error("Firestore is not enabled");
    }

    try {
      const docRef = db.collection(FIRESTORE_COLLECTIONS.POST_STATS).doc(slug);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as PostStatsDocument;
    } catch (error) {
      console.error(`[Firestore] Failed to get post stats for ${slug}:`, error);
      throw error;
    }
  }

  /**
   * 모든 post stats 조회 (동기화용)
   */
  async batchGetAllStats(): Promise<PostStatsDocument[]> {
    if (!FIRESTORE_ENABLED || !db) {
      throw new Error("Firestore is not enabled");
    }

    try {
      const snapshot = await db.collection(FIRESTORE_COLLECTIONS.POST_STATS).get();

      return snapshot.docs.map((doc) => doc.data() as PostStatsDocument);
    } catch (error) {
      console.error("[Firestore] Failed to get all post stats:", error);
      throw error;
    }
  }

  /**
   * Last synced timestamp 업데이트
   */
  async updateLastSyncedToPb(slug: string): Promise<void> {
    if (!FIRESTORE_ENABLED || !db) {
      throw new Error("Firestore is not enabled");
    }

    try {
      const docRef = db.collection(FIRESTORE_COLLECTIONS.POST_STATS).doc(slug);
      await docRef.update({
        last_synced_to_pb: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error(`[Firestore] Failed to update last_synced_to_pb for ${slug}:`, error);
      throw error;
    }
  }
}

export const firestoreStatsService = new FirestoreStatsService();
