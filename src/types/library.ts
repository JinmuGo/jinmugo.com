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

export type MovieEntry = CollectionEntry<"movie">
export type MovieData = MovieEntry["data"]

export interface MovieWithSlug extends MovieEntry {
  slug: string
  href: string
  hasEssay: boolean
}

export type MovieStatus = "watched" | "watching" | "want"

export interface MovieMedia extends MediaCommon {
  kind: "movie"
  runtime?: number
  studio?: string
  originalTitle?: string
}

export type DirectorEntry = CollectionEntry<"director">
export type DirectorData = DirectorEntry["data"]

export interface DirectorWithSlug extends DirectorEntry {
  slug: string
  href: string
}

export type PersonWithSlug = AuthorWithSlug | DirectorWithSlug
export type WorkWithSlug = BookWithSlug | MovieWithSlug

export type MediaItem = BookMedia | MovieMedia
