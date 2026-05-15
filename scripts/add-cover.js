#!/usr/bin/env node
// scripts/add-cover.js
//
// Fetch (or copy) a cover image, resize it to a consistent width, convert it
// to WebP, and save it into the matching content folder so it can be wired
// into frontmatter as `cover: ./cover.webp`.
//
// Usage:
//   pnpm cover <kind> <slug> <url-or-path>
//
//   kind:        book | movie | music
//   slug:        folder name under src/content/<kind>/<slug>/
//   url-or-path: full https:// URL or a local file path
//
// Examples:
//   pnpm cover book where-are-we-now https://image.aladin.co.kr/.../cover.jpg
//   pnpm cover book where-are-we-now ~/Downloads/cover.jpg
//   pnpm cover movie midsommar https://image.tmdb.org/.../poster.jpg
//   pnpm cover music kid-a ~/Downloads/album-art.png

import { access, mkdir, readFile, stat } from "node:fs/promises"
import { homedir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const KINDS = new Set(["book", "movie", "music"])
const TARGET_WIDTH = 600 // produces ~600×900 for 2:3 covers, 600×600 for 1:1 albums
const WEBP_QUALITY = 88
const OUTPUT_NAME = "cover.webp"

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(SCRIPT_DIR, "..")
const CONTENT_ROOT = join(REPO_ROOT, "src/content")

function usage() {
  console.error(`Usage: pnpm cover <kind> <slug> <url-or-path>

  kind:        book | movie | music
  slug:        folder under src/content/<kind>/<slug>/
  url-or-path: https:// URL or local file path

Examples:
  pnpm cover book where-are-we-now https://image.aladin.co.kr/.../cover.jpg
  pnpm cover book where-are-we-now ~/Downloads/cover.jpg
`)
  process.exit(1)
}

function expandHome(p) {
  if (p.startsWith("~/")) {
    return join(homedir(), p.slice(2))
  }
  return p
}

async function loadBuffer(input) {
  if (/^https?:\/\//i.test(input)) {
    const res = await fetch(input, {
      headers: {
        // Some image CDNs (Aladin, IMDB) reject requests without a UA.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      },
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText} fetching ${input}`)
    }
    return Buffer.from(await res.arrayBuffer())
  }
  const localPath = expandHome(input)
  return readFile(localPath)
}

async function ensureDir(path) {
  try {
    const s = await stat(path)
    if (!s.isDirectory()) {
      throw new Error(`Not a directory: ${path}`)
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      await mkdir(path, { recursive: true })
      return
    }
    throw err
  }
}

async function main() {
  const [kind, slug, source] = process.argv.slice(2)
  if (!kind || !slug || !source) {
    usage()
  }
  if (!KINDS.has(kind)) {
    console.error(`Unknown kind "${kind}". Expected one of: ${[...KINDS].join(", ")}`)
    process.exit(1)
  }

  const targetDir = join(CONTENT_ROOT, kind, slug)
  try {
    await access(targetDir)
  } catch {
    console.error(`Content folder not found: ${targetDir}`)
    console.error(`Create the entry first (e.g., ${targetDir}/${slug}.mdx), then re-run.`)
    process.exit(1)
  }

  console.log(`→ fetching: ${source}`)
  const buf = await loadBuffer(source)

  const targetPath = join(targetDir, OUTPUT_NAME)
  await ensureDir(targetDir)
  await sharp(buf)
    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(targetPath)

  const meta = await sharp(targetPath).metadata()
  const rel = targetPath.replace(`${REPO_ROOT}/`, "")
  console.log(
    `✓ saved ${rel} (${meta.width}×${meta.height}, ${kind === "music" ? "1:1" : "2:3"} expected)`,
  )
  console.log(`\nUpdate the entry's frontmatter:\n  cover: ./${OUTPUT_NAME}`)
}

main().catch((err) => {
  console.error(`✗ ${err.message}`)
  process.exit(1)
})
