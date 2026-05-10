import { useState } from "react"
import SearchInput from "@/components/search/SearchInput"
import type { PostMetadata, WeeklyMetadata } from "@/types/content"
import type { Lang } from "@/types/utils"
import { getLanguagePrefix, withTrailingSlash } from "@/utils/language"

type ListLayoutProps = {
  posts: (PostMetadata | WeeklyMetadata)[]
  title: string
  postType: "post" | "weekly"
  lang?: Lang
  /** When false, renders the dotted leader list only (same as posts/memos) with no search bar. */
  showSearch?: boolean
}

function listHref(
  postType: ListLayoutProps["postType"],
  slug: string,
  languagePrefix: string,
): string {
  const segment = postType === "post" ? "posts" : "weekly"
  const path = `${languagePrefix}/${segment}/${slug}`.replace(/\/{2,}/g, "/")
  return withTrailingSlash(path.startsWith("/") ? path : `/${path}`)
}

function emptyFilterMessage(postType: ListLayoutProps["postType"], lang: Lang): string {
  if (postType === "weekly") {
    return lang === "ko" ? "아직 발행된 Weekly가 없습니다." : "No Weekly issues yet."
  }
  return lang === "ko" ? "글을 찾을 수 없습니다." : "No posts found."
}

export default function ListLayouts({
  posts,
  title,
  postType,
  lang = "ko",
  showSearch = true,
}: ListLayoutProps) {
  const [searchValue, setSearchValue] = useState("")
  const languagePrefix = getLanguagePrefix(lang)
  const filteredBlogPosts = showSearch
    ? posts.filter((post) => {
        const searchContent = post.title + post.summary + (post.tags ? post.tags.join(" ") : "")
        return searchContent.toLowerCase().includes(searchValue.toLowerCase())
      })
    : posts

  return (
    <div className="px-2 sm:px-4">
      {showSearch && <SearchInput title={title} onChange={setSearchValue} />}
      {!filteredBlogPosts.length && (
        <p className="text-gray-500 dark:text-gray-400">{emptyFilterMessage(postType, lang)}</p>
      )}
      <ul className={showSearch ? "" : "pt-1"}>
        {filteredBlogPosts.map((post) => (
          <li key={post.slug} className="flex justify-between items-center py-3">
            <a
              href={listHref(postType, post.slug, languagePrefix)}
              className="text-base sm:text-lg font-medium text-gray-900 hover:text-primary-500 dark:text-gray-100 dark:hover:text-primary-400"
            >
              {post.title}
            </a>
            <div className="flex-1 border-b-2 border-dotted border-gray-300 mx-2" />
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 min-w-[90px] text-right">
              {post.date
                ? new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })
                : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
