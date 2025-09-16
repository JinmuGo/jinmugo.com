import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { pb } from "../../lib/pocketbase";
import app from "../../server";
import { mockPocketBaseResponse, testData } from "../helpers";

// PocketBase 모킹
vi.mock("../../lib/pocketbase");

describe("Views API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/views/:slug", () => {
    it("should increment views for existing post", async () => {
      const mockGetList = vi
        .fn()
        .mockResolvedValueOnce(mockPocketBaseResponse.posts) // 포스트 조회
        .mockResolvedValueOnce(mockPocketBaseResponse.views); // 기존 조회수 있음

      const mockUpdate = vi.fn().mockResolvedValue({
        id: "test-view-id",
        count: 101,
      });

      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({
        getList: mockGetList,
        update: mockUpdate,
      });

      const response = await request(app)
        .post(`/api/views/${testData.validSlug}`)
        .send({ count: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("views", 101);
      expect(response.body.data).toHaveProperty("post_id", "test-post-id");
      expect(mockUpdate).toHaveBeenCalledWith("test-view-id", {
        count: 101, // 기존 100 + 1
      });
    });

    it("should create new view record for new post", async () => {
      const mockGetList = vi
        .fn()
        .mockResolvedValueOnce({ items: [] }) // 포스트 없음
        .mockResolvedValueOnce({ items: [] }); // 조회수 없음

      const mockCreate = vi
        .fn()
        .mockResolvedValueOnce({
          // 포스트 생성
          id: "new-post-id",
          slug: testData.validSlug,
          type: "post",
        })
        .mockResolvedValueOnce({
          // 조회수 생성
          id: "new-view-id",
          count: 1,
        });

      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({
        getList: mockGetList,
        create: mockCreate,
      });

      const response = await request(app)
        .post(`/api/views/${testData.validSlug}`)
        .send({ count: 1 });

      expect(response.status).toBe(200);
      expect(mockCreate).toHaveBeenCalledWith({
        slug: testData.validSlug,
        type: "post",
      });
      expect(mockCreate).toHaveBeenCalledWith({
        post_id: "new-post-id",
        count: 1,
      });
    });

    it("should create new view record for existing post without views", async () => {
      const mockGetList = vi
        .fn()
        .mockResolvedValueOnce(mockPocketBaseResponse.posts) // 포스트 있음
        .mockResolvedValueOnce({ items: [] }); // 조회수 없음

      const mockCreate = vi.fn().mockResolvedValue({
        id: "new-view-id",
        count: 5,
      });

      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({
        getList: mockGetList,
        create: mockCreate,
      });

      const response = await request(app)
        .post(`/api/views/${testData.validSlug}`)
        .send({ count: 5 });

      expect(response.status).toBe(200);
      expect(mockCreate).toHaveBeenCalledWith({
        post_id: "test-post-id",
        count: 5,
      });
    });

    it("should handle multiple view increments", async () => {
      const mockGetList = vi
        .fn()
        .mockResolvedValueOnce(mockPocketBaseResponse.posts)
        .mockResolvedValueOnce(mockPocketBaseResponse.views);

      const mockUpdate = vi.fn().mockResolvedValue({
        id: "test-view-id",
        count: 110,
      });

      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({
        getList: mockGetList,
        update: mockUpdate,
      });

      const response = await request(app)
        .post(`/api/views/${testData.validSlug}`)
        .send({ count: 10 });

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith("test-view-id", {
        count: 110, // 기존 100 + 10
      });
    });
  });

  describe("GET /api/views/:slug", () => {
    it("should return view count for existing post", async () => {
      const mockGetList = vi
        .fn()
        .mockResolvedValueOnce(mockPocketBaseResponse.posts)
        .mockResolvedValueOnce(mockPocketBaseResponse.views);

      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({ getList: mockGetList });

      const response = await request(app).get(`/api/views/${testData.validSlug}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("views", 100);
      expect(response.body.data).toHaveProperty("slug", "test-post");
    });

    it("should return 0 views for non-existent post", async () => {
      const mockGetList = vi.fn().mockResolvedValue({ items: [] });
      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({ getList: mockGetList });

      const response = await request(app).get(`/api/views/${testData.invalidSlug}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("views", 0);
    });

    it("should return 0 views for post without view records", async () => {
      const mockGetList = vi
        .fn()
        .mockResolvedValueOnce(mockPocketBaseResponse.posts)
        .mockResolvedValueOnce({ items: [] }); // 조회수 없음

      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({ getList: mockGetList });

      const response = await request(app).get(`/api/views/${testData.validSlug}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("views", 0);
    });

    it("should handle PocketBase errors", async () => {
      const mockGetList = vi.fn().mockRejectedValue(new Error("Database error"));
      // biome-ignore lint/suspicious/noExplicitAny: Mocking requires any type
      (pb.collection as any).mockReturnValue({ getList: mockGetList });

      const response = await request(app).get(`/api/views/${testData.validSlug}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Failed to fetch views");
    });
  });
});
