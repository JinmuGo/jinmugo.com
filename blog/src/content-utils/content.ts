import type { CollectionEntry } from "astro:content";

function filterDraft<T extends "post" | "memo">(
	entry: CollectionEntry<T>,
): boolean {
	return import.meta.env.PROD ? !entry.data.draft : true;
}

/**
 * 한국어 콘텐츠만 필터링하는 함수
 * .en.md 파일을 제외하고 draft가 아닌 콘텐츠만 반환
 */
export function filterKoreanContent<T extends "post" | "memo">(
	entry: CollectionEntry<T>,
): boolean {
	return filterDraft(entry) && !entry.id.endsWith(".en.mdx");
}

/**
 * 영어 콘텐츠만 필터링하는 함수
 * .en.md 파일만 포함하고 draft가 아닌 콘텐츠만 반환
 */
export function filterEnglishContent<T extends "post" | "memo">(
	entry: CollectionEntry<T>,
): boolean {
	return filterDraft(entry) && entry.id.endsWith(".en.mdx");
}
