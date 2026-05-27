#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { ensureContentSourceRoot, getContentSourceLabel, repoRoot } from "./content-paths.js"

let vaultRoot
try {
  vaultRoot = ensureContentSourceRoot()
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
const weeklyRoot = path.join(vaultRoot, "weekly")
const templatePath = path.join(repoRoot, "templates", "weekly.md")

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatWeekLabel(year, week) {
  return `${year}-W${String(week).padStart(2, "0")}`
}

function parseArgs(argv) {
  const args = [...argv]
  const dateFlagIndex = args.indexOf("--date")
  const dateValue = dateFlagIndex >= 0 ? args[dateFlagIndex + 1] : null

  if (dateFlagIndex >= 0) {
    args.splice(dateFlagIndex, 2)
  }

  return {
    date: dateValue ? parseDate(dateValue) : new Date(),
    title: args.join(" ").trim(),
  }
}

function parseDate(value) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    console.error(`Invalid date. Use yyyy-MM-dd: ${value}`)
    process.exit(1)
  }

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (formatDate(date) !== value) {
    console.error(`Invalid calendar date: ${value}`)
    process.exit(1)
  }

  return date
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

function main() {
  const { date, title } = parseArgs(process.argv.slice(2))
  const dateSlug = formatDate(date)
  const { year, week } = getIsoWeekInfo(date)
  const weekLabel = formatWeekLabel(year, week)
  const weeklyDir = path.join(weeklyRoot, weekLabel)
  const targetPath = path.join(weeklyDir, `${weekLabel}.md`)

  if (fs.existsSync(targetPath)) {
    console.error(`Weekly already exists: ${targetPath}`)
    process.exit(1)
  }

  const template = fs.readFileSync(templatePath, "utf8")
  const content = template
    .replaceAll("{{date}}", dateSlug)
    .replaceAll("{{weekLabel}}", weekLabel)
    .replaceAll("{{titleSuffix}}", title ? ` - ${title}` : "")
    .replaceAll("{{year}}", String(year))
    .replaceAll("{{week}}", String(week))

  fs.mkdirSync(weeklyDir, { recursive: true })
  fs.writeFileSync(targetPath, content)

  console.info(`Content source: ${getContentSourceLabel()}`)
  console.info(`Created ${path.relative(vaultRoot, targetPath)}`)
  console.info("Optional: add cover and coverAlt to frontmatter when you want a hero image.")
}

main()
