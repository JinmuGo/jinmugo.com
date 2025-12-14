import type { Timestamp } from "firebase-admin/firestore";

/**
 * Firestore post_stats 컬렉션의 문서 구조
 * Document ID = slug
 */
export interface PostStatsDocument {
  slug: string;
  total_views: number;
  total_likes: number;
  likes_by_ip: { [ipAddress: string]: number };
  created_at: Timestamp;
  updated_at: Timestamp;
  last_synced_to_pb: Timestamp | null;
}

/**
 * View 증가 결과
 */
export interface ViewIncrementResult {
  slug: string;
  total_views: number;
  success: boolean;
}

/**
 * Like 증가 결과
 */
export interface LikeIncrementResult {
  slug: string;
  my_likes: number;
  total_likes: number;
  success: boolean;
}

/**
 * Firestore 생성용 문서 (timestamp 제외)
 */
export type PostStatsCreate = Omit<PostStatsDocument, "created_at" | "updated_at">;
