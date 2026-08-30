import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { backupDatabase } from "./backup.js"
import { requiredEnv } from "./env.js"

export function prepareDatabase(
  databasePath: string,
  backup: typeof backupDatabase = backupDatabase,
) {
  if (fs.existsSync(databasePath)) {
    return backup(databasePath)
  }
  fs.mkdirSync(path.dirname(databasePath), { recursive: true })
}

function runMigrations() {
  const databasePath = path.resolve(requiredEnv("DATABASE_URL"))
  const backup = prepareDatabase(databasePath)
  if (backup) {
    console.log(`[Migrate] Backup verified: ${backup.backupPath}`)
  }

  const sqlite = new Database(databasePath)
  try {
    sqlite.pragma("foreign_keys = ON")
    migrate(drizzle(sqlite), {
      migrationsFolder: path.resolve(import.meta.dirname, "../drizzle"),
    })
    console.log("[Migrate] Migrations complete")
  } finally {
    sqlite.close()
  }
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  runMigrations()
}
