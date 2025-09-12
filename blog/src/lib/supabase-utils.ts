import { useCallback, useEffect, useState } from "react"
import { useAsyncEffect } from "@/utils/useAsyncEffect"

// Supabase API 공통 유틸리티 함수들

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

// 공통 헤더
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
})

// 공통 에러 처리
const handleApiError = (error: unknown, status?: number): string => {
  if (status === 404) {
    return "API 엔드포인트를 찾을 수 없습니다. 데이터베이스 스키마를 확인해주세요."
  }
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return "Unknown error occurred"
}

// API 응답 타입
interface ApiResponse<T = unknown> {
  success?: boolean
  data?: T
  error?: string
}

// API 응답 데이터 타입들
interface LikeData {
  count?: number
  total?: number
}

interface ViewData {
  views?: number
}

// 좋아요 관련 API
export const likeApi = {
  // IP 기반 좋아요 추가
  likePostIP: async (slug: string, count: number = 1): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/like-post-ip/${slug}`, {
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
      const response = await fetch(`${SUPABASE_URL}/functions/v1/get-my-ip-like/${slug}`, {
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
  getTotalLikes: async (slug: string): Promise<ApiResponse<LikeData>> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/get-total-likes/${slug}`, {
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

  // 디버깅용: 좋아요 상태 확인
  debugLikes: async (slug: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/debug-likes/${slug}`, {
        headers: getHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("🔍 디버그 API 에러:", errorText)
        return { error: handleApiError(errorText, response.status) }
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("🔍 디버그 API 예외:", error)
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
      const response = await fetch(`${SUPABASE_URL}/functions/v1/increment-post-view/${slug}`, {
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
      const response = await fetch(`${SUPABASE_URL}/functions/v1/get-post-view/${slug}`, {
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
  const [totalLikes, setTotalLikes] = useState<number>(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 내 좋아요 수 조회
  const fetchMyLikes = useCallback(async () => {
    try {
      const result = await likeApi.getMyIPLike(slug)
      if (result.error) {
        console.error("🌸 내 좋아요 조회 에러:", result.error)
        setError(result.error)
        return
      }
      const count = result.data?.count ?? 0
      setMyLikes(count)
      setError(null)
    } catch (error) {
      console.error("🌸 내 좋아요 조회 예외:", error)
      setError(handleApiError(error))
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
      const total = result.data?.total ?? 0
      setTotalLikes(total)
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 조회수 증가 및 조회
  const incrementAndFetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 조회수 증가
      const incrementResult = await viewApi.incrementPostView(slug)
      if (incrementResult.error) {
        setError(incrementResult.error)
        return
      }

      // 조회수 조회
      const viewResult = await viewApi.getPostView(slug)
      if (viewResult.error) {
        setError(viewResult.error)
        return
      }

      setViewCount(viewResult.data?.views ?? 0)
      setError(null)
    } catch (error) {
      setError(handleApiError(error))
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  // 초기 로드
  useAsyncEffect(async () => {
    await incrementAndFetch()
  }, [incrementAndFetch])

  return {
    viewCount,
    isLoading,
    error,
    refresh: incrementAndFetch,
  }
}
