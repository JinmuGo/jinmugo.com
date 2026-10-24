import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { verifyLinks } from "../../scripts/verify-links.js"

let distDir

function write(file, content) {
  const target = path.join(distDir, file)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, content)
}

afterEach(() => fs.rmSync(distDir, { recursive: true, force: true }))

describe("built link verifier", () => {
  it("resolves query/hash links and valid redirect pages", () => {
    distDir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-links-"))
    write(
      "index.html",
      '<link rel="canonical" href="https://jinmugo.com/"><a href="/target/?q=1#ok">Target</a><a href="https://example.com">External</a>',
    )
    write(
      "target/index.html",
      '<link rel="canonical" href="https://jinmugo.com/target/"><a href="/old/">Old</a>',
    )
    write(
      "old/index.html",
      '<meta http-equiv="refresh" content="0;url=/target/"><a href="/target/">Redirect</a>',
    )

    write(
      "sitemap-index.xml",
      "<sitemapindex><sitemap><loc>https://jinmugo.com/sitemap-0.xml</loc></sitemap></sitemapindex>",
    )
    write("sitemap-0.xml", "<urlset><url><loc>https://jinmugo.com/target/</loc></url></urlset>")
    expect(verifyLinks(distDir)).toMatchObject({ internalLinks: 3, redirects: 1 })
    write("sitemap-0.xml", "<urlset><url><loc>https://jinmugo.com/missing/</loc></url></urlset>")
    expect(() => verifyLinks(distDir)).toThrow("sitemap-0.xml: URL does not exist: /missing/")
  })

  it("rejects broken internal links and images", () => {
    distDir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-links-"))
    write(
      "index.html",
      '<link rel="canonical" href="https://jinmugo.com/"><a href="/missing/">Missing</a><img src="/missing.png">',
    )

    expect(() => verifyLinks(distDir)).toThrow(/broken internal link[\s\S]*broken internal image/)
  })

  it("rejects old-domain canonical and sitemap URLs even when paths exist", () => {
    distDir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-links-"))
    write("index.html", '<link rel="canonical" href="https://jinmu.me/">')
    write("sitemap.xml", "<urlset><url><loc>https://jinmu.me/</loc></url></urlset>")

    expect(() => verifyLinks(distDir)).toThrow(
      /canonical must use https:\/\/jinmugo.com[\s\S]*sitemap.xml: URL must use/,
    )
  })
})
