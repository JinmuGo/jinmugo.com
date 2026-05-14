import { getCollection } from "astro:content"
import type { BookEntry, BookStatus, BookWithSlug } from "@/types/library"
import { hasEssay } from "./hasEssay"

const stripExt = (id: string) => id.replace(/\.mdx?$/, "")

export const sortBooksByDateRead = (books: BookWithSlug[]): BookWithSlug[] =>
  [...books].sort((a, b) => {
    const aTime = a.data.dateRead?.getTime() ?? -Infinity
    const bTime = b.data.dateRead?.getTime() ?? -Infinity
    return bTime - aTime
  })

export const filterBooksByStatus = (
  books: BookWithSlug[],
  status: BookStatus | null,
): BookWithSlug[] => (status === null ? books : books.filter((b) => b.data.status === status))

export const filterBooksByRating = (books: BookWithSlug[], min: number | null): BookWithSlug[] =>
  min === null ? books : books.filter((b) => (b.data.rating ?? 0) >= min)

/**
 * Fetch all non-draft books with computed slug, href, hasEssay.
 */
export async function getBooks(): Promise<BookWithSlug[]> {
  const entries = await getCollection("book", ({ data }) => !data.draft)
  const enriched = await Promise.all(
    entries.map(async (entry: BookEntry) => {
      const slug = stripExt(entry.id)
      const body = entry.body ?? ""
      return {
        ...entry,
        slug,
        href: `/library/books/${slug}/`,
        hasEssay: hasEssay(body),
      } as BookWithSlug
    }),
  )
  return enriched
}
