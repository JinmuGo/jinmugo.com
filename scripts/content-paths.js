import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const repoRoot = path.resolve(__dirname, "..")
export const scriptsDir = __dirname
export const targetContentDir = path.join(repoRoot, "src/content")
export const cacheContentExportDir = path.join(repoRoot, ".cache/content-export")
export const contentCollectionDirs = ["app", "post", "weekly", "book", "movie"]

dotenv.config({ path: path.join(repoRoot, ".env"), quiet: true })

function expandHome(inputPath) {
  if (inputPath === "~") {
    return os.homedir()
  }

  if (inputPath.startsWith("~/")) {
    return path.join(os.homedir(), inputPath.slice(2))
  }

  return inputPath
}

export function getContentSourceRoot() {
  const configuredPath = process.env.OBSIDIAN_VAULT_PATH?.trim()
  const sourcePath = configuredPath ? expandHome(configuredPath) : path.join(repoRoot, "obsidian")

  return path.isAbsolute(sourcePath) ? path.resolve(sourcePath) : path.resolve(repoRoot, sourcePath)
}

export function getContentSourceMode() {
  return process.env.OBSIDIAN_VAULT_PATH?.trim() ? "external" : "local"
}

export function getContentSourceLabel() {
  const mode = getContentSourceMode()
  const sourceRoot = getContentSourceRoot()

  return `${mode === "external" ? "external Obsidian vault" : "local obsidian"} (${sourceRoot})`
}

export function ensureContentSourceRoot() {
  const sourceRoot = getContentSourceRoot()

  if (!fs.existsSync(sourceRoot)) {
    throw new Error(`Obsidian content source does not exist: ${sourceRoot}`)
  }

  const stat = fs.statSync(sourceRoot)
  if (!stat.isDirectory()) {
    throw new Error(`Obsidian content source is not a directory: ${sourceRoot}`)
  }

  return sourceRoot
}
