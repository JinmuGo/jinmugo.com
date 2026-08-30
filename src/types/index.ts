/**
 * Centralized type exports for the blog application
 * Import all types from this file for consistency
 */

// Content types
export type { Post, PostMetadata, Series } from "./content"

// Library types
export type { BookMedia, BookWithSlug, MediaItem, MovieMedia, MovieWithSlug } from "./library"

// Schema types
export type {
  ArticleSchemaOptions,
  BreadcrumbItem,
  ListItem,
  PageSchemaOptions,
  PersonSchemaOptions,
  WebsiteSchemaOptions,
} from "./schema"

// Utility types
export type { ClassifyType, ContentType, Lang, PostLayoutType } from "./utils"
