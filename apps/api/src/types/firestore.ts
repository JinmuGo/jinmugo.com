import type { Timestamp } from "firebase-admin/firestore";

// Re-export shared types from @jinmu/types
export type {
  LikeIncrementResult,
  PostStatsCreate,
  ViewIncrementResult,
} from "@jinmu/types/firestore";

// Override PostStatsDocument to use Firebase Timestamp type
export interface PostStatsDocument {
  slug: string;
  total_views: number;
  total_likes: number;
  likes_by_ip: { [ipAddress: string]: number };
  created_at: Timestamp; // Firebase-specific Timestamp type
  updated_at: Timestamp; // Firebase-specific Timestamp type
  last_synced_to_pb: Timestamp | null; // Firebase-specific Timestamp type
}
