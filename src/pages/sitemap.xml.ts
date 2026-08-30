import { format } from "date-fns"
import type { Post, Weekly } from "@/types/content"
import { getEnglishPosts, getKoreanPosts } from "@/utils/content/posts"
import { getEnglishWeeklies, getKoreanWeeklies } from "@/utils/content/weekly"
import { getBookMedia } from "@/utils/library/books"
import { getMovieMedia } from "@/utils/library/movies"

export async function GET() {
  const siteUrl = import.meta.env.SITE
  const [koPosts, enPosts, koWeeklies, enWeeklies, koBooks, enBooks, koMovies, enMovies] =
    await Promise.all([
      getKoreanPosts(),
      getEnglishPosts(),
      getKoreanWeeklies(),
      getEnglishWeeklies(),
      getBookMedia("ko"),
      getBookMedia("en"),
      getMovieMedia("ko"),
      getMovieMedia("en"),
    ])

  const renderUrl = (
    slug: string,
    {
      hasEn = true,
      lastMod,
    }: {
      hasEn?: boolean
      lastMod?: string
    } = {},
  ) => {
    // Ensure trailing slash to match GitHub Pages canonical URLs
    const normalizedSlug = slug.endsWith("/") ? slug : `${slug}/`
    const enSlug = `/en${normalizedSlug}`
    let result = ""

    result += "<url>"
    result += `<loc>${siteUrl}${normalizedSlug}</loc>`
    if (lastMod) {
      result += `<lastmod>${lastMod}</lastmod>`
    }
    result += `<xhtml:link rel="alternate" hreflang="ko" href="${siteUrl}${normalizedSlug}"/>`
    if (hasEn) {
      result += `<xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${enSlug}"/>`
    }
    result += `<xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${normalizedSlug}"/>`
    result += "</url>"

    if (hasEn) {
      result += "<url>"
      result += `<loc>${siteUrl}${enSlug}</loc>`
      if (lastMod) {
        result += `<lastmod>${lastMod}</lastmod>`
      }
      result += `<xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${enSlug}"/>`
      result += `<xhtml:link rel="alternate" hreflang="ko" href="${siteUrl}${normalizedSlug}"/>`
      result += `<xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${normalizedSlug}"/>`
      result += "</url>"
    }

    return result
  }
  const result = `
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
    ${renderUrl("/")}
    ${renderUrl("/about")}
    ${renderUrl("/archives")}
    ${renderUrl("/posts")}
    ${renderUrl("/weekly")}
    ${renderUrl("/series")}
    ${renderUrl("/gallery")}
    ${renderUrl("/projects")}
    ${renderUrl("/resume")}
    ${renderUrl("/library")}
    ${renderUrl("/library/books")}
    ${renderUrl("/library/movies")}
    ${koPosts
      .map((post: Post) => {
        const lastMod = format(post.data.lastmod ?? post.data.date, "yyyy-MM-dd")
        const hasEn = enPosts.some((p: Post) => p.slug === post.slug)

        return renderUrl(post.href, { hasEn, lastMod })
      })
      .join("\n")}
    ${koWeeklies
      .map((weekly: Weekly) => {
        const lastMod = format(weekly.data.lastmod ?? weekly.data.date, "yyyy-MM-dd")
        const hasEn = enWeeklies.some((w: Weekly) => w.slug === weekly.slug)

        return renderUrl(weekly.href, { hasEn, lastMod })
      })
      .join("\n")}
    ${koBooks
      .filter((book) => book.cover)
      .map((book) =>
        renderUrl(book.href, { hasEn: enBooks.some((item) => item.slug === book.slug) }),
      )
      .join("\n")}
    ${koMovies
      .filter((movie) => movie.cover)
      .map((movie) =>
        renderUrl(movie.href, { hasEn: enMovies.some((item) => item.slug === movie.slug) }),
      )
      .join("\n")}
  </urlset>
  `.trim()

  return new Response(result, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}
