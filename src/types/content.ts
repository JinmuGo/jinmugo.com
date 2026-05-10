import type { CollectionEntry } from "astro:content"
import type { getKoreanPosts } from "@/utils/content/posts"
import type { getKoreanWeeklies } from "@/utils/content/weekly"

type ContentType = "post" | "weekly"

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

export type Post = Awaited<ReturnType<typeof getKoreanPosts>>[number] & {
  type: ContentType
}

export type Weekly = Awaited<ReturnType<typeof getKoreanWeeklies>>[number] & {
  type: ContentType
}

/**
 * Series information for grouping related posts
 */
export interface Series {
  name: string
  posts: Post[]
  totalPosts: number
}
