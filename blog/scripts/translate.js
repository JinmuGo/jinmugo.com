// REF: https://github.com/MaxKim-J/maxkim-j.github.io

import { execSync } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"

const DEEPL_API_KEY = process.env.DEEPL_API_KEY

const TARGET_LANG = "en"
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
    const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---/)
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
        file.includes("blog_obsidian") && file.endsWith(".md") && !file.endsWith(`.${lang}.md`),
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
    const allOriginalBlogContents = allMdFilesRelative.filter(
      (file) => !file.endsWith(`.${lang}.md`),
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

async function main() {
  console.info("DeepL API로 블로그 글 번역을 합니다.")

  // 커맨드 라인 인자로 stagedOnly 옵션 확인
  const stagedOnly = process.argv.includes("--staged-only")

  const { allOriginalBlogContents, allNotYetTranslatedBlogContents } =
    await validateTranslateNecessity({
      lang: TARGET_LANG,
      stagedOnly,
    })

  console.info(`전체 한국어 컨텐츠 ${allOriginalBlogContents.length}개`)
  console.info(
    `${TARGET_LANG}으로 번역이 안 된 블로그 컨텐츠 ${allNotYetTranslatedBlogContents.length}개를 번역합니다.`,
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

    const url = "https://api-free.deepl.com/v2/translate"
    const options = {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        text: content,
        target_lang: TARGET_LANG,
      }),
    }

    try {
      const response = await fetch(url, options)
      const data = await response.json()
      const translatedContent = data.translations[0].text.replaceAll("---.", "---")
      const translatedMdxPath = path.replace(/\.md$/, `.${TARGET_LANG}.md`)
      console.info(`${translatedMdxPath}에 번역 파일을 작성합니다.`)

      await fs.writeFile(translatedMdxPath, translatedContent)
    } catch (error) {
      console.error("Error:", error)
    }

    const end = performance.now()
    console.info(`(${idx + 1}/${count}) ${path} 번역 완료, duration: ${end - start}ms`)
    idx += 1
    console.info(`-----------------------`)
    console.info()
  }
}

main()
