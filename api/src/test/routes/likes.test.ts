import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { pb } from "../../lib/pocketbase.js";
import app from "../../server.js";
import { mockPocketBaseResponse, testData } from "../helpers.js";

// PocketBase 모킹
vi.mock("../../lib/pocketbase", () => ({
  pb: {
    collection: vi.fn(),
  },
  initializePocketBase: vi.fn().mockResolvedValue(true),
  COLLECTIONS: {
    POSTS: "posts",
    POST_LIKES: "post_likes",
    POST_VIEWS: "post_views",
  },
}));

describe("Likes API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/likes/:slug", () => {
    it("should add like to existing post", async () => {
      const mockGetList = vi
        .fn()
        .mockResolvedValueOnce(mockPocketBaseResponse.posts) // 포스트 조회
        .mockResolvedValueOnce({ items: [] }) // 기존 좋아요 없음
        .mockResolvedValueOnce(mockPocketBaseResponse.likes); // 전체 좋아요 조회

      const mockCreate = vi.fn().mockResolvedValue({ id: "new-like-id" });
      const mockGetFullList = vi.fn().mockResolvedValue(mockPocketBaseResponse.likes.items);

      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({
        getList: mockGetList,
        create: mockCreate,
        getFullList: mockGetFullList,
      });

      const response = await request(app)
        .post(`/api/likes/${testData.validSlug}`)
        .send({ count: 2 })
        .set("x-forwarded-for", testData.clientIP);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("count", 2);
      expect(response.body.data).toHaveProperty("total_likes");
      expect(mockCreate).toHaveBeenCalledWith({
        ip_address: expect.stringContaining("127.0.0.1"),
        post_id: "test-post-id",
        count: 2,
      });
    });

    it("should update existing like", async () => {
      const mockGetList = vi
        .fn()
        .mockResolvedValueOnce(mockPocketBaseResponse.posts) // 포스트 조회
        .mockResolvedValueOnce(mockPocketBaseResponse.likes); // 기존 좋아요 있음

      const mockUpdate = vi.fn().mockResolvedValue({ id: "test-like-id" });
      const mockGetFullList = vi.fn().mockResolvedValue(mockPocketBaseResponse.likes.items);

      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({
        getList: mockGetList,
        update: mockUpdate,
        getFullList: mockGetFullList,
      });

      const response = await request(app)
        .post(`/api/likes/${testData.validSlug}`)
        .send({ count: 1 })
        .set("x-forwarded-for", testData.clientIP);

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith("test-like-id", {
        count: 4, // 기존 3 + 새로운 1
        updated: expect.any(String),
      });
    });

    it("should limit likes to maximum 5", async () => {
      const mockGetList = vi
        .fn()
        .mockResolvedValueOnce(mockPocketBaseResponse.posts)
        .mockResolvedValueOnce({
          items: [{ ...mockPocketBaseResponse.likes.items[0], count: 4 }],
        });

      const mockUpdate = vi.fn().mockResolvedValue({ id: "test-like-id" });
      const mockGetFullList = vi.fn().mockResolvedValue([]);

      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({
        getList: mockGetList,
        update: mockUpdate,
        getFullList: mockGetFullList,
      });

      const response = await request(app)
        .post(`/api/likes/${testData.validSlug}`)
        .send({ count: 3 })
        .set("x-forwarded-for", testData.clientIP);

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith("test-like-id", {
        count: 5, // 최대 5로 제한
        updated: expect.any(String),
      });
    });

    it("should return 404 for non-existent post", async () => {
      const mockGetList = vi.fn().mockResolvedValue({ items: [] });
      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({ getList: mockGetList });

      const response = await request(app)
        .post(`/api/likes/${testData.invalidSlug}`)
        .send({ count: 1 });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Post not found");
    });
  });

  describe("GET /api/likes/:slug/my-likes", () => {
    it("should return user's like count", async () => {
      const mockGetList = vi
        .fn()
        .mockResolvedValueOnce(mockPocketBaseResponse.posts)
        .mockResolvedValueOnce(mockPocketBaseResponse.likes);

      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({ getList: mockGetList });

      const response = await request(app)
        .get(`/api/likes/${testData.validSlug}/my-likes`)
        .set("x-forwarded-for", testData.clientIP);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("count", 3);
      expect(response.body.data).toHaveProperty("ip_address");
    });

    it("should return 0 for no likes", async () => {
      const mockGetList = vi
        .fn()
        .mockResolvedValueOnce(mockPocketBaseResponse.posts)
        .mockResolvedValueOnce({ items: [] });

      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({ getList: mockGetList });

      const response = await request(app)
        .get(`/api/likes/${testData.validSlug}/my-likes`)
        .set("x-forwarded-for", testData.clientIP);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("count", 0);
    });
  });

  describe("GET /api/likes/:slug/total", () => {
    it("should return total likes for post", async () => {
      const mockGetList = vi.fn().mockResolvedValue(mockPocketBaseResponse.posts);
      const mockGetFullList = vi.fn().mockResolvedValue([{ count: 3 }, { count: 2 }, { count: 1 }]);

      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({
        getList: mockGetList,
        getFullList: mockGetFullList,
      });

      const response = await request(app).get(`/api/likes/${testData.validSlug}/total`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("total", 6); // 3 + 2 + 1
    });

    it("should return 0 for non-existent post", async () => {
      const mockGetList = vi.fn().mockResolvedValue({ items: [] });
      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({ getList: mockGetList });

      const response = await request(app).get(`/api/likes/${testData.invalidSlug}/total`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("total", 0);
    });
  });
});
