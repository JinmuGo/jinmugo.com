import { Description as DialogDescription, Title as DialogTitle } from "@radix-ui/react-dialog"
import { Command } from "cmdk"
import { type Dispatch, type SetStateAction, useEffect, useState } from "react"
import type { Lang } from "@/types/utils"
import { withTrailingSlash } from "@/utils/language"

/**
 * Search result item from search-index.json
 */
interface SearchResultPost {
  slug: string
  category: string
  title: string
  summary: string
}

interface CommandPaletteProps {
  lang: Lang
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export default function CommandPalette({ lang, open, setOpen }: CommandPaletteProps) {
  const [posts, setPosts] = useState<SearchResultPost[]>([])

  // 2. lang prop이 바뀔 때마다 해당 언어의 JSON 데이터를 다시 불러옵니다.
  useEffect(() => {
    // '/ko/search-index.json' 또는 '/en/search-index.json'을 호출
    fetch(`${lang === "en" ? "/en" : ""}/search-index.json`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
  }, [lang]) // lang이 변경될 때 이 useEffect를 다시 실행

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

  const handleSelect = (slug: string) => {
    window.location.href = withTrailingSlash(`${lang === "en" ? "/en" : ""}/posts/${slug}`)
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
              onSelect={() => handleSelect(post.slug)}
              className="cmdk-item"
            >
              <div className="item-content">
                <span className="category">{post.category}</span>
                <span className="title">{post.title}</span>
              </div>
            </Command.Item>
          ))}
        </Command.List>
      </Command.Dialog>
    </Command>
  )
}
