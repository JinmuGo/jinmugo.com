import type { Server } from "node:http";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../server.js";

// Mock PocketBase
vi.mock("../lib/pocketbase", () => ({
  pb: {
    collection: vi.fn(),
    baseUrl: "http://mock-pb.com",
  },
  initializePocketBase: vi.fn().mockResolvedValue(true),
  COLLECTIONS: {
    POSTS: "posts",
    POST_LIKES: "post_likes",
    POST_VIEWS: "post_views",
  },
}));

describe("Security Features", () => {
  let server: Server;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll(() => {
    server?.close();
  });

  describe("Helmet Security Headers", () => {
    it("should set basic security headers", async () => {
      const response = await request(app).get("/health");

      expect(response.headers).toHaveProperty("x-dns-prefetch-control");
      expect(response.headers).toHaveProperty("x-frame-options");
      expect(response.headers["strict-transport-security"]).toBeDefined();
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
    });
  });

  describe("Rate Limiting", () => {
    // This test might be flaky if the actual rate limit is very high.
    // For TDD, we assume we will configure a lower limit for testing or a reasonable one.
    // We'll test the /api/likes endpoint as it's a critical resource.

    it("should have rate limiting headers on API endpoints", async () => {
      const response = await request(app).get("/api/likes/test-slug/total");

      // express-rate-limit adds these headers by default
      expect(response.headers).toHaveProperty("x-ratelimit-limit");
      expect(response.headers).toHaveProperty("x-ratelimit-remaining");
    });
  });
});
