import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import { getKoreanMemos } from "@/content-utils/memos.ts"
import { getKoreanPosts } from "@/content-utils/posts.ts"
import type { Memo, Post } from "@/types/content"
import pkg from "~/package.json"

export const GET: APIRoute = async (context) => {
  const posts = (await getKoreanPosts()).map((post: Post) => ({
    link: `/posts/${post.slug}`,
    title: post.data.title,
    pubDate: post.data.date,
    description: post.data.summary,
    categories: post.data.tags,
    author: pkg.author,
  }))
  const memos = (await getKoreanMemos()).map((memo: Memo) => ({
    link: `/memos/${memo.slug}`,
    title: memo.data.title,
    pubDate: memo.data.date,
    description: memo.data.summary,
    categories: memo.data.tags,
    author: pkg.author,
  }))

  const items = [...posts, ...memos]

  return rss({
    title: pkg.title,
    description: pkg.description,
    site: context.site ?? pkg.homepage,
    items,
  })
}
