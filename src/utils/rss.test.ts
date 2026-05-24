import MarkdownIt from "markdown-it"
import { describe, expect, it } from "vitest"
import { renderRssContent, sanitizeForRss } from "./rss"

describe("sanitizeForRss", () => {
  it("removes invalid XML control characters", () => {
    expect(sanitizeForRss("hello\u0008world\u001d")).toBe("helloworld")
  })

  it("preserves tab, newline, and carriage return", () => {
    expect(sanitizeForRss("a\tb\nc\rd")).toBe("a\tb\nc\rd")
  })
})

describe("renderRssContent", () => {
  it("strips control characters from rendered HTML", () => {
    const parser = new MarkdownIt()
    expect(renderRssContent("text\u0008more", parser)).toBe("<p>textmore</p>\n")
  })
})
