import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { readMigrationFiles } from "drizzle-orm/migrator"
import { backupDatabase } from "./backup.js"
import { requiredEnv } from "./env.js"

const migrationsTable = "__drizzle_migrations"

function migrationState(databasePath: string, migrationsFolder: string) {
  const migrations = readMigrationFiles({ migrationsFolder })
  if (!fs.existsSync(databasePath)) {
    return { hasApplicationSchema: false, hasPendingMigrations: migrations.length > 0 }
  }

  const database = new Database(databasePath, { readonly: true, fileMustExist: true })
  try {
    const hasApplicationSchema = Boolean(
      database
        .prepare(
          `SELECT EXISTS (
            SELECT 1 FROM sqlite_master
            WHERE type = 'table'
              AND name <> '${migrationsTable}'
              AND name NOT GLOB 'sqlite_*'
          )`,
        )
        .pluck()
        .get(),
    )
    const hasMigrationsTable = Boolean(
      database
        .prepare(
          `SELECT EXISTS (
            SELECT 1 FROM sqlite_master
            WHERE type = 'table' AND name = '${migrationsTable}'
          )`,
        )
        .pluck()
        .get(),
    )
    const lastMigrationAt = hasMigrationsTable
      ? database
          .prepare(`SELECT created_at FROM "${migrationsTable}" ORDER BY created_at DESC LIMIT 1`)
          .pluck()
          .get()
      : undefined

    return {
      hasApplicationSchema,
      hasPendingMigrations: migrations.some(
        (migration) =>
          lastMigrationAt === undefined || Number(lastMigrationAt) < migration.folderMillis,
      ),
    }
  } finally {
    database.close()
  }
}

export function runMigrations(
  databasePath: string,
  migrationsFolder: string,
  backup: typeof backupDatabase = backupDatabase,
) {
  const sourcePath = path.resolve(databasePath)
  const folderPath = path.resolve(migrationsFolder)
  const state = migrationState(sourcePath, folderPath)
  if (!state.hasPendingMigrations) {
    console.log("[Migrate] No pending migrations")
    return
  }

  fs.mkdirSync(path.dirname(sourcePath), { recursive: true })
  if (state.hasApplicationSchema) {
    const report = backup(sourcePath)
    console.log(`[Migrate] Backup verified: ${report.backupPath}`)
  }

  const sqlite = new Database(sourcePath)
  try {
    sqlite.pragma("foreign_keys = ON")
    migrate(drizzle(sqlite), {
      migrationsFolder: folderPath,
    })
    console.log("[Migrate] Migrations complete")
  } finally {
    sqlite.close()
  }
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  runMigrations(requiredEnv("DATABASE_URL"), path.resolve(import.meta.dirname, "../drizzle"))
}
