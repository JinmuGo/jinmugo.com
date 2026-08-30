import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { readMigrationFiles } from "drizzle-orm/migrator"
import { backupDatabase } from "./backup.js"

const migrationsTable = "__drizzle_migrations"
type SqliteDatabase = InstanceType<typeof Database>
type Migration = ReturnType<typeof readMigrationFiles>[number]

function schemaSnapshot(database: SqliteDatabase) {
  const tableNames = database
    .prepare(
      `SELECT name FROM sqlite_master
       WHERE type = 'table' AND name <> ? AND name NOT GLOB 'sqlite_*'
       ORDER BY name`,
    )
    .pluck()
    .all(migrationsTable) as string[]
  const tableSql = database
    .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?")
    .pluck()

  return Object.fromEntries(
    tableNames.map((table) => [
      table,
      {
        columns: database
          .prepare(
            `SELECT name, upper(type) AS type, p.[notnull] AS not_null,
                    dflt_value AS default_value, pk
             FROM pragma_table_info(?) AS p ORDER BY cid`,
          )
          .all(table),
        foreignKeys: database
          .prepare(
            `SELECT "table" AS target_table, "from" AS from_column, "to" AS to_column,
                    on_update, on_delete, match
             FROM pragma_foreign_key_list(?) ORDER BY id, seq`,
          )
          .all(table),
        indexes: (
          database
            .prepare(
              `SELECT name, "unique" AS is_unique, origin, partial
               FROM pragma_index_list(?) ORDER BY origin, name`,
            )
            .all(table) as { name: string; is_unique: number; origin: string; partial: number }[]
        ).map((index) => ({
          name: index.origin === "c" ? index.name : index.origin,
          unique: index.is_unique,
          partial: index.partial,
          columns: database
            .prepare(
              `SELECT name, desc, coll FROM pragma_index_xinfo(?)
               WHERE "key" = 1 ORDER BY seqno`,
            )
            .all(index.name),
        })),
        autoIncrement: /\bAUTOINCREMENT\b/i.test(String(tableSql.get(table) ?? "")),
      },
    ]),
  )
}

function expectedSchema(migrations: Migration[]) {
  const database = new Database(":memory:")
  try {
    database.transaction(() => {
      for (const migration of migrations) {
        for (const statement of migration.sql) {
          database.exec(statement)
        }
      }
    })()
    return schemaSnapshot(database)
  } finally {
    database.close()
  }
}

function assertSchemaMatches(database: SqliteDatabase, migrations: Migration[]) {
  const actual = schemaSnapshot(database)
  const expected = expectedSchema(migrations)
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    return
  }

  const table = [...new Set([...Object.keys(actual), ...Object.keys(expected)])].find(
    (name) => JSON.stringify(actual[name]) !== JSON.stringify(expected[name]),
  )
  throw new Error(
    `SQLite schema does not match committed migrations${table ? ` at table "${table}"` : ""}; migrate or restore it manually before deployment`,
  )
}

function migrationState(databasePath: string, migrationsFolder: string) {
  const migrations = readMigrationFiles({ migrationsFolder })
  if (!fs.existsSync(databasePath)) {
    return {
      migrations,
      hasApplicationSchema: false,
      hasPendingMigrations: migrations.length > 0,
      pendingMigrationHash: migrations.at(-1)?.hash,
    }
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
    const appliedMigrations = hasMigrationsTable
      ? migrations.filter((migration) => Number(lastMigrationAt) >= migration.folderMillis)
      : migrations
    if (hasApplicationSchema) {
      assertSchemaMatches(database, appliedMigrations)
    }
    const pendingMigrations = migrations.filter(
      (migration) =>
        lastMigrationAt === undefined || Number(lastMigrationAt) < migration.folderMillis,
    )

    return {
      migrations,
      hasApplicationSchema,
      hasPendingMigrations: pendingMigrations.length > 0,
      pendingMigrationHash: pendingMigrations.at(-1)?.hash,
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
    const backupName = `${path.basename(sourcePath)}.before-${state.pendingMigrationHash}.sqlite`
    const report = backup(sourcePath, undefined, backupName)
    console.log(`[Migrate] Backup ${report.reused ? "reused" : "verified"}: ${report.backupPath}`)
  }

  const sqlite = new Database(sourcePath)
  try {
    sqlite.pragma("foreign_keys = ON")
    migrate(drizzle(sqlite), {
      migrationsFolder: folderPath,
    })
    assertSchemaMatches(sqlite, state.migrations)
    console.log("[Migrate] Migrations complete")
  } finally {
    sqlite.close()
  }
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const { config } = await import("./runtime-config.js")
  runMigrations(config.databaseUrl, path.resolve(import.meta.dirname, "../drizzle"))
}
