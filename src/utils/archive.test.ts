import { describe, expect, it } from "vitest"
import { createArchiveEntries, getArchivePath, isArchiveIndexable } from "./archive"
import { normalizeArchiveSegment } from "./archive-segment.js"

describe("archive URLs", () => {
  it("normalizes Unicode, case, and separators into one stable segment", () => {
    expect(normalizeArchiveSegment("  Ｗi Fi / 테스트  ")).toBe("wi-fi-테스트")
    expect(getArchivePath("/en", "tag", "Open Source")).toBe("/en/archives/tag/open-source/")
  })

  it("counts labels and rejects normalized collisions", () => {
    expect(createArchiveEntries(["AWS", "AWS"])).toEqual([
      { label: "AWS", segment: "aws", count: 2 },
    ])
    expect(() => createArchiveEntries(["AWS", "aws"])).toThrow("Archive segment collision")
  })

  it("keeps singleton tags out of indexes", () => {
    expect(isArchiveIndexable("tag", 1)).toBe(false)
    expect(isArchiveIndexable("tag", 2)).toBe(true)
    expect(isArchiveIndexable("category", 1)).toBe(true)
  })
})
