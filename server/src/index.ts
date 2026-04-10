import { HonoComment } from "@fuma-comment/server/hono"
import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { auth } from "./auth.js"
import { commentAuth, storage } from "./comment.js"

const app = new Hono()

const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:4321")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean)

// CORS — credentials: true for BetterAuth session cookies
// Dynamic origin: echo the request origin back if it's in the allowlist
app.use(
  "*",
  cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
    credentials: true,
  }),
)

// BetterAuth routes — /api/auth/*
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw))

// fuma-comment routes — /api/comments/*
// baseUrl is required: without it the routes mount at /comments/* and the
// frontend (which calls /api/comments/*) gets 404 on every request.
HonoComment({
  app,
  storage,
  auth: commentAuth,
  baseUrl: "/api/comments",
})

// Health check
app.get("/health", (c) => c.json({ status: "ok" }))

const port = Number(process.env.PORT ?? 3001)

console.log(`Comment server running on port ${port}`)
serve({ fetch: app.fetch, port })
