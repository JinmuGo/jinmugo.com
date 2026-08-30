import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import Database from "better-sqlite3"
import { runMigrations } from "../dist/migrate.js"

test("migration backs up only pending application data and initializes fresh databases", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "jinmu-comment-migrate-"))
  const migrationsFolder = path.resolve("drizzle")
  const freshPath = path.join(rootDir, "fresh", "comments.db")
  const emptyPath = path.join(rootDir, "empty.db")
  const existingPath = path.join(rootDir, "existing.db")
  const backupCalls = []
  const backup = (databasePath) => {
    backupCalls.push(databasePath)
    const database = new Database(databasePath, { readonly: true })
    try {
      assert.equal(database.prepare('SELECT COUNT(*) FROM "comments"').pluck().get(), 1)
      assert.equal(
        database
          .prepare(
            "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = '__drizzle_migrations'",
          )
          .pluck()
          .get(),
        0,
      )
    } finally {
      database.close()
    }
    return { backupPath: "verified-backup.db", rowCounts: {} }
  }

  try {
    runMigrations(freshPath, migrationsFolder, backup)
    assert.equal(backupCalls.length, 0)

    runMigrations(freshPath, migrationsFolder, backup)
    assert.equal(backupCalls.length, 0)

    fs.writeFileSync(emptyPath, "")
    runMigrations(emptyPath, migrationsFolder, backup)
    assert.equal(backupCalls.length, 0)

    const existing = new Database(existingPath)
    existing.exec(
      fs
        .readFileSync(path.join(migrationsFolder, "0000_initial.sql"), "utf8")
        .replaceAll("--> statement-breakpoint", ""),
    )
    existing
      .prepare('INSERT INTO "comments" (page, author, content, timestamp) VALUES (?, ?, ?, ?)')
      .run("post/example", "user-1", "{}", Date.now())
    existing.close()

    runMigrations(existingPath, migrationsFolder, backup)
    assert.deepEqual(backupCalls, [existingPath])
    runMigrations(existingPath, migrationsFolder, backup)
    assert.deepEqual(backupCalls, [existingPath])

    const migrated = new Database(existingPath, { readonly: true })
    assert.equal(migrated.prepare('SELECT COUNT(*) FROM "comments"').pluck().get(), 1)
    assert.equal(migrated.prepare('SELECT COUNT(*) FROM "__drizzle_migrations"').pluck().get(), 1)
    migrated.close()
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true })
  }
})
