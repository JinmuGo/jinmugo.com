import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import {
  cacheContentExportDir,
  contentCollectionDirs,
  ensureContentSourceRoot,
  getContentSourceLabel,
  scriptsDir,
  targetContentDir,
} from "./content-paths.js"

// 1. Select binary
function getExportBinary() {
  const platform = os.platform()
  const arch = os.arch()

  if (platform === "darwin") {
    return path.join(scriptsDir, "obsidian-export-mac")
  } else if (arch === "arm64") {
    return path.join(scriptsDir, "obsidian-export-aarch64")
  } else {
    return path.join(scriptsDir, "obsidian-export")
  }
}

// 2. Execute export to cache
function exportContent() {
  const binary = getExportBinary()
  const obsidianDir = ensureContentSourceRoot()
  // console.log(`[Build] Using binary: ${binary}`);

  fs.rmSync(cacheContentExportDir, { recursive: true, force: true })
  fs.mkdirSync(cacheContentExportDir, { recursive: true })

  // console.log('[Build] Exporting Obsidian content to cache...');
  try {
    console.log(`[Build] Exporting ${getContentSourceLabel()}`)
    // obsidian-export processes the obsidian vault and outputs to cache dir
    execFileSync(binary, [obsidianDir, cacheContentExportDir], { stdio: "inherit" })
  } catch (e) {
    console.error("[Build] Export failed:", e)
    process.exit(1)
  }
}

function dryRunExport() {
  const binary = getExportBinary()
  const obsidianDir = ensureContentSourceRoot()
  const dryRunCacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "jinmu-content-export-"))

  try {
    console.log(`[Build] Dry run exporting ${getContentSourceLabel()}`)
    execFileSync(binary, [obsidianDir, dryRunCacheDir], { stdio: "inherit" })

    const exportedFiles = getAllFiles(dryRunCacheDir)
    console.log(`[Build] Dry run complete. Exported files: ${exportedFiles.length}`)
  } catch (e) {
    console.error("[Build] Dry run failed:", e)
    process.exit(1)
  } finally {
    fs.rmSync(dryRunCacheDir, { recursive: true, force: true })
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

// Remap source collection paths: memo/* → post/*
function remapCollectionPath(filePath) {
  const normalized = filePath.replace(/\\/g, "/")
  if (normalized.startsWith("memo/")) {
    return `post/${normalized.slice("memo/".length)}`
  }
  return filePath
}

// 4. Sync Logic
function syncContent() {
  // console.log('[Build] Syncing content to src/content...');

  if (!fs.existsSync(targetContentDir)) {
    fs.mkdirSync(targetContentDir, { recursive: true })
  }

  const cachedFiles = getAllFiles(cacheContentExportDir)
  const targetFiles = getAllFiles(targetContentDir)
  const processedTargetFiles = new Set()
  /** Top-level segments present in this export and their remapped targets. Used to avoid wiping collections obsidian-export did not emit. */
  const cacheTopLevelRoots = new Set()
  for (const file of cachedFiles) {
    const root = file.split(/[/\\]/)[0]
    if (root) {
      cacheTopLevelRoots.add(root)
      // Also track remapped root so cleanup applies to remapped target dirs
      const remapped = remapCollectionPath(file)
      const remappedRoot = remapped.split(/[/\\]/)[0]
      cacheTopLevelRoots.add(remappedRoot)
    }
  }

  let changedCount = 0
  let skippedCount = 0
  let removedCount = 0

  // Update or Create
  for (const file of cachedFiles) {
    const sourcePath = path.join(cacheContentExportDir, file)
    const isMd = file.endsWith(".md")

    // Determine target path (.md -> .mdx), then remap collection dirs (memo/* → post/*)
    let targetRelativePath = file
    if (isMd) {
      targetRelativePath = `${file.substring(0, file.length - 3)}.mdx`
    }
    targetRelativePath = remapCollectionPath(targetRelativePath)

    const targetPath = path.join(targetContentDir, targetRelativePath)
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

  // Remove deleted files (only under top-level dirs that appeared in this export)
  for (const file of targetFiles) {
    const root = file.split(/[/\\]/)[0]
    if (root && !cacheTopLevelRoots.has(root)) {
      continue
    }
    if (!processedTargetFiles.has(file)) {
      fs.unlinkSync(path.join(targetContentDir, file))
      removedCount++
      // console.log(`  Removed: ${file}`);

      // Clean up empty directories
      try {
        const dir = path.dirname(path.join(targetContentDir, file))
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

function ensureContentCollectionDirs() {
  for (const collection of contentCollectionDirs) {
    fs.mkdirSync(path.join(targetContentDir, collection), { recursive: true })
  }
}

// Run
try {
  if (process.argv.includes("--dry-run")) {
    dryRunExport()
  } else {
    exportContent()
    syncContent()
    ensureContentCollectionDirs()
  }
} catch (error) {
  console.error("[Build] Error:", error)
  process.exit(1)
}
