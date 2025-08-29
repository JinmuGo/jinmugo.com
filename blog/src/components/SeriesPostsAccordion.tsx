import type React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import type { PostMetadata } from "@/types/content"

/**
 * Props for SeriesPostsAccordion
 */
export interface SeriesPostsAccordionProps {
  /**
   * Series name (for AccordionItem value)
   */
  seriesName: string
  /**
   * List of posts in the series
   */
  posts: PostMetadata[]
  /**
   * Optional: Index of the current post (for highlighting)
   */
  currentPostIndex?: number
  /**
   * Optional: Show post dates (default: false)
   */
  showPostDates?: boolean
  /**
   * Optional: Accordion type (default: 'single')
   */
  accordionType?: "single" | "multiple"
  /**
   * Optional: AccordionTrigger label (default: '시리즈 포스트 목록')
   */
  triggerLabel?: React.ReactNode
  /**
   * Optional: Custom className for AccordionItem
   */
  itemClassName?: string
}

/**
 * Renders an Accordion for a list of series posts, with optional current post highlighting and date display.
 */
export function SeriesPostsAccordion({
  seriesName,
  posts,
  currentPostIndex,
  showPostDates = false,
  accordionType = "single",
  triggerLabel = "시리즈 포스트 목록",
  itemClassName = "",
}: SeriesPostsAccordionProps) {
  return (
    <Accordion
      type={accordionType}
      className="w-full"
      collapsible={accordionType === "single" ? true : undefined}
    >
      <AccordionItem value={seriesName} className={itemClassName}>
        <AccordionTrigger className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:no-underline">
          {triggerLabel}
        </AccordionTrigger>
        <AccordionContent>
          <div className={cn(showPostDates ? "space-y-2" : "space-y-1", "space-y-2")}>
            {posts.map((post, index) => (
              <div
                key={post.slug}
                className={[
                  "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                  showPostDates ? "justify-between rounded-none" : "rounded-md",
                  index === currentPostIndex
                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    : showPostDates
                      ? ""
                      : "hover:bg-gray-100 dark:hover:bg-gray-700",
                ].join(" ")}
              >
                {!showPostDates && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium dark:bg-gray-600">
                    {index + 1}
                  </span>
                )}
                <a
                  href={`/posts/${post.slug}`}
                  className={[
                    "truncate",
                    index === currentPostIndex
                      ? "flex-1 font-medium"
                      : showPostDates
                        ? "text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                        : "text-gray-700 dark:text-gray-300",
                  ].join(" ")}
                  title={post.title}
                >
                  {post.title}
                </a>
                {showPostDates ? (
                  <>
                    <div className="flex-1 border-b-2 border-dotted border-gray-300 mx-2" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[90px] text-right">
                      {post.date
                        ? new Date(post.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })
                        : ""}
                    </span>
                  </>
                ) : (
                  index === currentPostIndex && (
                    <span className="text-xs text-primary-600 dark:text-primary-400 ml-2">
                      현재
                    </span>
                  )
                )}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default SeriesPostsAccordion
