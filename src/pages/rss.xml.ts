import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import MarkdownIt from "markdown-it"
import sanitizeHtml from "sanitize-html"
import type { Post, Weekly } from "@/types/content"
import { getKoreanPosts } from "@/utils/content/posts"
import { getKoreanWeeklies } from "@/utils/content/weekly"
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
  const weeklies = (await getKoreanWeeklies()).map((weekly: Weekly) => ({
    link: `/weekly/${weekly.slug}`,
    title: weekly.data.title,
    pubDate: weekly.data.date,
    description: weekly.data.summary,
    content: sanitizeHtml(parser.render(weekly.body)),
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
