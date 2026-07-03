import { getCollection } from "astro:content"
import type { BookData, BookEntry, BookMedia, BookStatus, BookWithSlug } from "@/types/library"
import { isEnglishEntry, type LibraryLang, slugFromId } from "./common"
import { getCover } from "./cover"
import { hasEssay } from "./hasEssay"

export type { LibraryLang }

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
 * Fetch all non-draft books for the given language with computed slug, href,
 * and hasEssay.
 */
export async function getBooks(lang: LibraryLang = "ko"): Promise<BookWithSlug[]> {
  const entries = await getCollection("book", ({ data }: { data: BookData }) => !data.draft)
  const enriched = entries
    .filter((entry: BookEntry) => (lang === "en") === isEnglishEntry(entry.id))
    .map((entry: BookEntry) => {
      const slug = slugFromId(entry.id)
      const body = entry.body ?? ""
      return {
        ...entry,
        slug,
        href: lang === "en" ? `/en/library/books/${slug}/` : `/library/books/${slug}/`,
        hasEssay: hasEssay(body),
      } as BookWithSlug
    })
  return enriched
}

/**
 * Fetch all books as normalized MediaItem records ready for the unified
 * library list/detail components.
 */
export async function getBookMedia(lang: LibraryLang = "ko"): Promise<BookMedia[]> {
  const books = await getBooks(lang)

  return books.map((book): BookMedia => {
    const d = book.data
    return {
      kind: "book",
      slug: book.slug,
      href: book.href,
      hasEssay: book.hasEssay,
      title: d.title,
      year: d.year,
      creatorName: d.author,
      oneLiner: d.oneLiner,
      rating: d.rating,
      status: d.status,
      dateConsumed: d.dateRead,
      cover: getCover("book", book.slug),
      tags: d.tags,
      quote: d.quote,
      language: d.language,
      originalTitle: d.originalTitle,
    }
  })
}
