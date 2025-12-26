// REF: https://github.com/MaxKim-J/maxkim-j.github.io

import { execSync } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"

// Default to en-US for better consistency
const TARGET_LANG = "en-US"
const CONTENT_DIR_PATH = path.resolve("blog_obsidian")

/* global URLSearchParams */

// Get staged files from git
const getStagedFiles = () => {
  try {
    const output = execSync("git diff --cached --name-only", { encoding: "utf8" })
    return output.trim().split("\n").filter(Boolean)
  } catch (error) {
    console.warn("Git staged files를 가져오는데 실패했습니다:", error.message)
    return []
  }
}

// Recursive function to find all .md files in a directory
const findMdFilesRecursively = async (dirPath) => {
  const files = []

  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true })

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name)

      if (item.isDirectory()) {
        // Skip .git and other hidden directories
        if (!item.name.startsWith(".")) {
          const subFiles = await findMdFilesRecursively(fullPath)
          files.push(...subFiles)
        }
      } else if (item.isFile() && path.extname(item.name) === ".md") {
        files.push(fullPath)
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}:`, error.message)
  }

  return files
}

const isDraft = async (filePath) => {
  try {
    const absolutePath = path.resolve(CONTENT_DIR_PATH, filePath)
    const fileContent = await fs.readFile(absolutePath, "utf8")
    // More robust regex for frontmatter
    const frontmatterMatch = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (frontmatterMatch?.[1]) {
      const frontmatter = frontmatterMatch[1]
      // draft: true 또는 draft:true 패턴을 정확히 매칭
      const draftMatch = frontmatter.match(/^draft:\s*true$/m)
      return !!draftMatch
    }
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath} to check draft status:`, error.message)
  }
  return false
}

const validateTranslateNecessity = async ({ lang, stagedOnly = false }) => {
  let targetFiles = []

  if (stagedOnly) {
    // staged된 파일들 중에서 한국어 마크다운 파일만 필터링
    const stagedFiles = getStagedFiles()
    const koreanMdFiles = stagedFiles.filter(
      (file) =>
        file.includes("blog_obsidian") && file.endsWith(".md") && !file.endsWith(`.${lang}.md`), // lang이 en-US일 경우 .en-US.md 체크
    )
    // blog/blog_obsidian/ 경로에서 blog_obsidian/ 부분만 추출
    targetFiles = koreanMdFiles
      .map((file) => {
        const match = file.match(/blog_obsidian\/(.+)/)
        return match ? match[1] : null
      })
      .filter(Boolean)
  } else {
    // 기존 로직: 모든 파일 검사
    const allMdFiles = await findMdFilesRecursively(CONTENT_DIR_PATH)
    const allMdFilesRelative = allMdFiles.map((file) => path.relative(CONTENT_DIR_PATH, file))

    // lang extension check (.en.md vs .en-US.md handling)
    // We strictly look for exactly `.${lang}.md`
    const allOriginalBlogContents = allMdFilesRelative.filter(
      (file) => !file.includes(`.en.`) && !file.includes(`.en-US.`),
    )
    const allTranslatedBlogContents = allMdFilesRelative
      .filter((file) => file.endsWith(`.${lang}.md`))
      .map((file) => file.replace(`.${lang}.md`, ".md"))

    targetFiles = allOriginalBlogContents.filter(
      (file) => !allTranslatedBlogContents.includes(file),
    )
  }

  // Draft 파일 제외
  const finalTargetFiles = []
  for (const file of targetFiles) {
    if (!(await isDraft(file))) {
      finalTargetFiles.push(file)
    } else {
      console.info(`번역 스킵(draft: true): ${file}`)
    }
  }

  return { allOriginalBlogContents: targetFiles, allNotYetTranslatedBlogContents: finalTargetFiles }
}

const parseMdxFileContent = async (contentName) => {
  const contentPath = path.resolve(CONTENT_DIR_PATH, contentName)
  const fileString = await fs.readFile(contentPath, "utf8")
  return { content: fileString, path: contentPath }
}

