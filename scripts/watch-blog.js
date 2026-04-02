#!/usr/bin/env node

import { spawn } from "node:child_process"
import chokidar from "chokidar"
import debounce from "lodash.debounce"

const DEBOUNCE_DELAY = 10000 // 10초 debounce

// debounce된 prebuild 실행 함수
const runPrebuild = debounce(() => {
  console.log("🔄 Running prebuild script...")

  const prebuild = spawn("sh", ["scripts/prebuild.sh"], {
    stdio: "inherit",
    shell: true,
  })

  prebuild.on("close", (code) => {
    if (code === 0) {
      console.log("✅ Prebuild completed successfully")
    } else {
      console.log(`❌ Prebuild failed with code ${code}`)
    }
  })

  prebuild.on("error", (err) => {
    console.error("❌ Failed to start prebuild:", err)
  })
}, DEBOUNCE_DELAY)

// 파일 변경 감지
const watcher = chokidar.watch("blog_obsidian/**/*", {
  ignored: /(^|[/\\])\../, // 숨김 파일 무시
  persistent: true,
  ignoreInitial: true,
})

console.log("👀 Watching blog_obsidian directory for changes...")
console.log(`⏱️  Debounce delay: ${DEBOUNCE_DELAY}ms`)

watcher
  .on("add", (path) => {
    console.log(`📄 File added: ${path}`)
    runPrebuild()
  })
  .on("change", (path) => {
    console.log(`✏️  File changed: ${path}`)
    runPrebuild()
  })
  .on("unlink", (path) => {
    console.log(`🗑️  File removed: ${path}`)
    runPrebuild()
  })
  .on("error", (error) => {
    console.error("❌ Watcher error:", error)
  })

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Stopping watcher...")
  watcher.close()
  process.exit(0)
})
