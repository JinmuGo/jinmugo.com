import { describe, expect, it } from "vitest"
import type { Post } from "@/types/content"
import { groupContentBySeries, sortSeriesList } from "./series"

// Helper to create mock content
const createMockPost = (
  id: string,
  series: string | undefined,
  date: string,
  seriesOrder?: number,
  category?: string,
): Post =>
  ({
    id,
    slug: id,
    body: "",
    collection: "blog",
    data: {
      title: `Post ${id}`,
      date: new Date(date),
      series,
      seriesOrder,
      category,
      description: "",
      tags: [],
      draft: false,
      lang: "en",
    },
  }) as unknown as Post

describe("series utils", () => {
  describe("groupContentBySeries", () => {
    it("should group posts by series", () => {
      const posts = [
        createMockPost("1", "Series A", "2023-01-01"),
        createMockPost("2", "Series B", "2023-01-02"),
        createMockPost("3", "Series A", "2023-01-03"),
      ]

      const result = groupContentBySeries(posts)
      expect(result).toHaveLength(2)

      const seriesA = result.find((s) => s.name === "Series A")
      expect(seriesA).toBeDefined()
      expect(seriesA?.totalPosts).toBe(2)
      expect(seriesA?.posts).toHaveLength(2)

      const seriesB = result.find((s) => s.name === "Series B")
      expect(seriesB).toBeDefined()
      expect(seriesB?.totalPosts).toBe(1)
    })

    it("should calculate date ranges correctly", () => {
      const posts = [
        createMockPost("1", "Series A", "2023-01-10"),
        createMockPost("2", "Series A", "2023-01-01"),
        createMockPost("3", "Series A", "2023-01-20"),
      ]

      const result = groupContentBySeries(posts)
      const seriesA = result.find((s) => s.name === "Series A")

      expect(seriesA?.firstPublished).toEqual(new Date("2023-01-01"))
      expect(seriesA?.lastUpdated).toEqual(new Date("2023-01-20"))
    })

    it("should determine primary category", () => {
      const posts = [
        createMockPost("1", "Series A", "2023-01-01", 1, "Tech"),
        createMockPost("2", "Series A", "2023-01-02", 2, "Life"),
        createMockPost("3", "Series A", "2023-01-03", 3, "Tech"),
      ]

      const result = groupContentBySeries(posts)
      const seriesA = result.find((s) => s.name === "Series A")

      expect(seriesA?.primaryCategory).toBe("Tech")
    })

    it("should sort posts by seriesOrder", () => {
      const posts = [
        createMockPost("1", "Series A", "2023-01-01", 2),
        createMockPost("2", "Series A", "2023-01-02", 1),
        createMockPost("3", "Series A", "2023-01-03", 3),
      ]

      const result = groupContentBySeries(posts)
      const seriesA = result.find((s) => s.name === "Series A")

      expect(seriesA?.posts[0].id).toBe("2") // Order 1
      expect(seriesA?.posts[1].id).toBe("1") // Order 2
      expect(seriesA?.posts[2].id).toBe("3") // Order 3
    })

    it("should fallback to date sort if seriesOrder is missing", () => {
      const posts = [
        createMockPost("1", "Series A", "2023-01-03"), // Latest
        createMockPost("2", "Series A", "2023-01-01"), // Earliest
      ]

      const result = groupContentBySeries(posts)
      const seriesA = result.find((s) => s.name === "Series A")

      expect(seriesA?.posts[0].id).toBe("2")
      expect(seriesA?.posts[1].id).toBe("1")
    })
  })

  describe("sortSeriesList", () => {
    const seriesList = [
      {
        name: "Alpha",
        totalPosts: 5,
        lastUpdated: new Date("2023-01-01"),
        posts: [],
        firstPublished: new Date("2023-01-01"),
        primaryCategory: null,
        categoryDistribution: {},
      },
      {
        name: "Beta",
        totalPosts: 10,
        lastUpdated: new Date("2023-02-01"), // Newer
        posts: [],
        firstPublished: new Date("2023-01-01"),
        primaryCategory: null,
        categoryDistribution: {},
      },
    ]

    it("should sort by latest", () => {
      const sorted = sortSeriesList(seriesList, "latest")
      expect(sorted[0].name).toBe("Beta")
      expect(sorted[1].name).toBe("Alpha")
    })

    it("should sort by name", () => {
      const sorted = sortSeriesList(seriesList, "name")
      expect(sorted[0].name).toBe("Alpha")
      expect(sorted[1].name).toBe("Beta")
    })

    it("should sort by count", () => {
      const sorted = sortSeriesList(seriesList, "count")
      expect(sorted[0].name).toBe("Beta") // 10 posts
      expect(sorted[1].name).toBe("Alpha") // 5 posts
    })
  })
})
