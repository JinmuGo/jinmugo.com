import { getCollection } from "astro:content"
import type {
  BookData,
  BookEntry,
  BookMedia,
  BookStatus,
  BookWithSlug,
  MediaItem,
} from "@/types/library"
import { getAuthors } from "./authors"
import { hasEssay } from "./hasEssay"

/** Derive a clean URL slug from an entry id like "folder/filename" → "filename" */
const slugFromId = (id: string): string =>
  id
    .replace(/\.mdx?$/, "")
    .split("/")
    .pop() ?? id

export const sortBooksByDateRead = (books: BookWithSlug[]): BookWithSlug[] =>
  [...books].sort((a, b) => {
    const aTime = a.data.dateRead?.getTime() ?? -Infinity
    const bTime = b.data.dateRead?.getTime() ?? -Infinity
    return bTime - aTime
  })

export const sortMediaByDate = <T extends MediaItem>(items: T[]): T[] =>
  [...items].sort((a, b) => {
    const aTime = a.dateConsumed?.getTime() ?? -Infinity
    const bTime = b.dateConsumed?.getTime() ?? -Infinity
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
  const entries = await getCollection("book", ({ data }: { data: BookData }) => !data.draft)
  const enriched = await Promise.all(
    entries.map(async (entry: BookEntry) => {
      const slug = slugFromId(entry.id)
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

/**
 * Fetch all books as normalized MediaItem records ready for the unified
 * library list/detail components.
 */
export async function getBookMedia(): Promise<BookMedia[]> {
  const [books, authors] = await Promise.all([getBooks(), getAuthors()])
  const authorById = new Map(authors.map((a) => [a.slug, a]))

  return books.map((book): BookMedia => {
    const d = book.data
    const author = authorById.get(d.authorId)
    return {
      kind: "book",
      slug: book.slug,
      href: book.href,
      hasEssay: book.hasEssay,
      title: d.title,
      year: d.year,
      creatorId: d.authorId,
      creatorName: author?.data.name ?? d.authorId,
      creatorHref: author?.href,
      oneLiner: d.oneLiner,
      rating: d.rating,
      status: d.status,
      dateConsumed: d.dateRead,
      cover: d.cover,
      tags: d.tags,
      quote: d.quote,
      language: d.language,
      pages: d.pages,
      publisher: d.publisher,
      originalTitle: d.originalTitle,
    }
  })
}
