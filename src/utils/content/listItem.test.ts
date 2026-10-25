import { describe, expect, it } from "vitest"
import type { Post } from "@/types/content"
import { postToListItem } from "@/utils/content/listItem"

describe("postToListItem", () => {
  it("maps a post to a BlogPosting list item", () => {
    const post = {
      id: "sample-post",
      slug: "sample-post",
      href: "/posts/sample-post/",
      type: "post",
      data: {
        title: "Sample",
        date: new Date("2026-05-01"),
        draft: false,
        summary: "post summary",
      },
    } as Post

    expect(postToListItem(post, 2)).toEqual({
      "@type": "ListItem",
      url: "https://jinmugo.com/posts/sample-post/",
      position: 2,
      item: {
        "@type": "BlogPosting",
        name: "Sample",
        url: "https://jinmugo.com/posts/sample-post/",
        description: "post summary",
      },
    })
  })
})
