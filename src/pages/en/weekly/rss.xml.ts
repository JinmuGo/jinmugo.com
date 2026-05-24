import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import MarkdownIt from "markdown-it"
import type { Weekly } from "@/types/content"
import { getEnglishWeeklies } from "@/utils/content/weekly"
import { renderRssContent, sanitizeForRss } from "@/utils/rss"
import pkg from "~/package.json"

const parser = new MarkdownIt()

export const GET: APIRoute = async (context) => {
  const items = (await getEnglishWeeklies()).map((weekly: Weekly) => ({
    link: `/en/weekly/${weekly.slug}`,
    title: sanitizeForRss(weekly.data.title),
    pubDate: weekly.data.date,
    description: sanitizeForRss(weekly.data.summary),
    content: renderRssContent(weekly.body, parser),
    categories: weekly.data.tags,
    author: pkg.author,
  }))

  return rss({
    title: `${pkg.title} Weekly`,
    description: "Jinmu Weekly feed",
    site: context.site ?? pkg.homepage,
    items,
  })
}
