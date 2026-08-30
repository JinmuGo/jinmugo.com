import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import Database from "better-sqlite3"
import { requiredEnv } from "./env.js"

const coreTables = ["user", "session", "account", "verification", "comments", "rates", "roles"]

function sqliteShellArgument(value: string) {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`
}

function runDotCommand(databasePath: string, command: ".backup" | ".restore", targetPath: string) {
  execFileSync(
    "sqlite3",
    ["-batch", databasePath, `${command} ${sqliteShellArgument(targetPath)}`],
    { stdio: "pipe" },
  )
}

export function inspectDatabase(databasePath: string) {
  const database = new Database(databasePath, { readonly: true, fileMustExist: true })

  try {
    const integrity = database.pragma("integrity_check", { simple: true }) as string
    if (integrity !== "ok") {
      throw new Error(`SQLite integrity_check failed: ${integrity}`)
    }

    const foreignKeyViolations = database.pragma("foreign_key_check") as unknown[]
    if (foreignKeyViolations.length > 0) {
      throw new Error(`SQLite foreign_key_check found ${foreignKeyViolations.length} violation(s)`)
    }

    const rowCounts = Object.fromEntries(
      coreTables.map((table) => [
        table,
        database.prepare(`SELECT COUNT(*) FROM "${table}"`).pluck().get() as number,
      ]),
    )

    return { rowCounts }
  } finally {
    database.close()
  }
}

function rehearseRestore(backupPath: string, expectedCounts: Record<string, number>) {
  const restoreDir = fs.mkdtempSync(path.join(os.tmpdir(), "jinmu-comment-restore-"))
  const restoredPath = path.join(restoreDir, "comments.db")

  try {
    runDotCommand(restoredPath, ".restore", backupPath)
    const restored = inspectDatabase(restoredPath)
    for (const table of coreTables) {
      if (restored.rowCounts[table] !== expectedCounts[table]) {
        throw new Error(`Restore rehearsal row count mismatch for ${table}`)
      }
    }
  } finally {
    fs.rmSync(restoreDir, { recursive: true, force: true })
  }
}

export function backupDatabase(databasePath: string, backupDir?: string, backupName?: string) {
  const sourcePath = path.resolve(databasePath)
  if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
    throw new Error(`SQLite database does not exist: ${sourcePath}`)
  }

  const destinationDir = path.resolve(backupDir ?? path.join(path.dirname(sourcePath), "backups"))
  fs.mkdirSync(destinationDir, { recursive: true, mode: 0o700 })
  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-")
  const backupPath = path.join(
    destinationDir,
    backupName ?? `${path.basename(sourcePath)}.${timestamp}.${process.pid}.sqlite`,
  )
  let created = false

  try {
    if (fs.existsSync(backupPath)) {
      const report = inspectDatabase(backupPath)
      rehearseRestore(backupPath, report.rowCounts)
      return { backupPath, ...report, reused: true }
    }

    created = true
    runDotCommand(sourcePath, ".backup", backupPath)
    fs.chmodSync(backupPath, 0o600)
    const report = inspectDatabase(backupPath)
    rehearseRestore(backupPath, report.rowCounts)

    return { backupPath, ...report, reused: false }
  } catch (error) {
    if (created) {
      fs.rmSync(backupPath, { force: true })
    }
    throw error
  }
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const report = backupDatabase(requiredEnv("DATABASE_URL"))
  console.log(JSON.stringify(report, null, 2))
}
