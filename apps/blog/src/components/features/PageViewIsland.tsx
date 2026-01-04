import { useViewCount } from "@/lib/pocketbase"

export function PageViewIsland({ slug }: { slug: string }) {
  const { viewCount, isLoading, error } = useViewCount(slug)

  return (
    <div className="flex flex-col">
      {isLoading || viewCount === -1 ? (
        <span className="inline-block h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      ) : (
        <span className="text-xs text-gray-500 dark:text-gray-400">{viewCount} views</span>
      )}
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  )
}
