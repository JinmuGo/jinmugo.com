import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { JSDOM } from "jsdom"
import { expect, it } from "vitest"
import blogSitemap from "../../scripts/sitemap.js"

it("generates valid official sitemaps with indexable pages, translations and a legacy alias", async () => {
  const dir = pathToFileURL(`${fs.mkdtempSync(path.join(os.tmpdir(), "blog-sitemap-"))}/`)
  const site = "https://jinmugo.com"
  const routes = {
    "": "",
    "en/": "",
    "posts/a&b/": '<meta property="article:published_time" content="2026-01-01T00:00:00Z">',
    "en/posts/a&b/": '<meta property="article:modified_time" content="2026-02-01T00:00:00Z">',
    "portfolio/": "",
    "archives/tag/shared/": "",
    "en/archives/tag/shared/": "",
    "archives/tag/solo/": '<meta name="robots" content="noindex,follow">',
    "old/": '<meta http-equiv="refresh" content="0;url=/">',
    "legacy/": '<link rel="canonical" href="https://jinmugo.com/">',
    "404/": "",
    "en/404/": "",
  }
  try {
    for (const [route, metadata] of Object.entries(routes)) {
      const file = new URL(`${route}index.html`, dir)
      fs.mkdirSync(new URL(".", file), { recursive: true })
      fs.writeFileSync(
        file,
        `<html><head>${metadata}<link rel="canonical" href="${site}/${route}"></head></html>`,
      )
    }
    const integrations = blogSitemap()
    const config = {
      site,
      base: "/",
      outDir: dir,
      trailingSlash: "always",
      build: { format: "directory" },
    }
    for (const integration of integrations) {
      await integration.hooks["astro:config:done"]?.({ config })
      await integration.hooks["astro:routes:resolved"]?.({ routes: [] })
    }
    const logger = {
      info() {},
      warn(message) {
        throw new Error(message)
      },
      error(message) {
        throw new Error(message)
      },
    }
    for (const integration of integrations) {
      await integration.hooks["astro:build:done"]({
        dir,
        pages: Object.keys(routes).map((pathname) => ({ pathname })),
        logger,
      })
    }
    const index = fs.readFileSync(new URL("sitemap-index.xml", dir), "utf8")
    expect(fs.readFileSync(new URL("sitemap.xml", dir), "utf8")).toBe(index)
    const indexDom = new JSDOM(index, { contentType: "text/xml" })
    expect(indexDom.window.document.querySelector("loc").textContent).toBe(`${site}/sitemap-0.xml`)
    indexDom.window.close()
    const xml = fs.readFileSync(new URL("sitemap-0.xml", dir), "utf8")
    const dom = new JSDOM(xml, { contentType: "text/xml" })
    const entries = [...dom.window.document.getElementsByTagName("url")]
    expect(entries.map((entry) => entry.querySelector("loc").textContent).sort()).toEqual(
      Object.keys(routes)
        .slice(0, 7)
        .map((route) => `${site}/${route}`)
        .sort(),
    )
    const post = entries.find(
      (entry) => entry.querySelector("loc").textContent === `${site}/posts/a&b/`,
    )
    expect(post.querySelector("lastmod").textContent).toBe("2026-01-01T00:00:00.000Z")
    expect(
      [...post.getElementsByTagNameNS("*", "link")]
        .map((link) => link.getAttribute("hreflang"))
        .sort(),
    ).toEqual(["en", "ko", "x-default"])
    for (const entry of entries.filter((entry) =>
      /portfolio|archives\/tag/.test(entry.querySelector("loc").textContent),
    )) {
      expect(entry.getElementsByTagNameNS("*", "link").length).toBe(0)
    }
    dom.window.close()
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
