import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import MarkdownIt from "markdown-it"
import type { Post } from "@/types/content"
import { getKoreanPosts } from "@/utils/content/posts"
import { renderRssContent, sanitizeForRss } from "@/utils/rss"
import pkg from "~/package.json"

const parser = new MarkdownIt()

export const GET: APIRoute = async (context) => {
  const posts = (await getKoreanPosts()).map((post: Post) => ({
    link: `/posts/${post.slug}`,
    title: sanitizeForRss(post.data.title),
    pubDate: post.data.date,
    description: post.data.summary ? sanitizeForRss(post.data.summary) : undefined,
    content: renderRssContent(post.body, parser),
    categories: post.data.tags,
    author: pkg.author,
  }))

  return rss({
    title: pkg.title,
    description: pkg.description,
    site: context.site ?? pkg.homepage,
    items: posts,
  })
}
