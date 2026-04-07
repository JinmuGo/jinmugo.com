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
    koHref: string,
    {
      enHref,
      lastMod,
    }: {
      enHref?: string
      lastMod?: string
    } = {},
  ) => {
    const fullEnHref = enHref ?? undefined
    let result = ""

    result += "<url>"
    result += `<loc>${siteUrl}${koHref}</loc>`
    if (lastMod) {
      result += `<lastmod>${lastMod}</lastmod>`
    }
    result += `<xhtml:link rel="alternate" hreflang="ko" href="${siteUrl}${koHref}"/>`
    if (fullEnHref) {
      result += `<xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${fullEnHref}"/>`
    }
    result += `<xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${koHref}"/>`
    result += "</url>"

    if (fullEnHref) {
      result += "<url>"
      result += `<loc>${siteUrl}${fullEnHref}</loc>`
      if (lastMod) {
        result += `<lastmod>${lastMod}</lastmod>`
      }
      result += `<xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${fullEnHref}"/>`
      result += `<xhtml:link rel="alternate" hreflang="ko" href="${siteUrl}${koHref}"/>`
      result += "</url>"
    }

    return result
  }
  const result = `
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
    ${renderUrl("/", { enHref: "/en" })}
    ${renderUrl("/about", { enHref: "/en/about" })}
    ${renderUrl("/archives", { enHref: "/en/archives" })}
    ${renderUrl("/memos", { enHref: "/en/memos" })}
    ${renderUrl("/posts", { enHref: "/en/posts" })}
    ${renderUrl("/series", { enHref: "/en/series" })}
    ${renderUrl("/gallery", { enHref: "/en/gallery" })}
    ${renderUrl("/projects", { enHref: "/en/projects" })}
    ${koPosts
      .map((post: Post) => {
        const lastMod = format(post.data.lastmod ?? post.data.date, "yyyy-MM-dd")
        const enPost = enPosts.find((p: Post) => p.slug === post.slug)

        return renderUrl(post.href, { enHref: enPost?.href, lastMod })
      })
      .join("\n")}
    ${koMemos
      .map((memo: Memo) => {
        const lastMod = format(memo.data.lastmod ?? memo.data.date, "yyyy-MM-dd")
        const enMemo = enMemos.find((m: Memo) => m.slug === memo.slug)

        return renderUrl(memo.href, { enHref: enMemo?.href, lastMod })
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
