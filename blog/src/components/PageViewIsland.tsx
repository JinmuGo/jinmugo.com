import { useViewCount } from "@/lib/supabase-utils"

export function PageViewIsland({ slug }: { slug: string }) {
  const { viewCount, isLoading, error } = useViewCount(slug)

  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {isLoading || viewCount === -1 ? "..." : viewCount} views
      </span>
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  )
}
