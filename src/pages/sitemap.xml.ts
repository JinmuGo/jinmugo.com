import { format } from "date-fns"
import type { Memo, Post } from "@/types/content"
import { getEnglishMemos, getKoreanMemos } from "@/utils/content/memos"
import { getEnglishPosts, getKoreanPosts } from "@/utils/content/posts"

export async function GET() {
  const siteUrl = import.meta.env.SITE
  const koPosts = await getKoreanPosts()
  const enPosts = await getEnglishPosts()
  const koMemos = await getKoreanMemos()
  const enMemos = await getEnglishMemos()

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
    ${renderUrl("/memos")}
    ${renderUrl("/posts")}
    ${renderUrl("/series")}
    ${renderUrl("/gallery")}
    ${renderUrl("/projects")}
    ${koPosts
      .map((post: Post) => {
        const lastMod = format(post.data.lastmod ?? post.data.date, "yyyy-MM-dd")
        const hasEn = enPosts.some((p: Post) => p.slug === post.slug)

        return renderUrl(post.href, { hasEn, lastMod })
      })
      .join("\n")}
    ${koMemos
      .map((memo: Memo) => {
        const lastMod = format(memo.data.lastmod ?? memo.data.date, "yyyy-MM-dd")
        const hasEn = enMemos.some((m: Memo) => m.slug === memo.slug)

        return renderUrl(memo.href, { hasEn, lastMod })
      })
      .join("\n")}
  </urlset>
  `.trim()

  return new Response(result, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}
