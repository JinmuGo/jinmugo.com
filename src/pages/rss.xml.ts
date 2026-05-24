import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import MarkdownIt from "markdown-it"
import type { Post, Weekly } from "@/types/content"
import { getKoreanPosts } from "@/utils/content/posts"
import { getKoreanWeeklies } from "@/utils/content/weekly"
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
  const weeklies = (await getKoreanWeeklies()).map((weekly: Weekly) => ({
    link: `/weekly/${weekly.slug}`,
    title: sanitizeForRss(weekly.data.title),
    pubDate: weekly.data.date,
    description: sanitizeForRss(weekly.data.summary),
    content: renderRssContent(weekly.body, parser),
    categories: weekly.data.tags,
    author: pkg.author,
  }))

  const items = [...posts, ...weeklies]

  return rss({
    title: pkg.title,
    description: pkg.description,
    site: context.site ?? pkg.homepage,
    items,
  })
}
