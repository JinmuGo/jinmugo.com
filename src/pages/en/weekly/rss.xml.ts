import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import MarkdownIt from "markdown-it"
import sanitizeHtml from "sanitize-html"
import type { Weekly } from "@/types/content"
import { getEnglishWeeklies } from "@/utils/content/weekly"
import pkg from "~/package.json"

const parser = new MarkdownIt()

export const GET: APIRoute = async (context) => {
  const items = (await getEnglishWeeklies()).map((weekly: Weekly) => ({
    link: `/en/weekly/${weekly.slug}`,
    title: weekly.data.title,
    pubDate: weekly.data.date,
    description: weekly.data.summary,
    content: sanitizeHtml(parser.render(weekly.body)),
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
