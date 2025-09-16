import type { Server } from "node:http";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../server";

describe("Server", () => {
  let server: Server;

  beforeAll(() => {
    // 테스트용 서버 시작
    server = app.listen(0);
  });

  afterAll(() => {
    // 테스트 후 서버 종료
    server?.close();
  });

  describe("Health Check", () => {
    it("should return server status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("pocketbase");
    });
  });

  describe("404 Handler", () => {
    it("should return 404 for unknown endpoints", async () => {
      const response = await request(app).get("/unknown-endpoint");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Endpoint not found");
    });
  });

  describe("CORS", () => {
    it("should include CORS headers", async () => {
      const response = await request(app).get("/health").set("Origin", "http://localhost:4321");

      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });
  });
});
