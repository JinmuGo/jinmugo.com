// REF: https://github.com/MaxKim-J/maxkim-j.github.io

import { execSync } from "node:child_process"
import { createHash } from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"

const TARGET_LANG = "en-US"
const CONTENT_DIR_PATH = path.resolve("obsidian")
const TRANSLATION_HASH_FIELD = "translationSourceHash"

function getStagedFiles() {
  try {
    return execSync("git diff --cached --name-only", { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean)
  } catch (error) {
    console.warn("Git staged files를 가져오는데 실패했습니다:", error.message)
    return []
  }
}

async function findMdFiles(dirPath) {
  const files = []

  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true })
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name)
      if (item.isDirectory() && !item.name.startsWith(".")) {
        const nestedFiles = await findMdFiles(fullPath)
        files.push(...nestedFiles)
      } else if (item.isFile() && item.name.endsWith(".md")) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error
    }
  }

  return files
}

function isTranslation(relativePath) {
  return relativePath.endsWith(".en.md") || relativePath.endsWith(".en-US.md")
}

function isAutomaticTranslationPath(relativePath) {
  return !/^app[\\/]/.test(relativePath)
}

function translationPathFor(relativePath) {
  return relativePath.replace(/\.md$/, ".en.md")
}

function sourcePathFor(relativePath) {
  return relativePath.replace(/\.en(?:-US)?\.md$/, ".md")
}

async function readIfExists(filePath) {
  try {
    return await fs.readFile(filePath, "utf8")
  } catch (error) {
    if (error.code === "ENOENT") {
      return null
    }
    throw error
  }
}

export function hashTranslationSource(content) {
  return createHash("sha256").update(content).digest("hex")
}

export function getTranslationSourceHash(content) {
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]
  return frontmatter?.match(
    new RegExp(`^${TRANSLATION_HASH_FIELD}:\\s*([a-f0-9]{64})\\s*$`, "m"),
  )?.[1]
}

function setFrontmatterField(frontmatter, key, value) {
  const line = `${key}: ${value}`
  const fieldPattern = new RegExp(`^${key}:.*$`, "m")
  return fieldPattern.test(frontmatter)
    ? frontmatter.replace(fieldPattern, line)
    : `${frontmatter}\n${line}`
}

function isDraft(content) {
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]
  return /^draft:\s*true\s*$/m.test(frontmatter ?? "")
}

export async function findTranslationTargets({
  contentDir = CONTENT_DIR_PATH,
  stagedOnly = false,
  stagedFiles,
} = {}) {
  let originalRelativePaths

  if (stagedOnly) {
    originalRelativePaths = (stagedFiles ?? getStagedFiles())
      .filter(
        (file) => file.startsWith("obsidian/") && file.endsWith(".md") && !isTranslation(file),
      )
      .map((file) => file.slice("obsidian/".length))
      .filter(isAutomaticTranslationPath)
  } else {
    const allFiles = await findMdFiles(contentDir)
    originalRelativePaths = allFiles
      .map((file) => path.relative(contentDir, file))
      .filter((file) => !isTranslation(file) && isAutomaticTranslationPath(file))
  }

  const originals = []
  const targets = []

  for (const relativePath of [...new Set(originalRelativePaths)].sort()) {
    const sourcePath = path.join(contentDir, relativePath)
    const content = await readIfExists(sourcePath)
    if (content === null) {
      continue
    }

    originals.push(relativePath)
    if (isDraft(content)) {
      continue
    }

    const sourceHash = hashTranslationSource(content)
    const translatedRelativePath = translationPathFor(relativePath)
    const translatedContent = await readIfExists(path.join(contentDir, translatedRelativePath))

    if (translatedContent === null || getTranslationSourceHash(translatedContent) !== sourceHash) {
      targets.push({
        relativePath,
        sourcePath,
        translatedRelativePath,
        content,
        sourceHash,
      })
    }
  }

  return { originals, targets }
}

export async function syncTranslationCache({ mode, cacheDir, contentDir = CONTENT_DIR_PATH }) {
  if (mode !== "restore" && mode !== "save") {
    throw new Error(`Unsupported translation cache mode: ${mode}`)
  }

  const sourceRoot = mode === "restore" ? cacheDir : contentDir
  const targetRoot = mode === "restore" ? contentDir : cacheDir
  const translatedFiles = (await findMdFiles(sourceRoot))
    .map((file) => path.relative(sourceRoot, file))
    .filter((file) => file.endsWith(".en.md") && isAutomaticTranslationPath(file))
    .sort()

  let copied = 0
  let skipped = 0

  for (const relativePath of translatedFiles) {
    const sourceContent = await readIfExists(path.join(contentDir, sourcePathFor(relativePath)))
    const translatedContent = await readIfExists(path.join(sourceRoot, relativePath))
    const sourceHash = sourceContent === null ? undefined : hashTranslationSource(sourceContent)

    if (
      sourceContent === null ||
      translatedContent === null ||
      getTranslationSourceHash(translatedContent) !== sourceHash
    ) {
      skipped++
      continue
    }

    const targetPath = path.join(targetRoot, relativePath)
    if (mode === "restore") {
      const targetContent = await readIfExists(targetPath)
      const targetHash =
        targetContent === null ? undefined : getTranslationSourceHash(targetContent)
      if (targetContent !== null && (!targetHash || targetHash === sourceHash)) {
        skipped++
        continue
      }
    }
    await fs.mkdir(path.dirname(targetPath), { recursive: true })
    await fs.copyFile(path.join(sourceRoot, relativePath), targetPath)
    copied++
  }

  return { copied, skipped }
}

