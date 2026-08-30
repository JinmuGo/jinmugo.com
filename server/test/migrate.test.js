import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { prepareDatabase } from "../dist/migrate.js"

test("migration preparation backs up existing data and only creates directories for a fresh DB", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "jinmu-comment-migrate-"))
  const existingPath = path.join(rootDir, "existing.db")
  const freshPath = path.join(rootDir, "nested", "fresh.db")
  fs.writeFileSync(existingPath, "existing")

  try {
    let backedUpPath
    const report = prepareDatabase(existingPath, (databasePath) => {
      backedUpPath = databasePath
      return { backupPath: "backup.db", rowCounts: {} }
    })
    assert.equal(backedUpPath, existingPath)
    assert.equal(report?.backupPath, "backup.db")

    assert.equal(prepareDatabase(freshPath), undefined)
    assert.equal(fs.existsSync(path.dirname(freshPath)), true)
    assert.equal(fs.existsSync(freshPath), false)
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true })
  }
})
