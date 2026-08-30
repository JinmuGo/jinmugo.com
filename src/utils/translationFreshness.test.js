import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import {
  findTranslationTargets,
  hashTranslationSource,
  syncTranslationCache,
} from "../../scripts/translate.js"

const temporaryDirectories = []

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  )
})

async function temporaryDirectory(prefix) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), prefix))
  temporaryDirectories.push(directory)
  return directory
}

function translationFor(source) {
  return `---\ntitle: English\ntranslationSourceHash: ${hashTranslationSource(source)}\n---\nTranslated`
}

describe("translation freshness", () => {
  it("detects changed sources and ignores cached translations for deleted sources", async () => {
    const contentDir = await temporaryDirectory("jinmu-translation-content-")
    const cacheDir = await temporaryDirectory("jinmu-translation-cache-")
    const postDir = path.join(contentDir, "post")
    const cachePostDir = path.join(cacheDir, "post")
    const source = "---\ntitle: 한국어\ndraft: false\n---\n원문"

    await fs.mkdir(postDir, { recursive: true })
    await fs.writeFile(path.join(postDir, "example.md"), source)
    await fs.writeFile(path.join(postDir, "example.en.md"), translationFor(source))

    expect((await findTranslationTargets({ contentDir })).targets).toHaveLength(0)

    await fs.writeFile(path.join(postDir, "example.md"), `${source}\n변경`)
    expect(
      (await findTranslationTargets({ contentDir })).targets.map((item) => item.relativePath),
    ).toEqual([path.join("post", "example.md")])

    await fs.mkdir(cachePostDir, { recursive: true })
    await fs.writeFile(path.join(cachePostDir, "deleted.en.md"), translationFor(source))
    const result = await syncTranslationCache({ mode: "restore", cacheDir, contentDir })

    expect(result).toEqual({ copied: 0, skipped: 1 })
    await expect(fs.access(path.join(postDir, "deleted.en.md"))).rejects.toThrow()
  })
})