function cleanupMarkdown(text) {
  return text
    .replace(/^\\#+/gm, (match) => match.replace(/\\/g, ""))
    .replace(/\\\*/g, "*")
    .replace(/\\_/g, "_")
    .replace(/\\\[/g, "[")
    .replace(/\\\]/g, "]")
    .replace(/\\!/g, "!")
    .replace(/\\`/g, "`")
    .replace(/\\---/g, "---")
}

export async function translateContent({ content, sourceHash, apiKey }) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  let frontmatter = frontmatterMatch?.[1] ?? ""
  const body = frontmatterMatch?.[2] ?? content
  const frontmatterFields = ["title", "summary", "coverAlt", "oneLiner"].map((key) => ({
    key,
    value: frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? "",
  }))
  const texts = [
    ...frontmatterFields.filter((field) => field.value).map((field) => field.value),
    body,
  ]
  const params = new URLSearchParams()

  for (const text of texts) {
    params.append("text", text)
  }
  params.append("target_lang", TARGET_LANG)
  params.append("source_lang", "KO")

  const response = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
    throw new Error(`DeepL HTTP ${response.status}: ${errorData.message ?? response.statusText}`)
  }

  const data = await response.json()
  if (!Array.isArray(data.translations) || data.translations.length !== texts.length) {
    throw new Error("DeepL 응답 개수가 요청과 일치하지 않습니다.")
  }

  let translationIndex = 0
  for (const field of frontmatterFields) {
    if (!field.value) {
      continue
    }
    frontmatter = frontmatter.replace(
      new RegExp(`^${field.key}:.+$`, "m"),
      () => `${field.key}: ${JSON.stringify(data.translations[translationIndex].text)}`,
    )
    translationIndex++
  }

  frontmatter = setFrontmatterField(frontmatter, TRANSLATION_HASH_FIELD, sourceHash)
  const translatedBody = cleanupMarkdown(data.translations[translationIndex].text)
  return `---\n${frontmatter}\n---\n${translatedBody}`
}

function getOptionValue(args, option) {
  const index = args.indexOf(option)
  return index >= 0 ? args[index + 1] : undefined
}

export async function main(args = process.argv.slice(2)) {
  const restoreCacheDir = getOptionValue(args, "--restore-cache")
  const saveCacheDir = getOptionValue(args, "--save-cache")

  if (restoreCacheDir || saveCacheDir) {
    const mode = restoreCacheDir ? "restore" : "save"
    const cacheDir = path.resolve(restoreCacheDir ?? saveCacheDir)
    const result = await syncTranslationCache({ mode, cacheDir })
    console.info(`Translation cache ${mode}: copied ${result.copied}, skipped ${result.skipped}`)
    return
  }

  const { originals, targets } = await findTranslationTargets({
    stagedOnly: args.includes("--staged-only"),
  })
  const characterCount = targets.reduce((sum, target) => sum + target.content.length, 0)

  console.info(`전체 한국어 콘텐츠 ${originals.length}개`)
  console.info(`번역이 필요하거나 오래된 콘텐츠 ${targets.length}개 (${characterCount}자)`)

  if (args.includes("--dry-run") || targets.length === 0) {
    return
  }

  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) {
    throw new Error("DEEPL_API_KEY 환경 변수가 설정되지 않았습니다.")
  }

  for (const [index, target] of targets.entries()) {
    console.info(`(${index + 1}/${targets.length}) ${target.relativePath} 번역 시작`)
    const translatedContent = await translateContent({
      content: target.content,
      sourceHash: target.sourceHash,
      apiKey,
    })
    const translatedPath = path.join(CONTENT_DIR_PATH, target.translatedRelativePath)
    await fs.mkdir(path.dirname(translatedPath), { recursive: true })
    await fs.writeFile(translatedPath, translatedContent)
    console.info(`(${index + 1}/${targets.length}) ${target.translatedRelativePath} 번역 완료`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message ?? error)
    process.exitCode = 1
  })
}
