import {
  type DocumentReference,
  doc,
  getDoc,
  increment,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { useCallback, useEffect, useState } from "react"
import type { ApiResponse, LikeData, TotalLikesData, ViewData } from "@/types/api"
import { useAsyncEffect } from "@/utils/useAsyncEffect"
import { auth, db, signInAnonymously } from "./firebase"

// Firestore Collection Name
const COLLECTION_NAME = "post_stats"
const MAX_LIKES_PER_USER = 5

// 공통 에러 처리
const handleApiError = (error: unknown): string => {
  if (typeof error === "string") {
    return error
  }
  if (error instanceof Error) {
    return error.message
  }
  return "Unknown error occurred"
}

// Ensure Auth Helper
const ensureAuth = async () => {
  if (!auth.currentUser) {
    await signInAnonymously(auth)
  }
  return auth.currentUser
}

// 좋아요 관련 API
export const likeApi = {
  // 좋아요 추가 (Transaction)
  likePost: async (slug: string, count: number = 1): Promise<ApiResponse<LikeData>> => {
    try {
      const user = await ensureAuth()
      if (!user) {
        throw new Error("Authentication failed")
      }

      const uid = user.uid
      const docRef = doc(db, COLLECTION_NAME, slug)

      let myLikes = 0
      let totalLikes = 0

      await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(docRef)

        if (!docSnap.exists()) {
          // Create new document
          myLikes = Math.min(count, MAX_LIKES_PER_USER)
          totalLikes = myLikes

          transaction.set(docRef, {
            slug,
            total_views: 0,
            total_likes: totalLikes,
            likes_by_user: {
              [uid]: myLikes,
            },
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            last_synced_to_pb: null,
          })
        } else {
          // Update existing document
          const data = docSnap.data()
          const currentLikes = data.likes_by_user?.[uid] || 0

          const newCount = Math.min(currentLikes + count, MAX_LIKES_PER_USER)
          const incrementAmount = newCount - currentLikes

          if (incrementAmount > 0) {
            myLikes = newCount
            totalLikes = (data.total_likes || 0) + incrementAmount

            transaction.update(docRef, {
              [`likes_by_user.${uid}`]: newCount,
              total_likes: increment(incrementAmount),
              updated_at: serverTimestamp(),
            })
          } else {
            myLikes = currentLikes
            totalLikes = data.total_likes || 0
          }
        }
      })

      return {
        success: true,
        data: {
          count: myLikes,
          total_likes: totalLikes,
          ip_address: uid, // Returning UID as "ip_address" for compatibility
        },
      }
    } catch (error) {
      console.error("🌸 좋아요 추가 예외:", error)
      return { error: handleApiError(error) }
    }
  },

  // 내 좋아요 조회
  getMyLike: async (slug: string): Promise<ApiResponse<LikeData>> => {
    try {
      const user = await ensureAuth()
      if (!user) {
        throw new Error("Authentication failed")
      }

      const uid = user.uid
      const docRef = doc(db, COLLECTION_NAME, slug)
      const docSnap = await getDoc(docRef)

      let count = 0
      if (docSnap.exists()) {
        const data = docSnap.data()
        count = data.likes_by_user?.[uid] || 0
      }

      return {
        success: true,
        data: {
          count,
          ip_address: uid,
          total_likes: 0, // Not fetched here, but required by type? Assuming partial matches
        } as LikeData, // Type assertion if needed
      }
    } catch (error) {
      console.error("🌸 내 좋아요 조회 예외:", error)
      return { error: handleApiError(error) }
    }
  },

  // 총 좋아요 수 조회
  getTotalLikes: async (slug: string): Promise<ApiResponse<TotalLikesData>> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, slug)
      const docSnap = await getDoc(docRef)

      let total = 0
      if (docSnap.exists()) {
        total = docSnap.data().total_likes || 0
      }

      return {
        success: true,
        data: { total },
      }
    } catch (error) {
      console.error("🌸 총 좋아요 조회 예외:", error)
      return { error: handleApiError(error) }
    }
  },
}

// 조회수 관련 API
export const viewApi = {
  // 조회수 증가
  incrementPostView: async (slug: string): Promise<ApiResponse<ViewData>> => {
    try {
      if (import.meta.env.PUBLIC_ENV === "development") {
        return { success: true, data: { views: 0, slug } }
      }

      // Firestore 쓰기 전에 인증(익명 로그인) 확인 필수
      await ensureAuth()

      const docRef = doc(db, COLLECTION_NAME, slug)

      // Use set with merge to create if not exists
      await setDoc(
        docRef,
        {
          slug,
          total_views: increment(1),
          updated_at: serverTimestamp(),
        },
        { merge: true },
      )

      // Get updated count (optional, can just return success)
      // For immediate UI update, we might want the new value, but increment returns void.
      // We can fetch it or just guess. Let's fetch it to be sure.
      const docSnap = await getDoc(docRef)
      const views = docSnap.exists() ? docSnap.data().total_views : 1

      return {
        success: true,
        data: {
          views,
          slug,
        },
      }
    } catch (error) {
      console.error("📊 조회수 증가 예외:", error)
      return { error: handleApiError(error) }
    }
  },

  // 조회수 조회
  getPostView: async (slug: string): Promise<ApiResponse<ViewData>> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, slug)
      const docSnap = await getDoc(docRef)

      const views = docSnap.exists() ? docSnap.data().total_views || 0 : 0

      return {
        success: true,
        data: {
          views,
          slug,
        },
      }
    } catch (error) {
      console.error("📊 조회수 조회 예외:", error)
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
      const result = await likeApi.getMyLike(slug)
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
      const result = await likeApi.likePost(slug, 1)
      if (result.error) {
        console.error("🌸 좋아요 추가 에러:", result.error)
        setError(result.error)
        return false
      }

      // 성공 시 즉시 상태 업데이트
      if (result.data) {
        setMyLikes(result.data.count)
        setTotalLikes(result.data.total_likes ?? totalLikes + 1)
      } else {
        // Fallback if data is missing
        setMyLikes((prev) => prev + 1)
        setTotalLikes((prev) => prev + 1)
      }

      return true
    } catch (error) {
      console.error("🌸 좋아요 추가 예외:", error)
      setError(handleApiError(error))
      return false
    } finally {
      setIsLoading(false)
    }
  }, [slug, totalLikes])

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
