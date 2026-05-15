import { describe, expect, it } from "vitest"
import { ESSAY_MIN_CHARS, hasEssay } from "./hasEssay"

describe("hasEssay", () => {
  it("returns false for empty body", () => {
    expect(hasEssay("")).toBe(false)
  })

  it("returns false for short body under threshold", () => {
    expect(hasEssay("짧은 메모.")).toBe(false)
  })

  it("returns true for body over threshold", () => {
    const longBody = "가".repeat(ESSAY_MIN_CHARS + 1)
    expect(hasEssay(longBody)).toBe(true)
  })

  it("ignores whitespace when counting", () => {
    const body = `${"가".repeat(ESSAY_MIN_CHARS)}\n\n   \n   `
    expect(hasEssay(body)).toBe(true)
  })

  it("strips frontmatter when counting", () => {
    const body = `---\ntitle: foo\n---\n\n${"가".repeat(ESSAY_MIN_CHARS + 10)}`
    expect(hasEssay(body)).toBe(true)
  })

  it("strips markdown image syntax when counting", () => {
    const body = `![alt text](./very/long/path/to/image.png) 짧은 글.`
    expect(hasEssay(body)).toBe(false)
  })

  it("returns true exactly at threshold", () => {
    expect(hasEssay("가".repeat(ESSAY_MIN_CHARS))).toBe(true)
  })
})
