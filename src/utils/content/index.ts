import type { CollectionEntry } from "astro:content"

/** Derive a clean URL slug from a Content Layer entry.id */
export function slugFromId(id: string): string {
  // glob loader id format: "my-slug/my-slug" or "my-slug/my-slug.en" (no extension)
  // Normalize to lowercase for consistent URLs across languages
  return (id.split("/").pop() ?? "").toLowerCase()
}

function filterDraft<T extends "post" | "memo">(entry: CollectionEntry<T>): boolean {
  return import.meta.env.PROD ? !entry.data.draft : true
}

/**
 * 한국어 콘텐츠만 필터링하는 함수
 * .en 파일을 제외하고 draft가 아닌 콘텐츠만 반환
 */
export function filterKoreanContent<T extends "post" | "memo">(entry: CollectionEntry<T>): boolean {
  return filterDraft(entry) && !entry.id.endsWith(".en")
}

/**
 * 영어 콘텐츠만 필터링하는 함수
 * .en 파일만 포함하고 draft가 아닌 콘텐츠만 반환
 */
export function filterEnglishContent<T extends "post" | "memo">(
  entry: CollectionEntry<T>,
): boolean {
  return filterDraft(entry) && entry.id.endsWith(".en")
}
