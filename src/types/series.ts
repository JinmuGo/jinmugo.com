import type { Post } from "./content"
import type { Lang } from "./utils"

/**
 * Extended series metadata
 */
export interface SeriesMetadata {
  name: string
  posts: Post[]
  totalPosts: number
  firstPublished: Date
  lastUpdated: Date
  primaryCategory: string | null
  categoryDistribution: Record<string, number>
}

/**
 * Sort options for series list
 */
export type SeriesSortOption = "latest" | "name" | "count"

/**
 * Localized text for series UI
 */
export interface SeriesTranslations {
  pageTitle: string
  pageDescription: string
  postsCount: (count: number) => string
  sortByLabel: string
  sortOptions: {
    latest: string
    name: string
    count: string
  }
  firstPublished: string
  lastUpdated: string
  primaryCategory: string
  readingTime: string
  minutes: string
}
