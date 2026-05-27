#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { getContentSourceLabel, getContentSourceRoot } from "./content-paths.js"

const vaultRoot = getContentSourceRoot()

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

function isDraft(frontmatter) {
  return frontmatter.get("draft") === "true"
}

function parseDate(value) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    return null
  }

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  const formatted = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")

  return formatted === value ? date : null
}

function getIsoWeekInfo(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - day)

  const year = target.getUTCFullYear()
  const yearStart = new Date(Date.UTC(year, 0, 1))
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)

  return { year, week }
}

function formatWeekLabel(year, week) {
  return `${year}-W${String(week).padStart(2, "0")}`
}

function validateTranslation(file, files) {
  if (!file.endsWith(".en.md")) {
    return
  }

  const sourceFile = file.replace(/\.en\.md$/, ".md")
  if (!files.has(sourceFile)) {
    addWarning(file, `English translation has no exact source file match (${sourceFile})`)
  }
}

function validateBasicFrontmatter(file, frontmatter) {
  for (const key of ["title", "date"]) {
    if (!frontmatter.get(key)) {
      addWarning(file, `missing recommended frontmatter field: ${key}`)
    }
  }
}

function validateWeekly(file, frontmatter) {
  for (const key of ["title", "date", "year", "week", "draft"]) {
    if (!frontmatter.get(key)) {
      addError(file, `missing required weekly field: ${key}`)
    }
  }

  const date = parseDate(frontmatter.get("date"))
  if (!date) {
    addError(file, "weekly date must use yyyy-MM-dd")
    return
  }

  const year = Number(frontmatter.get("year"))
  const week = Number(frontmatter.get("week"))
  if (!Number.isInteger(year) || year <= 0) {
    addError(file, "weekly year must be a positive integer")
  }
  if (!Number.isInteger(week) || week <= 0) {
    addError(file, "weekly week must be a positive integer")
  }

  const expected = getIsoWeekInfo(date)
  if (Number.isInteger(year) && year !== expected.year) {
    addError(file, `weekly year must match date (${expected.year})`)
  }
  if (Number.isInteger(week) && week !== expected.week) {
    addError(file, `weekly week must match date (${expected.week})`)
  }

  if (!file.endsWith(".en.md") && Number.isInteger(year) && Number.isInteger(week)) {
    const weekLabel = formatWeekLabel(year, week)
    const expectedPath = `weekly/${weekLabel}/${weekLabel}.md`
    if (file !== expectedPath) {
      addError(file, `weekly file path must be ${expectedPath}`)
    }
  }

  if (isDraft(frontmatter)) {
    return
  }

  const cover = frontmatter.get("cover")

  if (cover) {
    const coverPath = path.resolve(vaultRoot, path.dirname(file), cover.replace(/^\.\//, ""))
    if (!fs.existsSync(coverPath)) {
      addError(file, `published weekly cover file does not exist: ${cover}`)
    }
  }
}

function validateWeeklyDates(files) {
  const dates = new Map()

  for (const file of files) {
    if (!file.startsWith("weekly/") || file.endsWith(".en.md")) {
      continue
    }

    const content = fs.readFileSync(path.join(vaultRoot, file), "utf8")
    const frontmatter = parseFrontmatter(content)
    const date = frontmatter?.get("date")

    if (!date) {
      continue
    }

    if (!dates.has(date)) {
      dates.set(date, [])
    }
    dates.get(date).push(file)
  }

  for (const [date, dateFiles] of dates) {
    if (dateFiles.length > 1) {
      addError(dateFiles.join(", "), `duplicate weekly date: ${date}`)
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
    if (!/^(post|memo|weekly)\//.test(file)) {
      continue
    }

    validateTranslation(file, files)

    const content = fs.readFileSync(path.join(vaultRoot, file), "utf8")
    const frontmatter = parseFrontmatter(content)
    if (!frontmatter) {
      addError(file, "missing frontmatter")
      continue
    }

    if (file.startsWith("weekly/")) {
      validateWeekly(file, frontmatter)
    } else {
      validateBasicFrontmatter(file, frontmatter)
    }
  }

  validateWeeklyDates(files)

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
