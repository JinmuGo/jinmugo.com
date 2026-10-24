import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { expect, test } from "vitest"
import { syncContent } from "../../scripts/build-content.js"

test("syncs one export without deleting collections that were not exported", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "jinmu-content-sync-"))
  const cacheDir = path.join(rootDir, "cache")
  const contentDir = path.join(rootDir, "content")

  try {
    fs.mkdirSync(path.join(cacheDir, "memo"), { recursive: true })
    fs.mkdirSync(path.join(contentDir, "post"), { recursive: true })
    fs.mkdirSync(path.join(contentDir, "banner"), { recursive: true })

    fs.writeFileSync(path.join(cacheDir, "memo/note.md"), "[Section](note.md#section)")
    fs.writeFileSync(path.join(cacheDir, "memo/created.png"), "created")
    fs.writeFileSync(path.join(cacheDir, "memo/updated.png"), "updated")
    fs.writeFileSync(path.join(contentDir, "post/updated.png"), "old")
    fs.writeFileSync(path.join(contentDir, "post/deleted.mdx"), "deleted")
    fs.writeFileSync(path.join(contentDir, "banner/protected.mdx"), "protected")

    syncContent(cacheDir, contentDir)

    expect(fs.readFileSync(path.join(contentDir, "post/note.mdx"), "utf8")).toBe(
      "[Section](#section)",
    )
    expect(fs.existsSync(path.join(contentDir, "post/note.md"))).toBe(false)
    expect(fs.readFileSync(path.join(contentDir, "post/created.png"), "utf8")).toBe("created")
    expect(fs.readFileSync(path.join(contentDir, "post/updated.png"), "utf8")).toBe("updated")
    expect(fs.existsSync(path.join(contentDir, "post/deleted.mdx"))).toBe(false)
    expect(fs.readFileSync(path.join(contentDir, "banner/protected.mdx"), "utf8")).toBe("protected")
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true })
  }
})
