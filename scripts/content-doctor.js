#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { getContentSourceLabel, getContentSourceRoot } from "./content-paths.js"

const vaultRoot = getContentSourceRoot()
const translationHashPattern = /^[a-f0-9]{64}$/

const errors = []
const warnings = []

function getAllMarkdownFiles(dir, rootDir = dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList
  }

  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      if (file.startsWith(".")) {
        continue
      }

      getAllMarkdownFiles(filePath, rootDir, fileList)
      continue
    }

    if (file.endsWith(".md")) {
      fileList.push(path.relative(rootDir, filePath))
    }
  }

  return fileList
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) {
    return null
  }

  const data = new Map()
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/)
    if (field) {
      data.set(field[1], field[2].trim().replace(/^["']|["']$/g, ""))
    }
  }

  return data
}

function addError(file, message) {
  errors.push(`${file}: ${message}`)
}

function addWarning(file, message) {
  warnings.push(`${file}: ${message}`)
}

function validateTranslation(file, files, frontmatter) {
  if (!file.endsWith(".en.md")) {
    return
  }

  const sourceFile = file.replace(/\.en\.md$/, ".md")
  if (!files.has(sourceFile)) {
    addError(file, `English translation has no exact source file match (${sourceFile})`)
  }
  if (!translationHashPattern.test(frontmatter.get("translationSourceHash") ?? "")) {
    addError(file, "missing valid translationSourceHash")
  }
}

function validateBasicFrontmatter(file, frontmatter) {
  for (const key of ["title", "date"]) {
    if (!frontmatter.get(key)) {
      addWarning(file, `missing recommended frontmatter field: ${key}`)
    }
  }
}

function main() {
  if (!fs.existsSync(vaultRoot)) {
    addError(vaultRoot, "Obsidian vault directory does not exist")
  }

  console.info(`Content source: ${getContentSourceLabel()}`)
  const files = new Set(getAllMarkdownFiles(vaultRoot))

  for (const file of files) {
    if (!/^(post|memo)\//.test(file)) {
      continue
    }

    const content = fs.readFileSync(path.join(vaultRoot, file), "utf8")
    const frontmatter = parseFrontmatter(content)
    if (!frontmatter) {
      addError(file, "missing frontmatter")
      continue
    }

    validateTranslation(file, files, frontmatter)
    validateBasicFrontmatter(file, frontmatter)
  }

  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`)
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`Error: ${error}`)
    }
    console.error(`Content doctor failed with ${errors.length} error(s).`)
    process.exit(1)
  }

  console.info(`Content doctor passed. Checked ${files.size} markdown file(s).`)
}

main()
