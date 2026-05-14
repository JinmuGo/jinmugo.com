import type { CollectionEntry } from "astro:content"

export type AuthorEntry = CollectionEntry<"author">
export type AuthorData = AuthorEntry["data"]

export interface AuthorWithSlug extends AuthorEntry {
  slug: string
  href: string
}

export type BookEntry = CollectionEntry<"book">
export type BookData = BookEntry["data"]

export interface BookWithSlug extends BookEntry {
  slug: string
  href: string
  hasEssay: boolean
}

export type BookStatus = "read" | "reading" | "want"
