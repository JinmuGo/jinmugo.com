import { useCallback, useEffect, useState } from "react"
import type { ApiResponse, LikeData, TotalLikesData, ViewData } from "@/types/api"
import { useAsyncEffect } from "@/utils/useAsyncEffect"

// API 공통 유틸리티 함수들 - Express + PocketBase 기반으로 변경

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3001"

// 공통 헤더
const getHeaders = () => ({
  "Content-Type": "application/json",
})

// 공통 에러 처리
const handleApiError = (error: unknown, status?: number): string => {
  if (typeof error === "string") {
    return error
  }
  if (error instanceof Error) {
    return error.message
  }
  return status ? `HTTP Error: ${status}` : "Unknown error occurred"
}

// 좋아요 관련 API
export const likeApi = {
  // IP 기반 좋아요 추가
  likePostIP: async (slug: string, count: number = 1): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/likes/${slug}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ count }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("🌸 좋아요 API 에러:", errorText)
        return { error: handleApiError(errorText, response.status) }
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("🌸 좋아요 API 예외:", error)
      return { error: handleApiError(error) }
    }
  },

  // IP 기반 좋아요 조회
  getMyIPLike: async (slug: string): Promise<ApiResponse<LikeData>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/likes/${slug}/my-likes`, {
        headers: getHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("🌸 내 좋아요 API 에러:", errorText)
        return { error: handleApiError(errorText, response.status) }
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("🌸 내 좋아요 API 예외:", error)
      return { error: handleApiError(error) }
    }
  },

  // 총 좋아요 수 조회
  getTotalLikes: async (slug: string): Promise<ApiResponse<TotalLikesData>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/likes/${slug}/total`, {
        headers: getHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("🌸 총 좋아요 API 에러:", errorText)
        return { error: handleApiError(errorText, response.status) }
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("🌸 총 좋아요 API 예외:", error)
      return { error: handleApiError(error) }
    }
  },
}

// 조회수 관련 API
export const viewApi = {
  // 조회수 증가
  incrementPostView: async (slug: string): Promise<ApiResponse> => {
    try {
      if (import.meta.env.PUBLIC_ENV === "development") {
        return { success: true }
      }
      const response = await fetch(`${API_BASE_URL}/api/views/${slug}`, {
        method: "POST",
        headers: getHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return { error: handleApiError(errorText, response.status) }
      }

      const result = await response.json()
      return result
    } catch (error) {
      return { error: handleApiError(error) }
    }
  },

  // 조회수 조회
  getPostView: async (slug: string): Promise<ApiResponse<ViewData>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/views/${slug}`, {
        headers: getHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return { error: handleApiError(errorText, response.status) }
      }

      const result = await response.json()
      return result
    } catch (error) {
      return { error: handleApiError(error) }
    }
  },
}

// 커스텀 훅: 좋아요 관리
export const useLike = (slug: string) => {
  const [myLikes, setMyLikes] = useState<number>(0)
  const [totalLikes, setTotalLikes] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // 내 좋아요 조회
  const fetchMyLikes = useCallback(async () => {
    try {
      const result = await likeApi.getMyIPLike(slug)
      if (result.error) {
        console.error("🌸 내 좋아요 조회 에러:", result.error)
        setError(result.error)
        setMyLikes(-1)
        return
      }

      setMyLikes(result.data?.count ?? 0)
      setError(null)
    } catch (error) {
      console.error("🌸 내 좋아요 조회 예외:", error)
      setError(handleApiError(error))
      setMyLikes(-1)
    }
  }, [slug])

  // 총 좋아요 수 조회
  const fetchTotalLikes = useCallback(async () => {
    try {
      const result = await likeApi.getTotalLikes(slug)
      if (result.error) {
        console.error("🌸 총 좋아요 조회 에러:", result.error)
        setError(result.error)
        return
      }

      setTotalLikes(result.data?.total ?? 0)
      setError(null)
    } catch (error) {
      console.error("🌸 총 좋아요 조회 예외:", error)
      setError(handleApiError(error))
    }
  }, [slug])

  // 좋아요 추가
  const addLike = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await likeApi.likePostIP(slug, 1)
      if (result.error) {
        console.error("🌸 좋아요 추가 에러:", result.error)
        setError(result.error)
        return false
      }

      // 성공 시 즉시 상태 업데이트
      const newMyLikes = myLikes + 1
      const newTotalLikes = totalLikes + 1
      setMyLikes(newMyLikes)
      setTotalLikes(newTotalLikes)

      // 백그라운드에서 데이터 동기화
      setTimeout(async () => {
        try {
          await Promise.all([fetchMyLikes(), fetchTotalLikes()])
        } catch (error) {
          console.error("🌸 백그라운드 동기화 에러:", error)
        }
      }, 100)

      return true
    } catch (error) {
      console.error("🌸 좋아요 추가 예외:", error)
      setError(handleApiError(error))
      return false
    } finally {
      setIsLoading(false)
    }
  }, [slug, myLikes, totalLikes, fetchMyLikes, fetchTotalLikes])

  // 초기 데이터 로드
  useEffect(() => {
    void Promise.all([fetchMyLikes(), fetchTotalLikes()])
  }, [fetchMyLikes, fetchTotalLikes])

  return {
    myLikes,
    totalLikes,
    isLoading,
    error,
    addLike,
    refresh: () => Promise.all([fetchMyLikes(), fetchTotalLikes()]),
  }
}

// 커스텀 훅: 조회수 관리
export const useViewCount = (slug: string) => {
  const [viewCount, setViewCount] = useState<number>(-1)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useAsyncEffect(async () => {
    if (!slug) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 조회수 증가
      await viewApi.incrementPostView(slug)

      // 조회수 조회
      const result = await viewApi.getPostView(slug)
      if (result.error) {
        console.error("📊 조회수 조회 에러:", result.error)
        setError(result.error)
        setViewCount(-1)
        return
      }

      setViewCount(result.data?.views ?? 0)
      setError(null)
    } catch (error) {
      console.error("📊 조회수 관리 예외:", error)
      setError(handleApiError(error))
      setViewCount(-1)
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  return {
    viewCount,
    isLoading,
    error,
  }
}
