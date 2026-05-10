import type { APIRoute } from "astro"
import type { Post, Weekly } from "@/types/content"
import { getEnglishPosts } from "@/utils/content/posts"
import { formatWeeklyLabel, getEnglishWeeklies } from "@/utils/content/weekly"

export const GET: APIRoute = async () => {
  const allPosts = await getEnglishPosts()
  const allWeeklies = await getEnglishWeeklies()

  const searchablePosts = await Promise.all(
    allPosts.map(async (post: Post) => ({
      slug: post.slug || "",
      category: post.data.category,
      title: post.data.title,
      summary: post.data.summary,
      type: "post",
    })),
  )
  const searchableWeeklies = await Promise.all(
    allWeeklies.map(async (weekly: Weekly) => ({
      slug: weekly.slug || "",
      category: `Weekly ${formatWeeklyLabel(weekly)}`,
      title: weekly.data.title,
      summary: weekly.data.summary,
      type: "weekly",
    })),
  )

  return new Response(JSON.stringify([...searchablePosts, ...searchableWeeklies]), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
