import { getCollection } from "astro:content";
import type { Post } from "@/types/content";
import { filterEnglishContent, filterKoreanContent } from "@/content-utils/content";

/**
 * 한국어 포스트들을 가져오는 함수
 */
export async function getKoreanPosts() {
  return (await getCollection("post", filterKoreanContent)).map(
    (post: Post) => ({
      ...post,
      slug: post.slug.split("/").pop() ?? "",
      type: "post",
    }),
  );
}

/**
 * 영어 포스트들을 가져오는 함수
 */
export async function getEnglishPosts() {
  return (await getCollection("post", filterEnglishContent)).map(
    (post: Post) => ({
      ...post,
      slug: post.slug.split("/").pop()?.replace(/en$/, "") ?? "",
      type: "post",
    }),
  );
}

/**
 * 포스트들을 날짜순으로 정렬하는 함수 (최신순)
 */
export function sortPostsByDate<T extends "post" | "memo">(
  posts: CollectionEntry<T>[],
): CollectionEntry<T>[] {
  return posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );
}

/**
 * 포스트들을 최신 N개로 제한하는 함수
 */
export function limitPosts<T extends "post" | "memo">(
  posts: CollectionEntry<T>[],
  limit: number,
): CollectionEntry<T>[] {
  return posts.slice(0, limit);
}

/**
 * 한국어 최신 포스트 N개를 가져오는 함수
 */
export async function getLatestKoreanPosts(limit: number = 3) {
  const posts = await getKoreanPosts();
  return limitPosts(sortPostsByDate<"post">(posts), limit);
}

/**
 * 영어 최신 포스트 N개를 가져오는 함수
 */
export async function getLatestEnglishPosts(limit: number = 3) {
  const posts = await getEnglishPosts();
  return limitPosts(sortPostsByDate<"post">(posts), limit);
}
