import { type CollectionEntry, getCollection } from "astro:content"
import type { Post } from "@/types/content"
import { filterEnglishContent, filterKoreanContent, slugFromId } from "@/utils/content"
import { withTrailingSlash } from "@/utils/language"

type PostEntry = CollectionEntry<"post">

const slug = (post: PostEntry) => slugFromId(post.id)

/**
 * 한국어 포스트들을 가져오는 함수
 */
export async function getKoreanPosts(): Promise<Post[]> {
  return (await getCollection("post", filterKoreanContent)).map(
    (post: PostEntry): Post => ({
      ...post,
      slug: slug(post),
      href: withTrailingSlash(`/posts/${slug(post)}`),
      type: "post",
    }),
  )
}

/**
 * 영어 포스트들을 가져오는 함수
 */
export async function getEnglishPosts(): Promise<Post[]> {
  return (await getCollection("post", filterEnglishContent)).map((post: PostEntry): Post => {
    const cleanSlug = slug(post).replace(/\.en$/, "")
    return {
      ...post,
      slug: cleanSlug,
      href: withTrailingSlash(`/en/posts/${cleanSlug}`),
      type: "post",
    }
  })
}

/**
 * 포스트들을 날짜순으로 정렬하는 함수 (최신순)
 */
export function sortPostsByDate(posts: Post[]): Post[] {
  return posts.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
}
