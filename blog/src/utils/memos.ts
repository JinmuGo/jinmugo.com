import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { filterKoreanContent, filterEnglishContent } from './content';

/**
 * 한국어 메모들을 가져오는 함수
 */
export async function getKoreanMemos() {
  return await getCollection('memo', filterKoreanContent);
}

/**
 * 영어 메모들을 가져오는 함수
 */
export async function getEnglishMemos() {
  return await getCollection('memo', filterEnglishContent);
}

/**
 * 메모들을 날짜순으로 정렬하는 함수 (최신순)
 */
export function sortMemosByDate(memos: CollectionEntry<'memo'>[]): CollectionEntry<'memo'>[] {
  return memos.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
} 