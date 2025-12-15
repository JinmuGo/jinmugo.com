import type { Server } from "node:http";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { pb } from "../lib/pocketbase.js";
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

describe("Concurrency Handling", () => {
  let server: Server;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll(() => {
    server?.close();
  });

  describe("POST /api/views/:slug", () => {
    it("should use atomic update for view counts", async () => {
      // Mock setups
      const mockUpdate = vi.fn().mockResolvedValue({ count: 10 });
      const mockGetList = vi
        .fn()
        .mockResolvedValueOnce({ items: [{ id: "post-1" }] }) // posts found
        .mockResolvedValueOnce({ items: [{ id: "view-1", count: 5 }] }); // view record found

      // biome-ignore lint/suspicious/noExplicitAny: Mocking
      (pb.collection as any).mockReturnValue({
        getList: mockGetList,
        update: mockUpdate,
        create: vi.fn(),
      });

      await request(app).post("/api/views/test-post").send({ count: 1 });

      // Verify update was called with atomic syntax
      // PocketBase atomic update uses "field+" key
      expect(mockUpdate).toHaveBeenCalledWith(
        "view-1",
        expect.objectContaining({
          "count+": 1,
        }),
      );
    });
  });
});
