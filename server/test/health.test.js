import assert from "node:assert/strict"
import test from "node:test"
import Database from "better-sqlite3"
import { Hono } from "hono"
import { registerHealth } from "../dist/health.js"

test("health checks SQLite and returns 503 when the query fails", async () => {
  const database = new Database(":memory:")
  const app = new Hono()
  registerHealth(app, database)

  const healthy = await app.request("/health")
  assert.equal(healthy.status, 200)
  assert.deepEqual(await healthy.json(), { status: "ok" })

  database.close()
  const unhealthy = await app.request("/health")
  assert.equal(unhealthy.status, 503)
  assert.deepEqual(await unhealthy.json(), { status: "error" })
})
