import type { CollectionEntry } from "astro:content";
import type { getKoreanMemos } from "@/content-utils/memos";
import type { getKoreanPosts } from "@/content-utils/posts";

export type PostLayoutType = "PostDefault" | "PostBannerX" | "PostBannerY";

type ContentType = "post" | "memo";

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

export type Post = Awaited<ReturnType<typeof getKoreanPosts>>[number] & {
	type: ContentType;
};

export type Memo = Awaited<ReturnType<typeof getKoreanMemos>>[number] & {
	type: ContentType;
};
