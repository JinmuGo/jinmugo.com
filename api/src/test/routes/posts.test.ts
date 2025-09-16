import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { pb } from "../../lib/pocketbase";
import app from "../../server";
import { mockPocketBaseResponse, testData } from "../helpers";

// PocketBase 모킹
vi.mock("../../lib/pocketbase", () => ({
  pb: {
    collection: vi.fn(),
  },
  COLLECTIONS: {
    POSTS: "posts",
    POST_LIKES: "post_likes",
    POST_VIEWS: "post_views",
  },
}));

describe("Posts API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/posts", () => {
    it("should return posts list", async () => {
      const mockGetList = vi.fn().mockResolvedValue(mockPocketBaseResponse.posts);
      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({ getList: mockGetList });

      const response = await request(app).get("/api/posts");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("pagination");
      expect(mockGetList).toHaveBeenCalledWith(1, 50, {
        filter: "",
        sort: "-created",
        fields: "id,slug,type,created,updated",
      });
    });

    it("should filter posts by type", async () => {
      const mockGetList = vi.fn().mockResolvedValue(mockPocketBaseResponse.posts);
      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({ getList: mockGetList });

      const response = await request(app).get("/api/posts?type=post");

      expect(response.status).toBe(200);
      expect(mockGetList).toHaveBeenCalledWith(1, 50, {
        filter: 'type = "post"',
        sort: "-created",
        fields: "id,slug,type,created,updated",
      });
    });

    it("should handle pagination", async () => {
      const mockGetList = vi.fn().mockResolvedValue(mockPocketBaseResponse.posts);
      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({ getList: mockGetList });

      const response = await request(app).get("/api/posts?limit=10&offset=20");

      expect(response.status).toBe(200);
      expect(mockGetList).toHaveBeenCalledWith(3, 10, expect.any(Object)); // page 3 (20/10 + 1)
    });

    it("should handle PocketBase errors", async () => {
      const mockGetList = vi.fn().mockRejectedValue(new Error("Database error"));
      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({ getList: mockGetList });

      const response = await request(app).get("/api/posts");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Failed to fetch posts");
    });
  });

  describe("GET /api/posts/:slug", () => {
    it("should return specific post", async () => {
      const mockGetList = vi.fn().mockResolvedValue(mockPocketBaseResponse.posts);
      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({ getList: mockGetList });

      const response = await request(app).get(`/api/posts/${testData.validSlug}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(mockGetList).toHaveBeenCalledWith(1, 1, {
        filter: `slug = "${testData.validSlug}"`,
        fields: "id,slug,type,created,updated",
      });
    });

    it("should return 404 for non-existent post", async () => {
      const mockGetList = vi.fn().mockResolvedValue({ items: [] });
      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({ getList: mockGetList });

      const response = await request(app).get(`/api/posts/${testData.invalidSlug}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Post not found");
      expect(response.body).toHaveProperty("slug", testData.invalidSlug);
    });
  });

  describe("GET /api/posts/meta/tags-and-categories", () => {
    it("should return empty tags and categories", async () => {
      const response = await request(app).get("/api/posts/meta/tags-and-categories");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("tags", []);
      expect(response.body.data).toHaveProperty("categories", []);
      expect(response.body).toHaveProperty("message");
    });
  });
});
