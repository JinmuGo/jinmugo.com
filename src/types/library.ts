import type { CollectionEntry } from "astro:content"

export type AuthorEntry = CollectionEntry<"author">
export type AuthorData = AuthorEntry["data"]

export interface AuthorWithSlug extends AuthorEntry {
  slug: string
  href: string
}
