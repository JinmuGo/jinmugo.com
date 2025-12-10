import { Calendar, FolderOpen } from "lucide-react"
import type React from "react"
import { useMemo, useState } from "react"
import SeriesPostsAccordion from "@/components/features/SeriesPostsAccordion"
import Title from "@/components/layout/Title"
import { Accordion } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SeriesMetadata, SeriesSortOption } from "@/types/series"
import type { Lang } from "@/types/utils"
import { formatSeriesDate, getSeriesTranslations, sortSeriesList } from "@/utils/series"

interface SeriesListIslandProps {
  seriesList: SeriesMetadata[]
  lang: Lang
}

const SeriesListIsland: React.FC<SeriesListIslandProps> = ({ seriesList, lang }) => {
  const [sortBy, setSortBy] = useState<SeriesSortOption>("latest")
  const t = getSeriesTranslations(lang)

  const sortedSeriesList = useMemo(() => sortSeriesList(seriesList, sortBy), [seriesList, sortBy])

  return (
    <div className="min-h-screen px-2 sm:px-4">
      <Title>{t.pageTitle}</Title>

      {/* Sort Controls */}
      <div className="mb-6 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t.sortByLabel}:</span>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "latest" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("latest")}
          >
            {t.sortOptions.latest}
          </Button>
          <Button
            variant={sortBy === "name" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("name")}
          >
            {t.sortOptions.name}
          </Button>
          <Button
            variant={sortBy === "count" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("count")}
          >
            {t.sortOptions.count}
          </Button>
        </div>
      </div>

      <Accordion type="multiple" className="w-full divide-y divide-gray-200 dark:divide-gray-700">
        {sortedSeriesList.map((series) => (
          <SeriesPostsAccordion
            key={series.name}
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
        ))}
      </Accordion>
    </div>
  )
}

export default SeriesListIsland
