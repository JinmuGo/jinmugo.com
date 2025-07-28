// setImmediate polyfill for Cloudflare Workers (V8)
if (typeof globalThis.setImmediate === "undefined") {
  // @ts-ignore
  globalThis.setImmediate = (fn: (...args: unknown[]) => void, ...args: unknown[]) => {
    return setTimeout(fn, 0, ...args);
  };
}

import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { GetMyLike } from "./endpoints/like/getMyLike";
import { GetTotalLikes } from "./endpoints/like/getTotalLikes";
// Import API endpoints
import { LikePost } from "./endpoints/like/likePost";
import { GetPostView } from "./endpoints/view/[slug]/get";
import { IncrementPostView } from "./endpoints/view/[slug]/post";
import type { Env } from "./types";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Enable CORS for all routes
app.use(
  "*",
  cors({
    origin: ["https://jinmu.me", "https://blog.jinmu.me", "http://localhost:4321"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "x-user-id"],
    credentials: true,
  }),
);

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
});

// Like API endpoints
openapi.post("/api/like/:slug", LikePost);
openapi.get("/api/like/:slug/me", GetMyLike);
openapi.get("/api/like/:slug/total", GetTotalLikes);

// View API endpoints
openapi.get("/api/view/:slug", GetPostView);
openapi.post("/api/view/:slug", IncrementPostView);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Export the Hono app
export default app;
