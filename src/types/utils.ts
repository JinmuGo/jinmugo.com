/**
 * Utility types used across the blog application
 */

/**
 * Supported languages for the blog
 */
export type Lang = "ko" | "en"

/**
 * Types of content collections
 */
export type ContentType = "post" | "weekly"

/**
 * Available post layout variants based on banner image orientation
 */
export type PostLayoutType = "PostDefault" | "PostBannerX" | "PostBannerY"

/**
 * Classification types for content organization
 */
export type ClassifyType = "category" | "tag" | "year"