function cleanupMarkdown(text) {
  return (
    text
      // Fix escaped headers
      .replace(/^\\#+/gm, (match) => match.replace(/\\/g, ""))
      // Fix escaped bold/italic
      .replace(/\\\*/g, "*")
      .replace(/\\_/g, "_")
      // Fix escaped links
      .replace(/\\\[/g, "[")
      .replace(/\\\]/g, "]")
      // Fix escaped images
      .replace(/\\!/g, "!")
      // Fix code blocks
      .replace(/\\`/g, "`")
      // Restore frontmatter separators if they were mangled (though we handle FM separately now)
      .replace(/\\---/g, "---")
  )
}

async function main() {
  console.info("DeepL API로 블로그 글 번역을 합니다.")

  // .env 파일 로드를 위해 dotenv 확인 (node --env-file을 쓰더라도 여기서 확인 가능)
  const DEEPL_API_KEY = process.env.DEEPL_API_KEY

  // API 키 검증
  if (!DEEPL_API_KEY) {
    console.error("Error: DEEPL_API_KEY 환경 변수가 설정되지 않았습니다.")
    process.exit(1)
  }

  // 커맨드 라인 인자로 stagedOnly 옵션 확인
  const stagedOnly = process.argv.includes("--staged-only")

  const { allOriginalBlogContents, allNotYetTranslatedBlogContents } =
    await validateTranslateNecessity({
      lang: "en", // Check against 'en' since we might be migrating or sticking to 'en' file extension but 'en-US' content
      stagedOnly,
    })

  // We want to use 'en' as the file extension to match existing convention if possible,
  // OR switch to 'en-US'. The existing files are .en.md. Let's stick to .en.md for filename, but requested en-US from DeepL.
  // Actually, let's stick to 'en' extension to avoid breaking links/logic elsewhere.
  const FILE_LANG_EXT = "en"

  console.info(`전체 한국어 컨텐츠 ${allOriginalBlogContents.length}개`)
  console.info(
    `${TARGET_LANG}로 번역이 안 된 블로그 컨텐츠 ${allNotYetTranslatedBlogContents.length}개를 번역합니다.`,
  )
  console.info()

  const translateTargetContents = await Promise.all(
    allNotYetTranslatedBlogContents.map((content) => parseMdxFileContent(content)),
  )

  const count = allNotYetTranslatedBlogContents.length
  let idx = 0

  for (const targetContents of translateTargetContents) {
    const { content, path } = targetContents
    const start = performance.now()
    console.info()
    console.info(`-----------------------`)
    console.info(`(${idx + 1}/${count}) ${path} 번역 시작`)

    try {
      // Robust frontmatter extraction
      const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
      const match = content.match(frontmatterRegex)

      let frontmatter = ""
      let body = content
      let hasFrontmatter = false

      if (match) {
        frontmatter = match[1]
        body = match[2]
        hasFrontmatter = true
      }

      // Fields to translate from frontmatter
      let title = ""
      let summary = ""

      if (hasFrontmatter) {
        // Simple extraction for title and summary
        const titleMatch = frontmatter.match(/^title:\s*(.+)$/m)
        if (titleMatch) {
          title = titleMatch[1].trim()
        }

        const summaryMatch = frontmatter.match(/^summary:\s*(.+)$/m)
        if (summaryMatch) {
          summary = summaryMatch[1].trim()
        }
      }

      // Prepare translation requests
      // We will send multiple 'text' parameters: title (optional), summary (optional), body
      const textsToTranslate = []
      if (title) {
        textsToTranslate.push(title)
      }
      if (summary) {
        textsToTranslate.push(summary)
      }
      textsToTranslate.push(body)

      const url = "https://api-free.deepl.com/v2/translate"

      const params = new URLSearchParams()
      textsToTranslate.forEach((t) => {
        params.append("text", t)
      })
      params.append("target_lang", TARGET_LANG)
      // Enforce source language as Korean to prevent auto-detection failure on mixed content
      params.append("source_lang", "KO")

      const options = {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }

      const response = await fetch(url, options)

      // HTTP 응답 상태 확인
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
        console.error(
          `번역 실패: HTTP ${response.status} ${response.statusText}`,
          errorData.message || errorData,
        )
        continue
      }

      const data = await response.json()

      // 응답 데이터 검증
      if (
        !data.translations ||
        !Array.isArray(data.translations) ||
        data.translations.length !== textsToTranslate.length
      ) {
        console.error(`번역 실패: 응답 개수 불일치 또는 잘못된 형식`, data)
        continue
      }

      // Reconstruct content
      let transIdx = 0
      let translatedTitle = title
      let translatedSummary = summary

      if (title) {
        translatedTitle = data.translations[transIdx].text
        transIdx++
      }
      if (summary) {
        translatedSummary = data.translations[transIdx].text
        transIdx++
      }

      let translatedBody = data.translations[transIdx].text

      // Cleanup markdown in body
      translatedBody = cleanupMarkdown(translatedBody)

      // Reconstruct frontmatter
      let newFrontmatter = frontmatter
      if (title) {
        newFrontmatter = newFrontmatter.replace(/^title:.+$/m, `title: ${translatedTitle}`)
      }
      if (summary) {
        newFrontmatter = newFrontmatter.replace(/^summary:.+$/m, `summary: ${translatedSummary}`)
      }

      const translatedContent = hasFrontmatter
        ? `---\n${newFrontmatter}\n---\n${translatedBody}`
        : translatedBody

      const translatedMdxPath = path.replace(/\.md$/, `.${FILE_LANG_EXT}.md`)
      console.info(`${translatedMdxPath}에 번역 파일을 작성합니다.`)

      await fs.writeFile(translatedMdxPath, translatedContent)
    } catch (error) {
      console.error(`번역 중 오류 발생 (${path}):`, error.message || error)
      continue
    }

    const end = performance.now()
    console.info(`(${idx + 1}/${count}) ${path} 번역 완료, duration: ${end - start}ms`)
    idx += 1
    console.info(`-----------------------`)
    console.info()
  }
}

main()
