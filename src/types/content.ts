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
export type Post = CollectionEntry<"post"> & {
  slug: string
  href: string
  type: "post"
}
