import type { CollectionEntry } from "astro:content"
import type { getKoreanMemos } from "@/utils/content/memos"
import type { getKoreanPosts } from "@/utils/content/posts"

type ContentType = "post" | "memo"

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
export type MemoMetadata = BaseMetadata & Partial<CollectionEntry<"memo">["data"]>

export type Post = Awaited<ReturnType<typeof getKoreanPosts>>[number] & {
  type: ContentType
}

export type Memo = Awaited<ReturnType<typeof getKoreanMemos>>[number] & {
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
