import type { CollectionEntry } from "astro:content"

// 공통 필드만 타입으로 정의
interface BaseMetadata {
  title: string
  date: Date
  lastmod?: Date
  draft: boolean
  tags?: string[]
  category?: string
  summary?: string
  slug: string
}

export type PostMetadata = BaseMetadata & Partial<CollectionEntry<"post">["data"]>
export type WeeklyMetadata = BaseMetadata &
  Partial<CollectionEntry<"weekly">["data"]> & {
    cover?: string
    coverAlt?: string
    year: number
    week: number
  }

export type Post = CollectionEntry<"post"> & {
  slug: string
  href: string
  type: "post"
}

export type Weekly = CollectionEntry<"weekly"> & {
  slug: string
  href: string
  type: "weekly"
}

/**
 * Series information for grouping related posts
 */
export interface Series {
  name: string
  posts: Post[]
  totalPosts: number
}
