import { copyFileSync, readFileSync } from "node:fs"
import sitemap from "@astrojs/sitemap"
import { JSDOM } from "jsdom"

export default function blogSitemap() {
  let config
  const lastmods = new Map()

  return [
    sitemap({
      i18n: { defaultLocale: "ko", locales: { ko: "ko", en: "en" } },
      filter(url) {
        const pathname = new URL(url).pathname
        const relativePath = pathname.slice(config.base.replace(/\/$/, "").length + 1)
        const file = new URL(`${relativePath}index.html`, config.outDir)
        const html = readFileSync(file, "utf8")
        const dom = new JSDOM(html.slice(0, html.indexOf("</head>") + 7))
        const document = dom.window.document
        const robots = document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? ""
        const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href")
        const redirect = document.querySelector('meta[http-equiv="refresh"]')
        const lastmod =
          document.querySelector('meta[property="article:modified_time"]') ??
          document.querySelector('meta[property="article:published_time"]')
        lastmods.set(url, lastmod?.getAttribute("content"))
        dom.window.close()
        return !redirect && !/\bnoindex\b/i.test(robots) && canonical === url
      },
      serialize(item) {
        // Tags are language-specific, even when their URL segments happen to match.
        if (/\/(?:en\/)?archives\/tag\//.test(new URL(item.url).pathname)) {
          item.links = undefined
        }
        const korean = item.links?.find((link) => link.lang === "ko")
        if (korean) {
          item.links = [...item.links, { lang: "x-default", url: korean.url }]
        }
        item.lastmod = lastmods.get(item.url)
        return item
      },
    }),
    {
      name: "blog-sitemap-metadata",
      hooks: {
        "astro:config:done": ({ config: resolved }) => {
          config = resolved
        },
        "astro:build:done": ({ dir }) => {
          // Keep previously submitted sitemap.xml URLs working without an HTML redirect.
          copyFileSync(new URL("sitemap-index.xml", dir), new URL("sitemap.xml", dir))
          lastmods.clear()
        },
      },
    },
  ]
}
