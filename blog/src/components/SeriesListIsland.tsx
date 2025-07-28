import type React from "react"
import SeriesPostsAccordion from "@/components/SeriesPostsAccordion"
import { Accordion } from "@/components/ui/accordion"
import type { Post } from "@/types/content"
import Title from "./Title"

interface Series {
  name: string
  posts: Post[]
  totalPosts: number
}

interface SeriesListIslandProps {
  seriesList: Series[]
}

const SeriesListIsland: React.FC<SeriesListIslandProps> = ({ seriesList }) => {
  return (
    <div className="min-h-screen px-2 sm:px-4">
      <Title>Series</Title>
      <Accordion type="multiple" className="w-full divide-y divide-gray-200 dark:divide-gray-700">
        {seriesList.map((series) => (
          <SeriesPostsAccordion
            key={series.name}
            seriesName={series.name}
            posts={series.posts.map((post) => ({
              ...post.data,
              slug: post.slug,
            }))}
            showPostDates={true}
            accordionType="multiple"
            triggerLabel={
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 dark:text-gray-100 dark:group-hover:text-primary-400">
                    {series.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {`${series.totalPosts}개의 포스트`}
                  </p>
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
