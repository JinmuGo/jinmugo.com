import rss from "@astrojs/rss";
import siteMetadata from "@/consts.ts";
import { getEnglishPosts } from "@/utils/posts.ts";
import { getEnglishMemos } from "@/utils/memos.ts";
import type { APIRoute } from "astro";
import type { Post } from "@/types/post";
import type { Memo } from "@/types/post";

export const GET: APIRoute = async (context) => {
  const posts = (await getEnglishPosts()).map((post: Post) => ({
    ...post.data,
    link: `/posts/${post.data.category}/${post.slug}`,
  }));
  const memos = (await getEnglishMemos()).map((memo: Memo) => ({
    ...memo.data,
    link: `/memos/${memo.slug}`,
  }));

  const items = [...posts, ...memos];

  return rss({
    title: siteMetadata.title,
    description: siteMetadata.description,
    site: context.site!,
    items,
  });
}
