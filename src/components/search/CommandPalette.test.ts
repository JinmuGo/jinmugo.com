import { describe, expect, it, vi } from "vitest"
import type { Lang } from "@/types/utils"
import { loadSearchIndex } from "./CommandPalette"

describe("loadSearchIndex", () => {
  it("fetches the search index once, on first open", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue([]),
    })
    const requestedLang = { current: null as Lang | null }

    await loadSearchIndex(false, "ko", requestedLang, fetcher)
    expect(fetcher).not.toHaveBeenCalled()

    await loadSearchIndex(true, "ko", requestedLang, fetcher)
    expect(fetcher).toHaveBeenCalledOnce()
    expect(fetcher).toHaveBeenCalledWith("/search-index.json")

    await loadSearchIndex(false, "ko", requestedLang, fetcher)
    await loadSearchIndex(true, "ko", requestedLang, fetcher)
    expect(fetcher).toHaveBeenCalledOnce()
  })
})
