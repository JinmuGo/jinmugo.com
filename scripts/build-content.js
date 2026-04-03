import { execSync } from "node:child_process"
import crypto from "node:crypto"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BLOG_ROOT = path.resolve(__dirname, "..")
const OBSIDIAN_DIR = process.env.OBSIDIAN_VAULT_PATH
  ? path.resolve(process.env.OBSIDIAN_VAULT_PATH)
  : path.join(BLOG_ROOT, "blog_obsidian")
const CACHE_DIR = path.join(BLOG_ROOT, ".cache/content-export")
const TARGET_DIR = path.join(BLOG_ROOT, "src/content")
const SCRIPTS_DIR = path.join(BLOG_ROOT, "scripts")

// 1. Select binary
function getExportBinary() {
  const platform = os.platform()
  const arch = os.arch()

  if (platform === "darwin") {
    return path.join(SCRIPTS_DIR, "obsidian-export-mac")
  } else if (arch === "arm64") {
    return path.join(SCRIPTS_DIR, "obsidian-export-aarch64")
  } else {
    return path.join(SCRIPTS_DIR, "obsidian-export")
  }
}

// 2. Execute export to cache
function exportContent() {
  const binary = getExportBinary()
  // console.log(`[Build] Using binary: ${binary}`);

  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }

  // console.log('[Build] Exporting Obsidian content to cache...');
  try {
    // obsidian-export processes the obsidian vault and outputs to cache dir
    execSync(`"${binary}" "${OBSIDIAN_DIR}" "${CACHE_DIR}"`, { stdio: "inherit" })
  } catch (e) {
    console.error("[Build] Export failed:", e)
    process.exit(1)
  }
}

// 3. Helper to get all files recursively
function getAllFiles(dir, fileList = [], rootDir = dir) {
  if (!fs.existsSync(dir)) {
    return []
  }

  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList, rootDir)
    } else {
      fileList.push(path.relative(rootDir, filePath))
    }
  })
  return fileList
}

// 4. Sync Logic
function syncContent() {
  // console.log('[Build] Syncing content to src/content...');

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true })
  }

  const cachedFiles = getAllFiles(CACHE_DIR)
  const targetFiles = getAllFiles(TARGET_DIR)
  const processedTargetFiles = new Set()

  let changedCount = 0
  let skippedCount = 0
  let removedCount = 0

  // Update or Create
  for (const file of cachedFiles) {
    const sourcePath = path.join(CACHE_DIR, file)
    const isMd = file.endsWith(".md")

    // Determine target path (.md -> .mdx)
    let targetRelativePath = file
    if (isMd) {
      targetRelativePath = `${file.substring(0, file.length - 3)}.mdx`
    }

    const targetPath = path.join(TARGET_DIR, targetRelativePath)
    processedTargetFiles.add(targetRelativePath)

    const sourceContent = fs.readFileSync(sourcePath)

    let shouldWrite = false

    if (!fs.existsSync(targetPath)) {
      shouldWrite = true
    } else {
      const targetContent = fs.readFileSync(targetPath)
      // Compare content
      if (!sourceContent.equals(targetContent)) {
        shouldWrite = true
      }
    }

    if (shouldWrite) {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true })
      fs.writeFileSync(targetPath, sourceContent)
      changedCount++
    } else {
      skippedCount++
    }
  }

  // Remove deleted files
  for (const file of targetFiles) {
    if (!processedTargetFiles.has(file)) {
      fs.unlinkSync(path.join(TARGET_DIR, file))
      removedCount++
      // console.log(`  Removed: ${file}`);

      // Clean up empty directories
      try {
        const dir = path.dirname(path.join(TARGET_DIR, file))
        if (fs.readdirSync(dir).length === 0) {
          fs.rmdirSync(dir)
        }
      } catch (e) {}
    }
  }

  console.log(
    `[Build] Sync complete. Updated: ${changedCount}, Skipped: ${skippedCount}, Removed: ${removedCount}`,
  )
}

// Run
try {
  exportContent()
  syncContent()
} catch (error) {
  console.error("[Build] Error:", error)
  process.exit(1)
}
