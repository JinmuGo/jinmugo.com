import type { CollectionEntry } from 'astro:content';

/**
 * 한국어 콘텐츠만 필터링하는 함수
 * .en.md 파일을 제외하고 draft가 아닌 콘텐츠만 반환
 */
export function filterKoreanContent<T extends 'post' | 'memo'>(
  entry: CollectionEntry<T>
): boolean {
  return !entry.data.draft && !entry.id.endsWith('.en.md');
}

/**
 * 영어 콘텐츠만 필터링하는 함수
 * .en.md 파일만 포함하고 draft가 아닌 콘텐츠만 반환
 */
export function filterEnglishContent<T extends 'post' | 'memo'>(
  entry: CollectionEntry<T>
): boolean {
  return !entry.data.draft && entry.id.endsWith('.en.md');
}

/**
 * 모든 콘텐츠를 필터링하는 함수 (draft 제외)
 */
export function filterAllContent<T extends 'post' | 'memo'>(
  entry: CollectionEntry<T>
): boolean {
  return !entry.data.draft;
} 