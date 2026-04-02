import type { APIRoute } from "astro"
import { getEnglishPosts } from "@/utils/content/posts"

export const GET: APIRoute = async () => {
  const allPosts = await getEnglishPosts()

  const searchablePosts = await Promise.all(
    allPosts.map(async (post) => ({
      slug: post.slug || "",
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
