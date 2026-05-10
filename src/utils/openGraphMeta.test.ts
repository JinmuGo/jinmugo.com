import { describe, expect, it } from "vitest"
import { buildContentOgImagePath, getOpenGraphImageSource } from "./openGraphMeta"

describe("open graph metadata utils", () => {
  describe("buildContentOgImagePath", () => {
    it("builds a localized English post OG image path", () => {
      expect(
        buildContentOgImagePath({
          contentType: "post",
          pathname: "/en/posts/12th-9oormthon/",
          slug: "12th-9oormthon",
        }),
      ).toBe("/en/posts/12th-9oormthon/og.png")
    })

    it("keeps Korean content OG image paths at the root locale", () => {
      expect(
        buildContentOgImagePath({
          contentType: "post",
          pathname: "/posts/12th-9oormthon/",
          slug: "12th-9oormthon",
        }),
      ).toBe("/posts/12th-9oormthon/og.png")
    })

    it("builds a weekly OG image path", () => {
      expect(
        buildContentOgImagePath({
          contentType: "weekly",
          pathname: "/weekly/001/",
          slug: "001",
        }),
      ).toBe("/weekly/001/og.png")
    })
  })

  describe("getOpenGraphImageSource", () => {
    it("uses a string image path as-is", () => {
      expect(getOpenGraphImageSource("/avatar.webp")).toBe("/avatar.webp")
    })

    it("uses the src field from Astro image metadata", () => {
      expect(getOpenGraphImageSource({ src: "/_astro/avatar.hash.webp" })).toBe(
        "/_astro/avatar.hash.webp",
      )
    })
  })
})
