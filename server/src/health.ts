import type { Hono } from "hono"

type HealthDatabase = {
  prepare: (source: string) => { get: () => unknown }
}

export function registerHealth(app: Hono, database: HealthDatabase) {
  app.get("/health", (c) => {
    try {
      database.prepare('SELECT 1 FROM "comments" LIMIT 1').get()
      return c.json({ status: "ok" })
    } catch (error) {
      console.error("[Health] Database check failed", error)
      return c.json({ status: "error" }, 503)
    }
  })
}
