import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import MarkdownIt from "markdown-it"
import sanitizeHtml from "sanitize-html"
import type { Memo, Post } from "@/types/content"
import { getKoreanMemos } from "@/utils/content/memos"
import { getKoreanPosts } from "@/utils/content/posts"
import pkg from "~/package.json"

const parser = new MarkdownIt()

export const GET: APIRoute = async (context) => {
  const posts = (await getKoreanPosts()).map((post: Post) => ({
    link: `/posts/${post.slug}`,
    title: post.data.title,
    pubDate: post.data.date,
    description: post.data.summary,
    content: sanitizeHtml(parser.render(post.body)),
    categories: post.data.tags,
    author: pkg.author,
  }))
  const memos = (await getKoreanMemos()).map((memo: Memo) => ({
    link: `/memos/${memo.slug}`,
    title: memo.data.title,
    pubDate: memo.data.date,
    description: memo.data.summary,
    content: sanitizeHtml(parser.render(memo.body)),
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
