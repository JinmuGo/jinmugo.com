import { beforeEach, describe, expect, it, vi } from "vitest";

// Mutable mock for configuration
const firestoreConfig = {
  enabled: true,
};

vi.mock("../../lib/firestore", () => ({
  get FIRESTORE_ENABLED() {
    return firestoreConfig.enabled;
  },
}));

// Mock services
vi.mock("../../services/firestore-stats.service", () => ({
  firestoreStatsService: {
    incrementViews: vi.fn(),
    getViews: vi.fn(),
    incrementLikes: vi.fn(),
    getMyLikes: vi.fn(),
    getTotalLikes: vi.fn(),
  },
}));

vi.mock("../../services/pocketbase-stats.service", () => ({
  pocketbaseStatsService: {
    incrementViews: vi.fn(),
    getViews: vi.fn(),
    incrementLikes: vi.fn(),
    getMyLikes: vi.fn(),
    getTotalLikes: vi.fn(),
  },
}));

import { firestoreStatsService } from "../../services/firestore-stats.service";
import { pocketbaseStatsService } from "../../services/pocketbase-stats.service";
import { statsService } from "../../services/stats.service";

describe("StatsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestoreConfig.enabled = true;
  });

  describe("incrementViews", () => {
    it("should use Firestore when enabled", async () => {
      firestoreConfig.enabled = true;
      await statsService.incrementViews("slug", 1);
      expect(firestoreStatsService.incrementViews).toHaveBeenCalledWith("slug", 1);
      expect(pocketbaseStatsService.incrementViews).not.toHaveBeenCalled();
    });

    it("should use PocketBase when Firestore is disabled", async () => {
      firestoreConfig.enabled = false;
      await statsService.incrementViews("slug", 1);
      expect(firestoreStatsService.incrementViews).not.toHaveBeenCalled();
      expect(pocketbaseStatsService.incrementViews).toHaveBeenCalledWith("slug", 1);
    });

    it("should fallback to PocketBase when Firestore fails", async () => {
      firestoreConfig.enabled = true;
      vi.mocked(firestoreStatsService.incrementViews).mockRejectedValueOnce(
        new Error("Firestore error"),
      );

      await statsService.incrementViews("slug", 1);

      expect(firestoreStatsService.incrementViews).toHaveBeenCalled();
      expect(pocketbaseStatsService.incrementViews).toHaveBeenCalledWith("slug", 1);
    });
  });

  describe("incrementLikes", () => {
    it("should use Firestore when enabled", async () => {
      firestoreConfig.enabled = true;
      await statsService.incrementLikes("slug", "127.0.0.1", 1);
      expect(firestoreStatsService.incrementLikes).toHaveBeenCalledWith("slug", "127.0.0.1", 1);
      expect(pocketbaseStatsService.incrementLikes).not.toHaveBeenCalled();
    });

    it("should use PocketBase when Firestore is disabled", async () => {
      firestoreConfig.enabled = false;
      await statsService.incrementLikes("slug", "127.0.0.1", 1);
      expect(firestoreStatsService.incrementLikes).not.toHaveBeenCalled();
      expect(pocketbaseStatsService.incrementLikes).toHaveBeenCalledWith("slug", "127.0.0.1", 1);
    });

    it("should fallback to PocketBase when Firestore fails", async () => {
      firestoreConfig.enabled = true;
      vi.mocked(firestoreStatsService.incrementLikes).mockRejectedValueOnce(
        new Error("Firestore error"),
      );

      await statsService.incrementLikes("slug", "127.0.0.1", 1);

      expect(firestoreStatsService.incrementLikes).toHaveBeenCalled();
      expect(pocketbaseStatsService.incrementLikes).toHaveBeenCalledWith("slug", "127.0.0.1", 1);
    });
  });

  describe("getViews", () => {
    it("should use Firestore when enabled", async () => {
      firestoreConfig.enabled = true;
      await statsService.getViews("slug");
      expect(firestoreStatsService.getViews).toHaveBeenCalledWith("slug");
      expect(pocketbaseStatsService.getViews).not.toHaveBeenCalled();
    });

    it("should use PocketBase when Firestore is disabled", async () => {
      firestoreConfig.enabled = false;
      await statsService.getViews("slug");
      expect(firestoreStatsService.getViews).not.toHaveBeenCalled();
      expect(pocketbaseStatsService.getViews).toHaveBeenCalledWith("slug");
    });

    it("should fallback to PocketBase when Firestore fails", async () => {
      firestoreConfig.enabled = true;
      vi.mocked(firestoreStatsService.getViews).mockRejectedValueOnce(new Error("Firestore error"));

      await statsService.getViews("slug");

      expect(firestoreStatsService.getViews).toHaveBeenCalled();
      expect(pocketbaseStatsService.getViews).toHaveBeenCalledWith("slug");
    });
  });

  describe("getTotalLikes", () => {
    it("should use Firestore when enabled", async () => {
      firestoreConfig.enabled = true;
      await statsService.getTotalLikes("slug");
      expect(firestoreStatsService.getTotalLikes).toHaveBeenCalledWith("slug");
      expect(pocketbaseStatsService.getTotalLikes).not.toHaveBeenCalled();
    });

    it("should use PocketBase when Firestore is disabled", async () => {
      firestoreConfig.enabled = false;
      await statsService.getTotalLikes("slug");
      expect(firestoreStatsService.getTotalLikes).not.toHaveBeenCalled();
      expect(pocketbaseStatsService.getTotalLikes).toHaveBeenCalledWith("slug");
    });

    it("should fallback to PocketBase when Firestore fails", async () => {
      firestoreConfig.enabled = true;
      vi.mocked(firestoreStatsService.getTotalLikes).mockRejectedValueOnce(
        new Error("Firestore error"),
      );

      await statsService.getTotalLikes("slug");

      expect(firestoreStatsService.getTotalLikes).toHaveBeenCalled();
      expect(pocketbaseStatsService.getTotalLikes).toHaveBeenCalledWith("slug");
    });
  });
});
