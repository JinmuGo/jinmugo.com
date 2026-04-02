import { describe, expect, it } from "vitest"
import { buildLocalizedUrl, detectLanguage, getLanguagePrefix } from "./language"

describe("language utils", () => {
  describe("detectLanguage", () => {
    it('should return "en" for paths starting with /en', () => {
      expect(detectLanguage("/en/some-post")).toBe("en")
      expect(detectLanguage("/en")).toBe("en")
    })

    it('should return "ko" for paths not starting with /en', () => {
      expect(detectLanguage("/some-post")).toBe("ko")
      expect(detectLanguage("/")).toBe("ko")
      expect(detectLanguage("/kr/some-post")).toBe("ko")
    })
  })

  describe("getLanguagePrefix", () => {
    it('should return "/en" for "en"', () => {
      expect(getLanguagePrefix("en")).toBe("/en")
    })

    it('should return "" for "ko"', () => {
      expect(getLanguagePrefix("ko")).toBe("")
    })
  })

  describe("buildLocalizedUrl", () => {
    it("should prepend /en for English", () => {
      expect(buildLocalizedUrl("/post", "en")).toBe("/en/post")
      expect(buildLocalizedUrl("post", "en")).toBe("/en/post")
    })

    it("should not prepend anything for Korean", () => {
      expect(buildLocalizedUrl("/post", "ko")).toBe("/post")
      expect(buildLocalizedUrl("post", "ko")).toBe("/post")
    })
  })
})
