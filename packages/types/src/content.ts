/**
 * Category enum - shared across blog and API
 */
export const CATEGORIES = [
  "develop",
  "experience",
  "cloud",
  "movie",
  "book",
  "thinking",
  "health",
  "tech",
  "network",
  "linux",
] as const

export type Category = (typeof CATEGORIES)[number]

/**
 * Base metadata interface for posts and memos
 */
export interface BaseMetadata {
  title: string
  date: Date
  lastmod?: Date
  draft: boolean
  tags?: string[]
  category?: string
  summary?: string
  slug: string
}

/**
 * Post frontmatter interface
 */
export interface PostFrontmatter {
  title: string
  date: Date
  tags?: string[]
  category?: Category | null
  summary?: string
  draft: boolean
  lastmod?: Date
  series?: string | null
  seriesOrder?: number
  banner?: string | null
}

/**
 * Memo frontmatter interface
 */
export interface MemoFrontmatter {
  title: string
  date: Date
  draft: boolean
  tags?: string[]
  category?: Category | null
  summary?: string
  lastmod?: Date
  series?: string | null
  seriesOrder?: number
}
