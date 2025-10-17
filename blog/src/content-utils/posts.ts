import { getCollection } from "astro:content"
import { filterEnglishContent, filterKoreanContent } from "@/content-utils/content"
import type { Post } from "@/types/content"

const slug = (post: Post) => post.slug.split("/").pop() ?? ""

/**
 * 한국어 포스트들을 가져오는 함수
 */
export async function getKoreanPosts() {
  return (await getCollection("post", filterKoreanContent)).map((post: Post) => ({
    ...post,
    slug: slug(post),
    href: `/posts/${slug(post)}`,
    type: "post",
  }))
}

/**
 * 영어 포스트들을 가져오는 함수
 */
export async function getEnglishPosts() {
  return (await getCollection("post", filterEnglishContent)).map((post: Post) => ({
    ...post,
    slug: slug(post).replace(/en$/, ""),
    href: `/posts/${slug(post)}`,
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
