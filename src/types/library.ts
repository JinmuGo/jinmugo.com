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

export type MediaKind = "book" | "movie" | "music"

export interface MediaCommon {
  kind: MediaKind
  slug: string
  href: string
  hasEssay: boolean
  title: string
  year: number
  creatorId: string
  creatorName: string
  creatorHref?: string
  oneLiner?: string
  rating?: number
  status: string
  dateConsumed?: Date
  cover?: ImageMetadata
  tags: string[]
  quote?: string
  language?: string
}

export interface BookMedia extends MediaCommon {
  kind: "book"
  pages?: number
  publisher?: string
  originalTitle?: string
}

export type MediaItem = BookMedia
