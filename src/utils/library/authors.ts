import { getCollection } from "astro:content"
import type { AuthorData, AuthorEntry, AuthorWithSlug, BookWithSlug } from "@/types/library"

const stripExt = (id: string) => id.replace(/\.mdx?$/, "")

export async function getAuthors(): Promise<AuthorWithSlug[]> {
  const entries = await getCollection("author", ({ data }: { data: AuthorData }) => !data.draft)
  return entries.map((entry: AuthorEntry) => {
    const slug = stripExt(entry.id)
    return {
      ...entry,
      slug,
      href: `/library/books/author/${slug}/`,
    }
  })
}

export async function getAuthorById(authorId: string): Promise<AuthorWithSlug | undefined> {
  const authors = await getAuthors()
  return authors.find((a) => a.slug === authorId)
}

export function booksByAuthor(books: BookWithSlug[], authorId: string): BookWithSlug[] {
  return books.filter((b) => b.data.authorId === authorId)
}
