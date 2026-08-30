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
      '<link rel="canonical" href="https://jinmu.me/"><a href="/target/?q=1#ok">Target</a><a href="https://example.com">External</a>',
    )
    write(
      "target/index.html",
      '<link rel="canonical" href="https://jinmugo.github.io/target/"><a href="/old/">Old</a>',
    )
    write(
      "old/index.html",
      '<meta http-equiv="refresh" content="0;url=/target/"><a href="/target/">Redirect</a>',
    )
    write("archives/index.html", "<p>No Korean archives</p>")
    write("en/archives/index.html", "<p>No English archives</p>")

    expect(verifyLinks(distDir)).toMatchObject({ internalLinks: 3, redirects: 1 })
  })

  it("rejects broken and legacy archive links", () => {
    distDir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-links-"))
    write(
      "index.html",
      '<link rel="canonical" href="https://jinmu.me/"><a href="/missing/">Missing</a><a href="/archives/tag/Open%20Source/">Legacy</a><img src="/missing.png">',
    )
    write(
      "archives/index.html",
      '<a data-archive-label="Open Source" href="/archives/tag/open-source/">Open Source</a>',
    )
    write("en/archives/index.html", "<p>No English archives</p>")
    write("archives/tag/open-source/index.html", "<p>Canonical archive</p>")
    write(
      "archives/tag/Open Source/index.html",
      '<meta http-equiv="refresh" content="0;url=/archives/tag/open-source/">',
    )

    expect(() => verifyLinks(distDir)).toThrow(
      /broken internal link[\s\S]*legacy archive redirect[\s\S]*broken internal image/,
    )
  })

  it("derives the generated archive redirect count", () => {
    distDir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-links-"))
    write(
      "archives/index.html",
      '<a data-archive-label="Open Source" href="/archives/tag/open-source/">Open Source</a>',
    )
    write("en/archives/index.html", "<p>No English archives</p>")
    write("archives/tag/open-source/index.html", "<p>Canonical archive</p>")
    write(
      "archives/tag/Open Source/index.html",
      '<meta http-equiv="refresh" content="0;url=/archives/tag/open-source/">',
    )

    expect(verifyLinks(distDir).archiveRedirectCounts).toEqual({
      ko: 1,
      en: 0,
    })
  })
})
