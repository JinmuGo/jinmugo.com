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

export async function getRelatedPosts(current: Post, limit: number = 4) {
  const isEnglish = current.slug.endsWith("en") || (current.id ?? "").includes("/en/")
  const all = isEnglish ? await getEnglishPosts() : await getKoreanPosts()
  const currentTags = new Set((current.data.tags ?? []).map((tag) => tag.toLowerCase()))
  const currentCategory = (current.data.category ?? "").toLowerCase()

  const scored = all
    .filter((p) => p.slug !== current.slug)
    .map((p) => {
      const tags = new Set((p.data.tags ?? []).map((t) => t.toLowerCase()))
      let score = 0
      for (const tag of currentTags) {
        if (tags.has(tag)) score += 2
      }
      if ((p.data.category ?? "").toLowerCase() === currentCategory) score += 1
      const dateDiff = Math.abs(
        new Date(p.data.date).getTime() - new Date(current.data.date).getTime(),
      )
      const recencyBoost =
        Math.max(0, 1_000_000_000 - Math.min(dateDiff, 1_000_000_000)) / 1_000_000_000
      score += recencyBoost
      return { post: p, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post)

  return scored
}
