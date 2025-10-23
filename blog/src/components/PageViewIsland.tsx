import { useEffect, useOptimistic, useRef } from "react"
import { useViewCount } from "@/lib/pocketbase-utils"

export function PageViewIsland({ slug }: { slug: string }) {
  const { viewCount, isLoading, error, fetchViewCount, incrementViewCount } = useViewCount(slug)

  const [optimisticCount, addOptimistic] = useOptimistic(
    viewCount === -1 ? 0 : viewCount,
    (current: number, delta: number) => Math.max(0, (current ?? 0) + delta),
  )

  const didIncrementRef = useRef<string | null>(null)

  useEffect(() => {
    if (!slug) return
    if (didIncrementRef.current === slug) return
    didIncrementRef.current = slug

    // 낙관적 업데이트: 먼저 +1 반영 후 서버에 반영
    addOptimistic(1)

    void (async () => {
      const ok = await incrementViewCount()
      if (!ok) {
        // 실패 시 롤백
        addOptimistic(-1)
      }
      // 서버 값 동기화
      await fetchViewCount()
    })()
    // biome-ignore lint/correctness/useExhaustiveDependencies: slug당 1회만 실행되도록 의도
  }, [slug])

  const display = viewCount === -1 && optimisticCount === 0 ? "..." : optimisticCount

  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 dark:text-gray-400">{display} views</span>
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  )
}
