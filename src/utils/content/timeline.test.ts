import { describe, expect, it } from "vitest"
import type { Post, Weekly } from "@/types/content"
import {
  getEntryYear,
  mergeTimelineEntries,
  shouldShowYearMarker,
  timelineEntryToListItem,
} from "@/utils/content/timeline"

function makePost(date: string, slug: string): Post {
  return {
    id: slug,
    slug,
    href: `/posts/${slug}/`,
    type: "post",
    data: {
      title: `Post ${slug}`,
      date: new Date(date),
      draft: false,
      summary: "post summary",
    },
  } as Post
}

function makeWeekly(date: string, slug: string): Weekly {
  return {
    id: slug,
    slug,
    href: `/weekly/${slug}/`,
    type: "weekly",
    data: {
      title: `Weekly ${slug}`,
      date: new Date(date),
      year: 2026,
      week: 20,
      draft: false,
      summary: "weekly summary",
    },
  } as Weekly
}

describe("mergeTimelineEntries", () => {
  it("sorts posts and weeklies by date descending", () => {
    const posts = [makePost("2026-05-01", "older-post")]
    const weeklies = [makeWeekly("2026-05-10", "newer-weekly")]

    const merged = mergeTimelineEntries(posts, weeklies)

    expect(merged.map((entry) => entry.slug)).toEqual(["newer-weekly", "older-post"])
  })
})

describe("getEntryYear", () => {
  it("returns the full year from entry date", () => {
    expect(getEntryYear(makePost("2025-12-31", "end-of-2025"))).toBe(2025)
  })
})

describe("shouldShowYearMarker", () => {
  it("does not show a marker before the first item", () => {
    const items = [makePost("2026-05-01", "latest")]

    expect(shouldShowYearMarker(items, 0)).toBe(false)
  })

  it("shows a marker when the year changes descending into an older year", () => {
    const items = [makePost("2026-05-01", "2026-post"), makePost("2025-12-01", "2025-post")]

    expect(shouldShowYearMarker(items, 0)).toBe(false)
    expect(shouldShowYearMarker(items, 1)).toBe(true)
  })

  it("does not show a marker between items in the same year", () => {
    const items = [makePost("2026-05-01", "newer"), makePost("2026-03-01", "older")]

    expect(shouldShowYearMarker(items, 1)).toBe(false)
  })
})

describe("timelineEntryToListItem", () => {
  it("maps weekly entries to Article schema items", () => {
    const weekly = makeWeekly("2026-05-10", "2026-w20")

    expect(timelineEntryToListItem(weekly, 1)).toEqual({
      "@type": "ListItem",
      url: "/weekly/2026-w20/",
      position: 1,
      item: {
        "@type": "Article",
        name: "Weekly 2026-w20",
        url: "/weekly/2026-w20/",
        description: "weekly summary",
      },
    })
  })

  it("maps post entries to BlogPosting schema items", () => {
    const post = makePost("2026-05-01", "sample-post")

    expect(timelineEntryToListItem(post, 2).item["@type"]).toBe("BlogPosting")
  })
})
