import { HonoComment } from "@fuma-comment/server/hono"
import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { auth } from "./auth.js"
import { commentAuth, storage } from "./comment.js"
import { sqlite } from "./db/index.js"
import { registerHealth } from "./health.js"
import { config } from "./runtime-config.js"

// strict: false → treat /foo and /foo/ as the same route. fuma-comment's
// client appends a trailing slash before the query string (/api/comments/[page]/?sort=...)
// while its server-side route is registered as /comments/[page] without
// a trailing slash, so strict matching produces 404 on every list fetch.
const app = new Hono({ strict: false })

// CORS — credentials: true for BetterAuth session cookies
// Dynamic origin: echo the request origin back if it's in the allowlist
app.use(
  "*",
  cors({
    origin: (origin) => (config.frontendOrigins.includes(origin) ? origin : null),
    credentials: true,
  }),
)

// BetterAuth routes — /api/auth/*
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw))

// fuma-comment routes — final paths become /api/comments/*
// fuma-comment's internal routes are already prefixed with /comments,
// so baseUrl must be "/api" (not "/api/comments") to avoid double-prefix.
HonoComment({
  app,
  storage,
  auth: commentAuth,
  baseUrl: "/api",
})

registerHealth(app, sqlite)

console.log(`Comment server running on port ${config.port}`)
serve({ fetch: app.fetch, port: config.port })
