import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import Database from "better-sqlite3"
import { backupDatabase, inspectDatabase } from "../dist/backup.js"

test("backup is restored separately and invalid partial output is removed", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "jinmu-comment-backup-"))
  const databasePath = path.join(rootDir, "comments.db")
  const backupDir = path.join(rootDir, "backup's directory")
  const database = new Database(databasePath)

  try {
    database.exec(`
      CREATE TABLE "user" (id TEXT PRIMARY KEY);
      CREATE TABLE "session" (id TEXT PRIMARY KEY);
      CREATE TABLE "account" (id TEXT PRIMARY KEY);
      CREATE TABLE "verification" (id TEXT PRIMARY KEY);
      CREATE TABLE "comments" (id INTEGER PRIMARY KEY);
      CREATE TABLE "rates" (id INTEGER PRIMARY KEY);
      CREATE TABLE "roles" (id TEXT PRIMARY KEY);
      INSERT INTO "user" VALUES ('user-1');
      INSERT INTO "comments" VALUES (1);
    `)
    database.close()

    const report = backupDatabase(databasePath, backupDir)
    assert.equal(fs.existsSync(report.backupPath), true)
    assert.equal(report.rowCounts.user, 1)
    assert.equal(report.rowCounts.comments, 1)
    assert.deepEqual(inspectDatabase(report.backupPath), { rowCounts: report.rowCounts })

    const retryDir = path.join(rootDir, "retry-backups")
    const first = backupDatabase(databasePath, retryDir, "before-migration.sqlite")
    const retry = backupDatabase(databasePath, retryDir, "before-migration.sqlite")
    assert.equal(first.reused, false)
    assert.equal(retry.reused, true)
    assert.equal(retry.backupPath, first.backupPath)
    assert.deepEqual(fs.readdirSync(retryDir), ["before-migration.sqlite"])

    const invalidReusablePath = path.join(retryDir, "invalid.sqlite")
    fs.writeFileSync(invalidReusablePath, "not a database")
    assert.throws(() => backupDatabase(databasePath, retryDir, "invalid.sqlite"), /not a database/)
    assert.equal(fs.existsSync(invalidReusablePath), true)

    const incompletePath = path.join(rootDir, "incomplete.db")
    const incompleteBackupDir = path.join(rootDir, "incomplete-backups")
    const incomplete = new Database(incompletePath)
    incomplete.exec('CREATE TABLE "user" (id TEXT PRIMARY KEY)')
    incomplete.close()
    assert.throws(() => backupDatabase(incompletePath, incompleteBackupDir), /no such table/)
    assert.deepEqual(fs.readdirSync(incompleteBackupDir), [])
  } finally {
    if (database.open) {
      database.close()
    }
    fs.rmSync(rootDir, { recursive: true, force: true })
  }
})
