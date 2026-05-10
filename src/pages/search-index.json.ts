import type { APIRoute } from "astro"
import type { Post, Weekly } from "@/types/content"
import { getKoreanPosts } from "@/utils/content/posts"
import { formatWeeklyLabel, getKoreanWeeklies } from "@/utils/content/weekly"

export const GET: APIRoute = async () => {
  const allPosts = await getKoreanPosts()
  const allWeeklies = await getKoreanWeeklies()

  const searchablePosts = await Promise.all(
    allPosts.map(async (post: Post) => ({
      slug: post.slug,
      category: post.data.category,
      title: post.data.title,
      summary: post.data.summary,
      type: "post",
    })),
  )
  const searchableWeeklies = await Promise.all(
    allWeeklies.map(async (weekly: Weekly) => ({
      slug: weekly.slug,
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
