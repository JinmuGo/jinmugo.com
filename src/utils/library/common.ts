import type { MediaItem } from "@/types/library"

export type LibraryLang = "ko" | "en"

/** Derive a clean URL slug from an entry id like "folder/filename.en" → "filename". */
export const slugFromId = (id: string): string =>
  id
    .replace(/\.mdx?$/, "")
    .replace(/\.en$/, "")
    .split("/")
    .pop() ?? id

/** Determine whether a content entry id represents the English translation. */
export const isEnglishEntry = (id: string): boolean => id.replace(/\.mdx?$/, "").endsWith(".en")

/** Sort media items by consumption date (most recent first). */
export const sortMediaByDate = <T extends MediaItem>(items: T[]): T[] =>
  [...items].sort((a, b) => {
    const aTime = a.dateConsumed?.getTime() ?? -Infinity
    const bTime = b.dateConsumed?.getTime() ?? -Infinity
    return bTime - aTime
  })
