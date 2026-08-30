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
  const malformedPath = path.join(rootDir, "malformed.db")
  const backupCalls = []
  const backup = (databasePath, _backupDir, backupName) => {
    backupCalls.push({ databasePath, backupName })
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
    assert.deepEqual(backupCalls, [
      {
        databasePath: existingPath,
        backupName:
          "existing.db.before-105a387582c975d73517b234a63a3022fbfed725205a362aad19166f519859be.sqlite",
      },
    ])
    runMigrations(existingPath, migrationsFolder, backup)
    assert.equal(backupCalls.length, 1)

    const migrated = new Database(existingPath, { readonly: true })
    assert.equal(migrated.prepare('SELECT COUNT(*) FROM "comments"').pluck().get(), 1)
    assert.equal(migrated.prepare('SELECT COUNT(*) FROM "__drizzle_migrations"').pluck().get(), 1)
    migrated.close()

    const malformed = new Database(malformedPath)
    malformed.exec(
      fs
        .readFileSync(path.join(migrationsFolder, "0000_initial.sql"), "utf8")
        .replaceAll("--> statement-breakpoint", ""),
    )
    malformed.exec('DROP TABLE "comments"; CREATE TABLE "comments" (id INTEGER PRIMARY KEY)')
    malformed.close()
    assert.throws(
      () => runMigrations(malformedPath, migrationsFolder, backup),
      /schema does not match committed migrations at table "comments"/,
    )
    assert.equal(backupCalls.length, 1)
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true })
  }
})
