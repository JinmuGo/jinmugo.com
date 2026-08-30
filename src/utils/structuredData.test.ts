import { describe, expect, it } from "vitest"
import { buildItemUrl, buildPageUrl, generatePageSchema } from "./structuredData"

describe("structured data URLs", () => {
  it("builds absolute canonical URLs without changing path case", () => {
    expect(buildPageUrl("", "/posts")).toBe("https://jinmu.me/posts/")
    expect(buildItemUrl("/en/posts/Trie-208")).toBe("https://jinmu.me/en/posts/Trie-208/")
    expect(
      generatePageSchema({
        title: "Series",
        description: "Series",
        url: "/series/",
        itemListElements: [
          {
            "@type": "ListItem",
            position: 1,
            url: "/series/example",
            item: { "@type": "Collection", name: "Example", url: "/series/example" },
          },
        ],
      }),
    ).toMatchObject({
      mainEntity: {
        itemListElement: [
          {
            url: "https://jinmu.me/series/example/",
            item: { url: "https://jinmu.me/series/example/" },
          },
        ],
      },
    })
  })
})
