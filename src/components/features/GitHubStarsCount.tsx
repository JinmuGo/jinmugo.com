import { useEffect, useState } from "react"

interface GitHubStarsCountProps {
  owner: string
  repo: string
}

export function GitHubStarsCount({ owner, repo }: GitHubStarsCountProps) {
  const [starCount, setStarCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStarCount = async () => {
      if (!owner || !repo) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`https://ungh.cc/repos/${owner}/${repo}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`)
        }

        const data = await response.json()
        setStarCount(data.repo.stars ?? 0)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch star count:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        setStarCount(null)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchStarCount()
  }, [owner, repo])

  if (isLoading) {
    return (
      <span className="text-sm text-gray-500 dark:text-gray-400">
        <span className="inline-block animate-pulse">...</span>
      </span>
    )
  }

  if (error || starCount === null) {
    return null
  }

  return (
    <span className="text-sm text-gray-500 dark:text-gray-400">
      {starCount.toLocaleString()} stars
    </span>
  )
}
