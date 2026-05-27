import { describe, expect, it } from "vitest"
import type { Post, Weekly } from "@/types/content"
import { mergeTimelineEntries, timelineEntryToListItem } from "@/utils/content/timeline"

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
