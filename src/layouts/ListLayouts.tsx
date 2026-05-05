import { useState } from "react"
import SearchInput from "@/components/search/SearchInput"
import type { MemoMetadata, PostMetadata } from "@/types/content"
import type { Lang } from "@/types/utils"
import { getLanguagePrefix, withTrailingSlash } from "@/utils/language"

type ListLayoutProps = {
  posts: (PostMetadata | MemoMetadata)[]
  title: string
  postType: "post" | "memo"
  lang?: Lang
}

export default function ListLayouts({ posts, title, postType, lang = "ko" }: ListLayoutProps) {
  const [searchValue, setSearchValue] = useState("")
  const languagePrefix = getLanguagePrefix(lang)
  const filteredBlogPosts = posts.filter((post) => {
    const searchContent = post.title + post.summary + (post.tags ? post.tags.join(" ") : "")
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })

  return (
    <div className="px-2 sm:px-4">
      <SearchInput title={title} onChange={setSearchValue} />
      {!filteredBlogPosts.length && (postType === "memo" ? "No memos found." : "No posts found.")}
      <ul>
        {filteredBlogPosts.map((post) => (
          <li key={post.slug} className="flex justify-between items-center py-3">
            <a
              href={withTrailingSlash(`${languagePrefix}/${postType}s/${post.slug}`)}
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
