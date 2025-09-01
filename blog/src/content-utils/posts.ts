import { getCollection } from "astro:content"
import { filterEnglishContent, filterKoreanContent } from "@/content-utils/content"
import type { Post } from "@/types/content"

/**
 * 한국어 포스트들을 가져오는 함수
 */
export async function getKoreanPosts() {
  return (await getCollection("post", filterKoreanContent)).map((post: Post) => ({
    ...post,
    slug: post.slug.split("/").pop() ?? "",
    type: "post",
  }))
}

/**
 * 영어 포스트들을 가져오는 함수
 */
export async function getEnglishPosts() {
  return (await getCollection("post", filterEnglishContent)).map((post: Post) => ({
    ...post,
    slug: post.slug.split("/").pop()?.replace(/en$/, "") ?? "",
    type: "post",
  }))
}

/**
 * 포스트들을 날짜순으로 정렬하는 함수 (최신순)
 */
export function sortPostsByDate(posts: Post[]): Post[] {
  return posts.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
}

/**
 * 포스트들을 최신 N개로 제한하는 함수
 */
export function limitPosts(posts: Post[], limit: number): Post[] {
  return posts.slice(0, limit)
}

/**
 * 한국어 최신 포스트 N개를 가져오는 함수
 */
export async function getLatestKoreanPosts(limit: number = 3) {
  const posts = await getKoreanPosts()
  return limitPosts(sortPostsByDate(posts), limit)
}

/**
 * 영어 최신 포스트 N개를 가져오는 함수
 */
export async function getLatestEnglishPosts(limit: number = 3) {
  const posts = await getEnglishPosts()
  return limitPosts(sortPostsByDate(posts), limit)
}

/**
 * 관련 포스트를 찾는 함수 (개선된 버전)
 *
 * 점수 계산 방식:
 * - 시리즈 일치: +6점 (가장 중요)
 * - 태그 일치: 각 태그당 +3점
 * - 카테고리 일치: +2점
 * - 제목 키워드 유사도: +1~3점
 * - 최신성 보너스: 0~1점 (최근 30일 내 포스트에 가산점)
 * - 인기도 보너스: 제목 길이 기반 (0~0.5점)
 * - 태그 유사도 비율: 0~2점
 */
export async function getRelatedPosts(current: Post, limit: number = 4) {
  const isEnglish = current.slug.endsWith("en") || (current.id ?? "").includes("/en/")
  const all = isEnglish ? await getEnglishPosts() : await getKoreanPosts()

  // 현재 포스트 정보 정규화
  const currentTags = new Set(
    (current.data.tags ?? []).map((tag: string) => tag.toLowerCase().trim()),
  )
  const currentCategory = (current.data.category ?? "").toLowerCase().trim()
  const currentSeries = (current.data.series ?? "").toLowerCase().trim()
  const currentTitle = current.data.title.toLowerCase().trim()
  const currentDate = new Date(current.data.date).getTime()

  // 제목에서 키워드 추출 (한국어/영어)
  const extractKeywords = (title: string): string[] => {
    const words = title.toLowerCase().split(/\s+/)
    return words.filter((word) => word.length > 2) // 2글자 이하는 제외
  }
  const currentKeywords = extractKeywords(currentTitle)

  const scored = all
    .filter((p: Post) => p.slug !== current.slug)
    .map((p: Post) => {
      const tags = new Set((p.data.tags ?? []).map((t: string) => t.toLowerCase().trim()))
      const category = (p.data.category ?? "").toLowerCase().trim()
      const series = (p.data.series ?? "").toLowerCase().trim()
      const postTitle = p.data.title.toLowerCase().trim()
      const postDate = new Date(p.data.date).getTime()

      let score = 0
      let tagMatches = 0
      let titleKeywordMatches = 0

      // 1. 시리즈 일치 (가장 중요 - 연재물 연결)
      if (series && series === currentSeries) {
        score += 6
      }

      // 2. 태그 유사도
      for (const tag of currentTags) {
        if (tags.has(tag)) {
          tagMatches++
          score += 3
        }
      }

      // 3. 카테고리 일치
      if (category && category === currentCategory) {
        score += 2
      }

      // 4. 제목 키워드 유사도 (새로 추가)
      const postKeywords = extractKeywords(postTitle)
      for (const keyword of currentKeywords) {
        if (postKeywords.includes(keyword)) {
          titleKeywordMatches++
          score += 1
        }
      }

      // 5. 최신성 보너스 (30일 이내 포스트에 가산점)
      const daysDiff = Math.abs(postDate - currentDate) / (1000 * 60 * 60 * 24)
      if (daysDiff <= 30) {
        score += Math.max(0, 1 - daysDiff / 30)
      }

      // 6. 제목 품질 추정
      const titleLength = p.data.title.length
      if (titleLength > 20 && titleLength < 100) {
        score += 0.5
      }

      // 7. 태그 유사도 비율 보너스
      if (currentTags.size > 0) {
        const similarity = tagMatches / Math.max(currentTags.size, tags.size)
        score += similarity * 2
      }

      // 8. 제목 키워드 유사도 비율 보너스 (새로 추가)
      if (currentKeywords.length > 0) {
        const titleSimilarity =
          titleKeywordMatches / Math.max(currentKeywords.length, postKeywords.length)
        score += titleSimilarity * 1.5
      }

      return {
        post: p,
        score,
        tagMatches,
        titleKeywordMatches,
        category,
        series: series === currentSeries,
      }
    })
    .sort((a: any, b: any) => {
      // 1차: 점수순
      if (b.score !== a.score) {
        return b.score - a.score
      }
      // 2차: 시리즈 일치 우선
      if (a.series && !b.series) {
        return -1
      }
      if (!a.series && b.series) {
        return 1
      }
      // 3차: 태그 매칭 개수순
      if (b.tagMatches !== a.tagMatches) {
        return b.tagMatches - a.tagMatches
      }
      // 4차: 제목 키워드 매칭 개수순
      if (b.titleKeywordMatches !== a.titleKeywordMatches) {
        return b.titleKeywordMatches - a.titleKeywordMatches
      }
      // 5차: 같은 카테고리 우선
      if (a.category === currentCategory && b.category !== currentCategory) {
        return -1
      }
      if (b.category === currentCategory && a.category !== currentCategory) {
        return 1
      }
      // 6차: 최신순
      return new Date(b.post.data.date).getTime() - new Date(a.post.data.date).getTime()
    })
    .slice(0, limit)
    .map((x: any) => x.post)

  return scored
}
