/**
 * Firestore post_stats collection document structure
 * Document ID = slug
 */
export interface PostStatsDocument {
  slug: string
  total_views: number
  total_likes: number
  likes_by_ip: { [ipAddress: string]: number }
  created_at: unknown // Timestamp type from firebase-admin/firestore
  updated_at: unknown // Timestamp type from firebase-admin/firestore
  last_synced_to_pb: unknown | null // Timestamp type from firebase-admin/firestore
}

/**
 * View increment result
 */
export interface ViewIncrementResult {
  slug: string
  total_views: number
  success: boolean
}

/**
 * Like increment result
 */
export interface LikeIncrementResult {
  slug: string
  my_likes: number
  total_likes: number
  success: boolean
}

/**
 * Firestore document creation type (without timestamps)
 */
export type PostStatsCreate = Omit<PostStatsDocument, "created_at" | "updated_at">
