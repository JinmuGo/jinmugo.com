import type { PostMetadata } from "@/types/content"
import type { Lang } from "@/types/utils"
import { getLanguagePrefix, withTrailingSlash } from "@/utils/language"

type ListLayoutProps = {
  posts: PostMetadata[]
  lang?: Lang
}

export default function ListLayouts({ posts, lang = "ko" }: ListLayoutProps) {
  const languagePrefix = getLanguagePrefix(lang)

  return (
    <div>
      {!posts.length && (
        <p className="text-gray-500 dark:text-gray-400">
          {lang === "ko" ? "글을 찾을 수 없습니다." : "No posts found."}
        </p>
      )}
      <ul>
        {posts.map((post) => (
          <li key={post.slug} className="flex justify-between items-center py-3">
            <a
              href={withTrailingSlash(`${languagePrefix}/posts/${post.slug}`)}
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
