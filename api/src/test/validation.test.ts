import type { Server } from "node:http";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import app from "../server";

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

describe("Input Validation", () => {
  let server: Server;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll(() => {
    server?.close();
  });

  describe("POST /api/likes/:slug", () => {
    it("should reject negative count", async () => {
      const response = await request(app).post("/api/likes/test-post").send({ count: -1 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should reject zero count", async () => {
      const response = await request(app).post("/api/likes/test-post").send({ count: 0 });

      expect(response.status).toBe(400);
    });

    it("should reject excessively large count", async () => {
      const response = await request(app).post("/api/likes/test-post").send({ count: 100 });

      expect(response.status).toBe(400);
    });

    it("should reject non-numeric count", async () => {
      const response = await request(app).post("/api/likes/test-post").send({ count: "invalid" });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/views/:slug", () => {
    it("should reject negative count", async () => {
      const response = await request(app).post("/api/views/test-post").send({ count: -5 });

      expect(response.status).toBe(400);
    });

    it("should reject excessively large count", async () => {
      const response = await request(app).post("/api/views/test-post").send({ count: 1000 });

      expect(response.status).toBe(400);
    });
  });
});
