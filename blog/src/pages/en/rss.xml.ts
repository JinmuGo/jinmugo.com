import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import siteMetadata from "@/consts.ts";
import type { Memo, Post } from "@/types/content";
import { getEnglishMemos } from "@/content-utils/memos.ts";
import { getEnglishPosts } from "@/content-utils/posts.ts";

export const GET: APIRoute = async (context) => {
	const posts = (await getEnglishPosts()).map((post: Post) => ({
		link: `/en/posts/${post.data.category}/${post.slug}`,
		title: post.data.title,
		pubDate: post.data.date,
		description: post.data.summary,
		categories: post.data.tags,
		author: siteMetadata.author,
	}));
	const memos = (await getEnglishMemos()).map((memo: Memo) => ({
		link: `/en/memos/${memo.slug}`,
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
