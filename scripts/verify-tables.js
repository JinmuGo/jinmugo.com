import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, "..")
const contentDir = path.join(repoRoot, "src", "content")
const distDir = path.join(repoRoot, "dist")

const COLLECTION_TO_PATH = {
  post: "posts",
  weekly: "weekly",
  book: "library/books",
  movie: "library/movies",
}

function getAllMdxFiles(dir) {
  const files = []
  if (!fs.existsSync(dir)) {
    return files
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getAllMdxFiles(fullPath))
    } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

function extractBodyWithoutCodeBlocks(content) {
  // Replace fenced code blocks with placeholders to ignore table-like syntax inside them.
  const codeBlocks = []
  const withoutCode = content.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match)
    return `\n__CODE_BLOCK_${codeBlocks.length - 1}__\n`
  })
  return withoutCode
}

function hasGfmTable(content) {
  const body = extractBodyWithoutCodeBlocks(content)
  const lines = body.split(/\r?\n/)

  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].trim()
    const nextLine = lines[i + 1].trim()

    if (!/^\|.*\|$/.test(line)) {
      continue
    }
    if (!/^\|[-:\s|]+\|$/.test(nextLine)) {
      continue
    }

    return true
  }

  return false
}

function resolveDistHtml(contentPath) {
  const relative = path.relative(contentDir, contentPath).replace(/\\/g, "/")
  const [collection, ...restParts] = relative.split("/")
  const basePath = COLLECTION_TO_PATH[collection]
  if (!basePath) {
    return null
  }

  const fileName = restParts[restParts.length - 1]
  const isEnglish = fileName.endsWith(".en.mdx") || fileName.endsWith(".en.md")
  const slug = fileName.replace(/\.(en\.)?(mdx|md)$/, "")

  const prefix = isEnglish ? "en/" : ""
  return path.join(distDir, prefix + basePath, slug, "index.html")
}

function main() {
  const files = getAllMdxFiles(contentDir)
  const failures = []
  const checked = []

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8")
    if (!hasGfmTable(content)) {
      continue
    }

    const distHtml = resolveDistHtml(file)
    if (!distHtml) {
      console.warn(`Skipping unknown collection for ${path.relative(repoRoot, file)}`)
      continue
    }

    checked.push({ source: path.relative(repoRoot, file), dist: path.relative(repoRoot, distHtml) })

    if (!fs.existsSync(distHtml)) {
      failures.push({
        source: path.relative(repoRoot, file),
        dist: path.relative(repoRoot, distHtml),
        reason: "missing",
      })
      continue
    }

    const html = fs.readFileSync(distHtml, "utf-8")
    if (!/<table[\s>]/i.test(html)) {
      failures.push({
        source: path.relative(repoRoot, file),
        dist: path.relative(repoRoot, distHtml),
        reason: "no-table-tag",
      })
    }
  }

  console.log(`Checked ${checked.length} page(s) containing GFM tables.`)
  if (checked.length > 0) {
    for (const item of checked) {
      console.log(`  - ${item.source} → ${item.dist}`)
    }
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} page(s) failed table rendering verification:`)
    for (const failure of failures) {
      if (failure.reason === "missing") {
        console.error(`  - ${failure.source}: expected ${failure.dist} but file is missing`)
      } else {
        console.error(
          `  - ${failure.source}: GFM table found but ${failure.dist} has no <table> tag`,
        )
      }
    }
    process.exit(1)
  }

  console.log("\nAll GFM tables are rendered as HTML <table> elements.")
}

main()
