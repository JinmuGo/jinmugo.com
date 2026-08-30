import { Calendar, FolderOpen } from "lucide-react"
import type React from "react"
import SeriesPostsAccordion from "@/components/features/SeriesPostsAccordion"
import Title from "@/components/layout/Title"
import { Badge } from "@/components/ui/badge"
import type { SeriesMetadata } from "@/types/series"
import type { Lang } from "@/types/utils"
import { formatSeriesDate, getSeriesTranslations } from "@/utils/series"

interface SeriesListIslandProps {
  seriesList: SeriesMetadata[]
  lang: Lang
}

const SeriesListIsland: React.FC<SeriesListIslandProps> = ({ seriesList, lang }) => {
  const t = getSeriesTranslations(lang)

  return (
    <div className="min-h-screen px-2 sm:px-4">
      <Title>{t.pageTitle}</Title>

      <div className="w-full divide-y divide-gray-200 dark:divide-gray-700">
        {seriesList.map((series) => (
          <section key={series.name} className="pb-3">
            <SeriesPostsAccordion
              seriesName={series.name}
              posts={series.posts.map((post) => ({
                ...post.data,
                slug: post.slug,
                href: post.href,
              }))}
              showPostDates={true}
              accordionType="multiple"
              lang={lang}
              triggerLabel={
                <div className="flex flex-col gap-2 w-full">
                  {/* Series Title and Post Count */}
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 dark:text-gray-100 dark:group-hover:text-primary-400">
                      {series.name}
                    </h3>
                    <Badge variant="secondary">{t.postsCount(series.totalPosts)}</Badge>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                    {/* Date Range */}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      <span>
                        {formatSeriesDate(series.firstPublished, lang)}
                        {" - "}
                        {formatSeriesDate(series.lastUpdated, lang)}
                      </span>
                    </div>

                    {/* Primary Category */}
                    {series.primaryCategory && (
                      <div className="flex items-center gap-1.5">
                        <FolderOpen className="size-3.5" />
                        <span>{series.primaryCategory}</span>
                      </div>
                    )}
                  </div>
                </div>
              }
            />
            <a
              href={`${lang === "en" ? "/en" : ""}/series/${encodeURIComponent(series.name)}/`}
              className="inline-block px-3 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              {lang === "ko" ? "시리즈 페이지 보기" : "View series page"}
            </a>
          </section>
        ))}
      </div>
    </div>
  )
}

export default SeriesListIsland
