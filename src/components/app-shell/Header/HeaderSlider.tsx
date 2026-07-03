import { useCallback, useEffect, useState } from "react"
import type { PostMetadata, WeeklyMetadata } from "@/types/content"

function isWeeklyMetadata(metadata: PostMetadata | WeeklyMetadata): metadata is WeeklyMetadata {
  return "year" in metadata && "week" in metadata
}

interface ContainerStyles {
  header: string
  headerButton: string
}

interface HeaderSliderProps {
  readonly postMetadata: PostMetadata | WeeklyMetadata
  readonly isEndofContent: boolean
  readonly isSlideOpen: boolean
  readonly pathname: string
  readonly containerStyles: ContainerStyles
}

export default function HeaderSlider({
  postMetadata,
  isEndofContent,
  isSlideOpen,
  pathname,
  containerStyles,
}: HeaderSliderProps) {
  const { date, title } = postMetadata
  const isWeekly = isWeeklyMetadata(postMetadata)
  const category = !isWeekly ? postMetadata.category : undefined
  const href = isWeekly
    ? pathname.startsWith("/en")
      ? "/en/weekly/"
      : "/weekly/"
    : category
      ? pathname.startsWith("/en")
        ? `/en/archives/category/${category}`
        : `/archives/category/${category}`
      : undefined
  const contextLabel = isWeekly
    ? `Weekly ${postMetadata.year}-W${String(postMetadata.week).padStart(2, "0")}`
    : category
  const [isHovered, setIsHovered] = useState<boolean>(false)

  const onClick = useCallback(() => {
    window.scrollTo({ top: 0 })
    setIsHovered(false)
  }, [])

  useEffect(() => {
    const postbody = document.querySelector("#prose")

    const handleScroll = () => {
      setIsHovered(false)
    }

    const handleMouseMove = () => {
      setIsHovered(false)
    }

    if (postbody) {
      postbody.addEventListener("scroll", handleScroll)
      postbody.addEventListener("mousemove", handleMouseMove)
    }

    return () => {
      if (postbody) {
        postbody.removeEventListener("scroll", handleScroll)
        postbody.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [])

  return (
    <>
      <section
        onMouseEnter={() => setIsHovered(true)}
        aria-label={isWeekly ? "Weekly 정보" : "포스트 정보"}
        className={`transition-all
          duration-300 w-full h-full flex justify-center items-center absolute
          ${
            isSlideOpen
              ? isHovered || isEndofContent
                ? "-translate-y-[300%] opacity-0"
                : "-translate-y-full opacity-100"
              : "-translate-y-0 opacity-0"
          }
        `}
      >
        <div
          className={`w-full mx-auto flex md:items-center flex-col md:flex-row justify-between ${containerStyles.header}`}
        >
          <p
            className="text-xl md:text-2xl font-bold whitespace-pre text-ellipsis overflow-hidden"
            aria-hidden="true"
          >
            {title}
          </p>
          <p className="min-w-fit">
            <span className="text-sm md:text text-gray-500 dark:text-gray-300">
              {href && contextLabel && (
                <>
                  <a className="underline" href={href}>
                    {contextLabel}
                  </a>{" "}
                  /{" "}
                </>
              )}
              {date.toLocaleDateString("en-us", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </p>
        </div>
      </section>
      <button
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClick()
          }
        }}
        type="button"
        className={`transition-all duration-300 w-full h-full justify-between items-center absolute ${(isHovered || isEndofContent) && isSlideOpen ? "-translate-y-full opacity-100 flex" : "translate-y-0 opacity-0 hidden"}
        }`}
      >
        <div
          className={`w-full cursor-pointer mx-auto flex items-center justify-center ${containerStyles.headerButton}`}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Scroll to top"
          >
            <title>위 화살표 아이콘</title>
            <path
              d="M3.13523 8.84197C3.3241 9.04343 3.64052 9.05363 3.84197 8.86477L7.5 5.43536L11.158 8.86477C11.3595 9.05363 11.6759 9.04343 11.8648 8.84197C12.0536 8.64051 12.0434 8.32409 11.842 8.13523L7.84197 4.38523C7.64964 4.20492 7.35036 4.20492 7.15803 4.38523L3.15803 8.13523C2.95657 8.32409 2.94637 8.64051 3.13523 8.84197Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>
    </>
  )
}
