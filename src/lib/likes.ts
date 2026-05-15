/**
 * localStorage-backed like taps for LikeFlower — unused while Flower is unmounted.
 */
import { useCallback, useState } from "react"

const STORAGE_KEY = "flower-likes"
const MAX_LIKES = 5

interface LikesStore {
  [slug: string]: number
}

const getLikesStore = (): LikesStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const saveLikesStore = (store: LikesStore) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export const useLike = (slug: string) => {
  const [myLikes, setMyLikes] = useState<number>(() => {
    if (typeof window === "undefined") {
      return 0
    }
    return getLikesStore()[slug] ?? 0
  })

  const addLike = useCallback(() => {
    const store = getLikesStore()
    const current = store[slug] ?? 0
    if (current >= MAX_LIKES) {
      return false
    }

    const next = current + 1
    store[slug] = next
    saveLikesStore(store)
    setMyLikes(next)
    return true
  }, [slug])

  return {
    myLikes,
    isLoading: false,
    error: null,
    addLike,
  }
}
