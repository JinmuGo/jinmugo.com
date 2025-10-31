import { useOptimistic, useRef } from "react"
import { useViewCount } from "@/lib/pocketbase-utils"
import { useAsyncEffect } from "@/utils/useAsyncEffect"

export function PageViewIsland({ slug }: { slug: string }) {
  const { viewCount, isLoading, error, fetchViewCount, incrementViewCount } = useViewCount(slug)

  const [optimisticCount, addOptimistic] = useOptimistic(
    viewCount === -1 ? 0 : viewCount,
    (current: number, delta: number) => Math.max(0, (current ?? 0) + delta),
  )

  const didIncrementRef = useRef<string | null>(null)

  useAsyncEffect(async () => {
    void (async () => {
      if (!slug) {
        return
      }
      if (didIncrementRef.current === slug) {
        return
      }
      didIncrementRef.current = slug

      // 낙관적 업데이트: 먼저 +1 반영 후 서버에 반영
      addOptimistic(1)
      const ok = await incrementViewCount()
      if (!ok) {
        // 실패 시 롤백
        addOptimistic(-1)
      }
      // 서버 값 동기화 (Cache-Aside 패턴으로 캐시된 값 우선 반환)
      await fetchViewCount()
    })()
  }, [slug])

  const display = viewCount === -1 && optimisticCount === 0 ? "..." : optimisticCount

  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 dark:text-gray-400">{display} views</span>
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  )
}
