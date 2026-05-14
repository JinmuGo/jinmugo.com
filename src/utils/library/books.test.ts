import { describe, expect, it } from "vitest"
import type { BookWithSlug } from "@/types/library"
import { filterBooksByRating, filterBooksByStatus, sortBooksByDateRead } from "./books"

const fakeBook = (overrides: Partial<BookWithSlug["data"]> = {}): BookWithSlug =>
  ({
    id: "x",
    slug: "x",
    href: "/library/books/x/",
    hasEssay: false,
    data: {
      title: "X",
      authorId: "a",
      year: 2020,
      status: "read",
      tags: [],
      draft: false,
      ...overrides,
    },
  }) as unknown as BookWithSlug

describe("sortBooksByDateRead", () => {
  it("sorts descending by dateRead, nulls last", () => {
    const a = fakeBook({ dateRead: new Date("2025-01-01") })
    const b = fakeBook({ dateRead: new Date("2026-01-01") })
    const c = fakeBook({ dateRead: undefined })
    expect(sortBooksByDateRead([a, c, b]).map((x) => x.data.dateRead)).toEqual([
      b.data.dateRead,
      a.data.dateRead,
      undefined,
    ])
  })
})

describe("filterBooksByStatus", () => {
  it("returns only books matching status", () => {
    const r = fakeBook({ status: "read" })
    const w = fakeBook({ status: "want" })
    expect(filterBooksByStatus([r, w], "read")).toEqual([r])
  })

  it("returns all books when status is null", () => {
    const r = fakeBook({ status: "read" })
    const w = fakeBook({ status: "want" })
    expect(filterBooksByStatus([r, w], null)).toEqual([r, w])
  })
})

describe("filterBooksByRating", () => {
  it("returns books with rating >= min", () => {
    const a = fakeBook({ rating: 5 })
    const b = fakeBook({ rating: 3 })
    const c = fakeBook({ rating: undefined })
    expect(filterBooksByRating([a, b, c], 4)).toEqual([a])
  })

  it("returns all books when min is null", () => {
    const a = fakeBook({ rating: 5 })
    const b = fakeBook({ rating: 3 })
    expect(filterBooksByRating([a, b], null)).toEqual([a, b])
  })
})
