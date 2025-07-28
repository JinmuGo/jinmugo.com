import type { APIRoute } from "astro"
import { getKoreanPosts } from "@/content-utils/posts"
import type { Post } from "@/types/content"

export const GET: APIRoute = async () => {
  const allPosts = await getKoreanPosts()

  const searchablePosts = await Promise.all(
    allPosts.map(async (post: Post) => ({
      slug: post.slug,
      category: post.data.category,
      title: post.data.title,
      summary: post.data.summary,
    })),
  )

  return new Response(JSON.stringify(searchablePosts), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
