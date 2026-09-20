import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs"
import sitemap from "@astrojs/sitemap"
import { JSDOM } from "jsdom"

export default function blogSitemap() {
  let config
  const lastmods = new Map()

  return [
    sitemap({
      entryLimit: 50000,
      namespaces: { news: false, xhtml: false, image: false, video: false },
      filter(url) {
        const pathname = new URL(url).pathname
        if (/^\/(?:en\/)?(?:404|500)\/?$/.test(pathname)) {
          return false
        }
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
        const pathname = new URL(item.url).pathname.replace(/^\/en(?=\/)/, "")
        const isHome = pathname === "/"
        item.lastmod = lastmods.get(item.url)
        item.priority = isHome ? 1 : 0.8
        item.changefreq = isHome ? "daily" : item.lastmod ? undefined : "weekly"
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
          // ponytail: one file supports 50,000 URLs; use the index if the blog outgrows it.
          if (existsSync(new URL("sitemap-1.xml", dir))) {
            throw new Error(
              "Single sitemap exceeds 50,000 URLs; switch discovery to sitemap-index.xml",
            )
          }
          const xml = readFileSync(new URL("sitemap-0.xml", dir), "utf8")
            .replace(/></g, ">\n<")
            .replace(/^<\/?url>/gm, "  $&")
            .replace(/^<(loc|lastmod|changefreq|priority)>/gm, "    <$1>")
          writeFileSync(new URL("sitemap.xml", dir), `${xml.trim()}\n`)
          unlinkSync(new URL("sitemap-index.xml", dir))
          unlinkSync(new URL("sitemap-0.xml", dir))
          lastmods.clear()
        },
      },
    },
  ]
}
