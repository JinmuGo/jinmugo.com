import type { CollectionEntry } from "astro:content";
import type { getKoreanPosts } from "@/utils/posts";
import type { getKoreanMemos } from "@/utils/memos";

export type PostLayoutType = "PostDefault" | "PostBannerX" | "PostBannerY";

// 공통 필드만 타입으로 정의
interface BaseMetadata {
  title: string;
  date: Date;
  draft: boolean;
  tags?: string[];
  category?: string;
  summary?: string;
  slug: string;
}

export type PostMetadata = BaseMetadata &
  Partial<CollectionEntry<"post">["data"]>;
export type MemoMetadata = BaseMetadata &
  Partial<CollectionEntry<"memo">["data"]>;

export type Post = Awaited<ReturnType<typeof getKoreanPosts>>[number];

export type Memo = Awaited<ReturnType<typeof getKoreanMemos>>[number];