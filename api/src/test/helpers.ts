import type { Express } from "express";
import request from "supertest";

// Mock PocketBase responses
export const mockPocketBaseResponse = {
  posts: {
    items: [
      {
        id: "test-post-id",
        slug: "test-post",
        type: "post",
        created: "2024-01-01T00:00:00.000Z",
        updated: "2024-01-01T00:00:00.000Z",
      },
    ],
    page: 1,
    perPage: 50,
    totalItems: 1,
    totalPages: 1,
  },
  likes: {
    items: [
      {
        id: "test-like-id",
        ip_address: "127.0.0.1",
        post_id: "test-post-id",
        count: 3,
        created: "2024-01-01T00:00:00.000Z",
        updated: "2024-01-01T00:00:00.000Z",
      },
    ],
  },
  views: {
    items: [
      {
        id: "test-view-id",
        post_id: "test-post-id",
        count: 100,
        created: "2024-01-01T00:00:00.000Z",
        updated: "2024-01-01T00:00:00.000Z",
      },
    ],
  },
};

// 테스트용 request helper
export const createTestRequest = (app: Express) => request(app);

// 일반적인 테스트 데이터
export const testData = {
  validSlug: "test-post",
  invalidSlug: "non-existent-post",
  clientIP: "127.0.0.1",
} as const;
