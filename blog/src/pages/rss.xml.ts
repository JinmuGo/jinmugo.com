import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import siteMetadata from "@/consts.ts";
import type { Memo, Post } from "@/types/post";
import { getKoreanMemos } from "@/utils/memos.ts";
import { getKoreanPosts } from "@/utils/posts.ts";

export const GET: APIRoute = async (context) => {
	const posts = (await getKoreanPosts()).map((post: Post) => ({
		link: `/posts/${post.data.category}/${post.slug}`,
    title: post.data.title,
		pubDate: post.data.date,
		description: post.data.summary,
		categories: post.data.tags,
    author: siteMetadata.author
	}));
	const memos = (await getKoreanMemos()).map((memo: Memo) => ({
		link: `/memos/${memo.slug}`,
		title: memo.data.title,
		pubDate: memo.data.date,
		description: memo.data.summary,
		categories: memo.data.tags,
		author: siteMetadata.author,
	}));

	const items = [...posts, ...memos];

	return rss({
		title: siteMetadata.title,
		description: siteMetadata.description,
		site: context.site ?? siteMetadata.siteUrl,
		items,
	});
};
