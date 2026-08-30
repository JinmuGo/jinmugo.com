import { type CollectionEntry, getCollection } from "astro:content"
import type { Weekly } from "@/types/content"
import { filterEnglishContent, filterKoreanContent, slugFromId } from "@/utils/content"
import { withTrailingSlash } from "@/utils/language"

type WeeklyEntry = CollectionEntry<"weekly">

const slug = (weekly: WeeklyEntry) => slugFromId(weekly.id)
const weeklyLabel = (year: number, week: number) => `${year}-W${String(week).padStart(2, "0")}`

function isVisibleWeekly(entry: CollectionEntry<"weekly">): boolean {
  return import.meta.env.DEV || !entry.data.draft
}

function filterKoreanWeekly(entry: CollectionEntry<"weekly">): boolean {
  return filterKoreanContent(entry) && isVisibleWeekly(entry)
}

function filterEnglishWeekly(entry: CollectionEntry<"weekly">): boolean {
  return filterEnglishContent(entry) && isVisibleWeekly(entry)
}

/**
 * 한국어 Weekly 회차들을 가져오는 함수
 */
export async function getKoreanWeeklies(): Promise<Weekly[]> {
  return (await getCollection("weekly", filterKoreanWeekly)).map(
    (weekly: WeeklyEntry): Weekly => ({
      ...weekly,
      slug: slug(weekly),
      href: withTrailingSlash(`/weekly/${slug(weekly)}`),
      type: "weekly",
    }),
  )
}

/**
 * 영어 Weekly 회차들을 가져오는 함수
 */
export async function getEnglishWeeklies(): Promise<Weekly[]> {
  return (await getCollection("weekly", filterEnglishWeekly)).map((weekly: WeeklyEntry): Weekly => {
    const cleanSlug = slug(weekly).replace(/\.en$/, "")
    return {
      ...weekly,
      slug: cleanSlug,
      href: withTrailingSlash(`/en/weekly/${cleanSlug}`),
      type: "weekly",
    }
  })
}

/**
 * Weekly 회차를 날짜 최신순으로 정렬한다.
 */
export function sortWeekliesByDate(weeklies: Weekly[]): Weekly[] {
  return weeklies.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
}

export function formatWeeklyLabel(weekly: Weekly): string {
  return weeklyLabel(weekly.data.year, weekly.data.week)
}
