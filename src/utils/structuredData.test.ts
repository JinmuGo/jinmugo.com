import { describe, expect, it } from "vitest"
import {
  AUTHOR_URL,
  buildItemUrl,
  buildPageUrl,
  generateArticleSchema,
  generatePageSchema,
  generatePersonSchema,
  generateWebsiteSchema,
  PERSON_ID,
  WEBSITE_ID,
} from "./structuredData"

describe("structured data", () => {
  it("links canonical pages, author, and website with stable IDs", () => {
    expect(buildPageUrl("", "/posts")).toBe("https://jinmu.me/posts/")
    expect(buildItemUrl("/en/posts/Trie-208")).toBe("https://jinmu.me/en/posts/Trie-208/")
    const page = generatePageSchema({
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
    })

    expect(page).toMatchObject({
      "@id": "https://jinmu.me/series/#webpage",
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: {
        itemListElement: [
          {
            url: "https://jinmu.me/series/example/",
            item: { url: "https://jinmu.me/series/example/" },
          },
        ],
      },
    })

    const article = generateArticleSchema({
      title: "Example",
      description: "Example article",
      url: "/posts/example/",
      datePublished: "2026-08-30T00:00:00.000Z",
      authorName: "Jinmu Go",
      authorUrl: AUTHOR_URL,
    })

    expect(article).toMatchObject({
      "@id": "https://jinmu.me/posts/example/#article",
      author: {
        "@type": "Person",
        "@id": PERSON_ID,
        name: "Jinmu Go",
        url: AUTHOR_URL,
        sameAs: ["https://github.com/JinmuGo", "https://www.linkedin.com/in/jinmugo"],
      },
      publisher: { "@type": "Person", "@id": PERSON_ID },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://jinmu.me/posts/example/#webpage",
      },
    })

    expect(
      generatePageSchema({
        type: "ProfilePage",
        title: "About",
        description: "About Jinmu Go",
        url: AUTHOR_URL,
      }),
    ).toMatchObject({ mainEntity: { "@id": PERSON_ID } })
    expect(generatePersonSchema({ name: "Jinmu Go", url: AUTHOR_URL })).toMatchObject({
      "@id": PERSON_ID,
      url: AUTHOR_URL,
    })
    expect(
      generateWebsiteSchema({
        name: "Jinmu Go",
        url: "https://jinmu.me",
        description: "Blog",
      }),
    ).toMatchObject({ "@id": WEBSITE_ID, publisher: { "@id": PERSON_ID } })
    expect(JSON.stringify({ page, article })).not.toContain('"@type":"Organization"')
  })
})
