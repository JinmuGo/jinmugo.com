#!/usr/bin/env node
import { spawn } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import chokidar from "chokidar"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const blogRoot = join(__dirname, "..")

// 감시할 디렉토리
const watchDir = process.env.OBSIDIAN_VAULT_PATH
  ? join(process.env.OBSIDIAN_VAULT_PATH)
  : join(blogRoot, "blog_obsidian")

let isRebuilding = false
let pendingRebuild = false

function runPrebuild() {
  if (isRebuilding) {
    pendingRebuild = true
    console.log("[Watcher] Rebuild already in progress, will run again after completion...")
    return
  }

  isRebuilding = true
  console.log(`\n[Watcher] Changes detected in ${watchDir}`)
  console.log("[Watcher] Running prebuild...\n")

  const prebuild = spawn("node", ["scripts/build-content.js"], {
    cwd: blogRoot,
    stdio: "inherit",
    shell: true,
  })

  prebuild.on("close", (code) => {
    isRebuilding = false

    if (code === 0) {
      console.log("\n[Watcher] Prebuild completed successfully!")
      console.log(`[Watcher] Watching for changes in ${watchDir}...\n`)
    } else {
      console.error(`\n[Watcher] Prebuild failed with code ${code}\n`)
    }

    // 대기 중인 rebuild가 있으면 실행
    if (pendingRebuild) {
      pendingRebuild = false
      setTimeout(runPrebuild, 500)
    }
  })

  prebuild.on("error", (error) => {
    isRebuilding = false
    console.error("[Watcher] Failed to run prebuild:", error)
  })
}

console.log("[Watcher] Starting Obsidian content watcher...")
console.log(`[Watcher] Watching: ${watchDir}\n`)

// 초기 prebuild 실행
runPrebuild()

// 파일 watcher 설정
const watcher = chokidar.watch(watchDir, {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100,
  },
  ignored: ["**/node_modules/**", "**/.git/**", "**/.DS_Store"],
})

// 디바운싱을 위한 타이머
let debounceTimer = null

function handleChange(_path) {
  // 디바운싱: 500ms 내 추가 변경사항 무시
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    runPrebuild()
    debounceTimer = null
  }, 500)
}

// 이벤트 리스너
watcher
  .on("add", (path) => {
    console.log(`[Watcher] File added: ${path}`)
    handleChange(path)
  })
  .on("change", (path) => {
    console.log(`[Watcher] File changed: ${path}`)
    handleChange(path)
  })
  .on("unlink", (path) => {
    console.log(`[Watcher] File removed: ${path}`)
    handleChange(path)
  })
  .on("error", (error) => {
    console.error("[Watcher] Error:", error)
  })

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[Watcher] Stopping watcher...")
  watcher.close()
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.log("\n[Watcher] Stopping watcher...")
  watcher.close()
  process.exit(0)
})
