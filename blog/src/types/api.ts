/**
 * API response types for Express + PocketBase backend
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success?: boolean
  data?: T
  error?: string
}

/**
 * Like-related data structure
 */
export interface LikeData {
  count?: number
  total_likes?: number
  ip_address?: string
}

/**
 * View count data structure
 */
export interface ViewData {
  views?: number
}

/**
 * Total likes response
 */
export interface TotalLikesData {
  total: number
}
