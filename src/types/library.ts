import type { CollectionEntry } from "astro:content"
import type { ImageMetadata } from "astro"

export type BookEntry = CollectionEntry<"book">
export type BookData = BookEntry["data"]

export interface BookWithSlug extends BookEntry {
  slug: string
  href: string
  hasEssay: boolean
}

export type BookStatus = "read" | "reading" | "want"

export type MediaKind = "book" | "movie" | "music"

export interface MediaCommon<Status = string> {
  kind: MediaKind
  slug: string
  href: string
  hasEssay: boolean
  title: string
  year: number
  creatorName: string
  oneLiner?: string
  rating?: number
  status: Status
  dateConsumed?: Date
  cover?: ImageMetadata
  tags: string[]
  quote?: string
  language?: string
}

export interface BookMedia extends MediaCommon<BookStatus> {
  kind: "book"
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

export interface MovieMedia extends MediaCommon<MovieStatus> {
  kind: "movie"
  originalTitle?: string
}

export type MediaItem = BookMedia | MovieMedia
