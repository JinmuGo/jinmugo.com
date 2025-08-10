import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import { getEnglishMemos } from "@/content-utils/memos.ts"
import { getEnglishPosts } from "@/content-utils/posts.ts"
import type { Memo, Post } from "@/types/content"
import pkg from "~/package.json"

export const GET: APIRoute = async (context) => {
  const posts = (await getEnglishPosts()).map((post: Post) => ({
    link: `/en/posts/${post.slug}`,
    title: post.data.title,
    pubDate: post.data.date,
    description: post.data.summary,
    categories: post.data.tags,
    author: pkg.author,
  }))
  const memos = (await getEnglishMemos()).map((memo: Memo) => ({
    link: `/en/memos/${memo.slug}`,
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
