import { Description as DialogDescription, Title as DialogTitle } from "@radix-ui/react-dialog"
import { Command } from "cmdk"
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react"
import type { Lang } from "@/types/utils"
import { withTrailingSlash } from "@/utils/language"

/**
 * Search result item from search-index.json
 */
interface SearchResultPost {
  slug: string
  category?: string
  type?: "post" | "weekly"
  title: string
  summary: string
}

interface CommandPaletteProps {
  lang: Lang
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

interface RequestedLangRef {
  current: Lang | null
}

type SearchIndexFetcher = (url: string) => Promise<{ json: () => Promise<unknown> }>

export async function loadSearchIndex(
  open: boolean,
  lang: Lang,
  requestedLang: RequestedLangRef,
  fetcher: SearchIndexFetcher = fetch,
): Promise<SearchResultPost[] | undefined> {
  if (!open || requestedLang.current === lang) {
    return
  }

  requestedLang.current = lang

  try {
    const response = await fetcher(`${lang === "en" ? "/en" : ""}/search-index.json`)
    return (await response.json()) as SearchResultPost[]
  } catch (error) {
    if (requestedLang.current === lang) {
      requestedLang.current = null
    }
    throw error
  }
}

export default function CommandPalette({ lang, open, setOpen }: CommandPaletteProps) {
  const [posts, setPosts] = useState<SearchResultPost[]>([])
  const requestedLang = useRef<Lang | null>(null)

  useEffect(() => {
    loadSearchIndex(open, lang, requestedLang)
      .then((data) => {
        if (data && requestedLang.current === lang) {
          setPosts(data)
        }
      })
      .catch(() => undefined)
  }, [lang, open])

  // 2. 키보드 단축키 (Cmd+K 또는 Ctrl+K) 리스너 등록
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((current) => !current)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [setOpen])

  const handleSelect = (post: SearchResultPost) => {
    const contentType = post.type ?? "post"
    const collectionPath = contentType === "weekly" ? "weekly" : "posts"
    window.location.href = withTrailingSlash(
      `${lang === "en" ? "/en" : ""}/${collectionPath}/${post.slug}`,
    )
    setOpen(false)
  }

  // 3. 언어별로 다른 플레이스홀더 텍스트 설정
  const placeholderText = {
    ko: "블로그 내 모든 글 검색...",
    en: "Search all posts in the blog...",
  }

  return (
    <Command>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
        className="cmdk-dialog"
      >
        <DialogTitle className="sr-only">
          {lang === "en" ? "Search posts" : "게시물 검색"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {lang === "en"
            ? "Search blog posts and select a result to open it."
            : "블로그 게시물을 검색하고 결과를 선택해 엽니다."}
        </DialogDescription>
        <Command.Input placeholder={placeholderText[lang]} className="cmdk-input" />
        <Command.List className="cmdk-list">
          <Command.Empty>No results found.</Command.Empty>
          {posts.map((post) => (
            <Command.Item
              key={post.slug}
              value={`${post.title} ${post.summary}`}
              onSelect={() => handleSelect(post)}
              className="cmdk-item"
            >
              <div className="item-content">
                <span className="category">{post.category ?? post.type ?? "post"}</span>
                <span className="title">{post.title}</span>
              </div>
            </Command.Item>
          ))}
        </Command.List>
      </Command.Dialog>
    </Command>
  )
}
