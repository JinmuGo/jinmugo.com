import { useEffect, useState } from "react"

interface ObsidianStatsIndex {
  [pluginId: string]: {
    downloads: number
    installs?: number
    stars?: number
    author?: string
  }
}

interface ObsidianDownloadCountProps {
  pluginId: string
}

let statsRequest: Promise<ObsidianStatsIndex> | undefined

function fetchObsidianStats(): Promise<ObsidianStatsIndex> {
  statsRequest ??= fetch(
    "https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugin-stats.json",
    { cache: "no-store" },
  )
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }

      return (await response.json()) as ObsidianStatsIndex
    })
    .catch((error) => {
      statsRequest = undefined
      throw error
    })

  return statsRequest
}

export function ObsidianDownloadCount({ pluginId }: ObsidianDownloadCountProps) {
  const [downloadCount, setDownloadCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDownloadCount = async () => {
      if (!pluginId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Obsidian 공식 통계 JSON (obsidian-releases 레포)
        const stats = await fetchObsidianStats()
        const pluginStats = stats[pluginId]
        if (!pluginStats) {
          throw new Error("Plugin not found in Obsidian stats")
        }

        setDownloadCount(pluginStats.downloads ?? 0)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch download count:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        setDownloadCount(null)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchDownloadCount()
  }, [pluginId])

  if (isLoading) {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        <span className="inline-block animate-pulse">...</span>
      </span>
    )
  }

  if (error || downloadCount === null) {
    return null
  }

  return (
    <span className="text-xs text-gray-500 dark:text-gray-400">
      ({downloadCount.toLocaleString()} downloads)
    </span>
  )
}
