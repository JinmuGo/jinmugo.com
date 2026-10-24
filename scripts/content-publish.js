#!/usr/bin/env node
import { spawnSync } from "node:child_process"
import { ensureContentSourceRoot, getContentSourceLabel, repoRoot } from "./content-paths.js"

let vaultRoot
try {
  vaultRoot = ensureContentSourceRoot()
} catch (error) {
  console.error(error.message)
  process.exit(1)
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    stdio: "inherit",
    shell: false,
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function main() {
  const shouldPush = process.argv.includes("--push")
  const messageIndex = process.argv.indexOf("--message")
  const commitMessage =
    messageIndex >= 0 && process.argv[messageIndex + 1] ? process.argv[messageIndex + 1] : null

  run("node", ["scripts/content-doctor.js"])

  console.info(`\nContent source: ${getContentSourceLabel()}`)
  console.info("Content source git status:")
  run("git", ["status", "--short"], { cwd: vaultRoot })

  if (!commitMessage && !shouldPush) {
    console.info(
      "\nValidation passed. Review the status above, then commit/push inside the content source.",
    )
    console.info('Optional: pnpm content:publish -- --message "publish post" --push')
    return
  }

  if (commitMessage) {
    run("git", ["add", "."], { cwd: vaultRoot })
    run("git", ["commit", "-m", commitMessage], { cwd: vaultRoot })
  }

  if (shouldPush) {
    run("git", ["push"], { cwd: vaultRoot })
  }
}

main()
