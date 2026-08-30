import type { Hono } from "hono"

type HealthDatabase = {
  prepare: (source: string) => { get: () => unknown }
}

const schemaQueries = [
  'SELECT "id", "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", "scope", "password", "createdAt", "updatedAt" FROM "account" LIMIT 0',
  'SELECT "id", "page", "thread", "author", "content", "timestamp" FROM "comments" LIMIT 0',
  'SELECT "userId", "commentId", "like" FROM "rates" LIMIT 0',
  'SELECT "userId", "name", "canDelete" FROM "roles" LIMIT 0',
  'SELECT "id", "expiresAt", "token", "createdAt", "updatedAt", "ipAddress", "userAgent", "userId" FROM "session" LIMIT 0',
  'SELECT "id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt" FROM "user" LIMIT 0',
  'SELECT "id", "identifier", "value", "expiresAt", "createdAt", "updatedAt" FROM "verification" LIMIT 0',
]

export function registerHealth(app: Hono, database: HealthDatabase) {
  app.get("/health", (c) => {
    try {
      for (const query of schemaQueries) {
        database.prepare(query).get()
      }
      return c.json({ status: "ok" })
    } catch (error) {
      console.error("[Health] Database check failed", error)
      return c.json({ status: "error" }, 503)
    }
  })
}
