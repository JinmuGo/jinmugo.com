import { getCollection } from "astro:content"
import type { Memo } from "@/types/content"
import { filterEnglishContent, filterKoreanContent, slugFromId } from "@/utils/content"
import { withTrailingSlash } from "@/utils/language"

const slug = (memo: Memo) => slugFromId(memo.id)

/**
 * 한국어 메모들을 가져오는 함수
 */
export async function getKoreanMemos() {
  return (await getCollection("memo", filterKoreanContent)).map((memo: Memo) => ({
    ...memo,
    slug: slug(memo),
    href: withTrailingSlash(`/memos/${slug(memo)}`),
    type: "memo",
  }))
}

/**
 * 영어 메모들을 가져오는 함수
 */
export async function getEnglishMemos() {
  return (await getCollection("memo", filterEnglishContent)).map((memo: Memo) => {
    const cleanSlug = slug(memo).replace(/\.en$/, "")
    return {
      ...memo,
      slug: cleanSlug,
      href: withTrailingSlash(`/en/memos/${cleanSlug}`),
      type: "memo",
    }
  })
}

/**
 * 메모들을 날짜순으로 정렬하는 함수 (최신순)
 */
export function sortMemosByDate(memos: Memo[]): Memo[] {
  return memos.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
}
