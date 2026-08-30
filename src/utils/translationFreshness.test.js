import { execFile } from "node:child_process"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { promisify } from "node:util"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  findTranslationTargets,
  hashTranslationSource,
  syncTranslationCache,
  translateContent,
} from "../../scripts/translate.js"

const temporaryDirectories = []
const execFileAsync = promisify(execFile)

afterEach(async () => {
  vi.unstubAllGlobals()
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  )
})

it("quotes translated frontmatter strings that contain YAML syntax", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        translations: [
          { text: 'Git Squash vs Fixup: When to Use "$&"' },
          { text: "Summary: safe and parseable" },
          { text: "Translated body" },
        ],
      }),
    }),
  )

  const translated = await translateContent({
    content: "---\ntitle: 제목\nsummary: 요약\ndraft: false\n---\n본문",
    sourceHash: "a".repeat(64),
    apiKey: "test",
  })

  expect(translated).toContain('title: "Git Squash vs Fixup: When to Use \\"$&\\""')
  expect(translated).toContain('summary: "Summary: safe and parseable"')
  expect(translated).toContain("---\nTranslated body")
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

  it("excludes manual app content and prefers a current target over cache", async () => {
    const contentDir = await temporaryDirectory("jinmu-translation-content-")
    const cacheDir = await temporaryDirectory("jinmu-translation-cache-")
    const postDir = path.join(contentDir, "post")
    const appDir = path.join(contentDir, "app")
    const cachePostDir = path.join(cacheDir, "post")
    const cacheAppDir = path.join(cacheDir, "app")
    const source = "---\ntitle: 한국어\ndraft: false\n---\n원문"
    const targetPath = path.join(postDir, "example.en.md")
    const manualTranslation = translationFor(source).replace("Translated", "Manual edit")
    const cachedTranslation = translationFor(source).replace("Translated", "Cached translation")

    await Promise.all([
      fs.mkdir(postDir, { recursive: true }),
      fs.mkdir(appDir, { recursive: true }),
      fs.mkdir(cachePostDir, { recursive: true }),
      fs.mkdir(cacheAppDir, { recursive: true }),
    ])
    await fs.writeFile(path.join(postDir, "example.md"), source)
    await fs.writeFile(targetPath, manualTranslation)
    await fs.writeFile(path.join(cachePostDir, "example.en.md"), cachedTranslation)
    await fs.writeFile(path.join(appDir, "resume.md"), source)
    await fs.writeFile(path.join(appDir, "resume.en.md"), "Manual app content")
    await fs.writeFile(path.join(cacheAppDir, "resume.en.md"), cachedTranslation)

    expect(await findTranslationTargets({ contentDir })).toMatchObject({
      originals: [path.join("post", "example.md")],
      targets: [],
    })
    expect(
      await findTranslationTargets({
        contentDir,
        stagedOnly: true,
        stagedFiles: ["obsidian/app/resume.md"],
      }),
    ).toEqual({ originals: [], targets: [] })

    expect(await syncTranslationCache({ mode: "restore", cacheDir, contentDir })).toEqual({
      copied: 0,
      skipped: 1,
    })
    expect(await fs.readFile(targetPath, "utf8")).toBe(manualTranslation)
    expect(await fs.readFile(path.join(appDir, "resume.en.md"), "utf8")).toBe("Manual app content")

    await fs.writeFile(targetPath, "Manual edit without a source hash")
    expect(await syncTranslationCache({ mode: "restore", cacheDir, contentDir })).toEqual({
      copied: 0,
      skipped: 1,
    })
    expect(await fs.readFile(targetPath, "utf8")).toBe("Manual edit without a source hash")

    await fs.writeFile(targetPath, translationFor(`${source}\nold`))
    expect(await syncTranslationCache({ mode: "restore", cacheDir, contentDir })).toEqual({
      copied: 1,
      skipped: 0,
    })
    expect(await fs.readFile(targetPath, "utf8")).toBe(cachedTranslation)
  })

  it("rejects orphaned translations and missing source hashes", async () => {
    const contentDir = await temporaryDirectory("jinmu-content-doctor-")
    const postDir = path.join(contentDir, "post")
    await fs.mkdir(postDir, { recursive: true })
    await fs.writeFile(
      path.join(postDir, "orphan.en.md"),
      `---\ntitle: Orphan\ndate: 2026-08-30\ntranslationSourceHash: ${"0".repeat(64)}\n---\nOrphan`,
    )
    await fs.writeFile(
      path.join(postDir, "paired.md"),
      "---\ntitle: 원문\ndate: 2026-08-30\n---\n원문",
    )
    await fs.writeFile(
      path.join(postDir, "paired.en.md"),
      "---\ntitle: Translation\ndate: 2026-08-30\n---\nTranslation",
    )

    let failure
    try {
      await execFileAsync(process.execPath, ["scripts/content-doctor.js"], {
        env: { ...process.env, OBSIDIAN_VAULT_PATH: contentDir },
      })
    } catch (error) {
      failure = error
    }

    expect(failure?.stderr).toContain("English translation has no exact source file match")
    expect(failure?.stderr).toContain("missing valid translationSourceHash")
  })
})
