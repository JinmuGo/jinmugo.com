import type { Post } from "@/types/content"
import type { SeriesMetadata, SeriesSortOption, SeriesTranslations } from "@/types/series"
import type { Lang } from "@/types/utils"

/**
 * Groups content by series with enhanced metadata
 */
export function groupContentBySeries(contents: Post[]): SeriesMetadata[] {
  const map = new Map<string, SeriesMetadata>()

  for (const content of contents) {
    const seriesName = content.data.series
    if (!seriesName) {
      continue
    }

    if (!map.has(seriesName)) {
      map.set(seriesName, {
        name: seriesName,
        posts: [],
        totalPosts: 0,
        firstPublished: content.data.date,
        lastUpdated: content.data.date,
        primaryCategory: null,
        categoryDistribution: {},
      })
    }

    const series = map.get(seriesName)
    if (!series) {
      continue
    }

    series.posts.push(content)
    series.totalPosts++

    // Update date range
    if (content.data.date < series.firstPublished) {
      series.firstPublished = content.data.date
    }
    if (content.data.date > series.lastUpdated) {
      series.lastUpdated = content.data.date
    }

    // Track category distribution
    if (content.data.category) {
      series.categoryDistribution[content.data.category] =
        (series.categoryDistribution[content.data.category] || 0) + 1
    }
  }

  // Post-process: determine primary category, sort posts
  for (const series of map.values()) {
    // Find most common category
    let maxCount = 0
    for (const [category, count] of Object.entries(series.categoryDistribution)) {
      if (count > maxCount) {
        maxCount = count
        series.primaryCategory = category
      }
    }

    // Sort posts within series by seriesOrder or date
    series.posts.sort((a, b) => {
      if (a.data.seriesOrder !== undefined && b.data.seriesOrder !== undefined) {
        return a.data.seriesOrder - b.data.seriesOrder
      }
      if (a.data.seriesOrder !== undefined) {
        return -1
      }
      if (b.data.seriesOrder !== undefined) {
        return 1
      }
      return new Date(a.data.date).getTime() - new Date(b.data.date).getTime()
    })
  }

  return Array.from(map.values())
}

/**
 * Sorts series list by specified option
 */
export function sortSeriesList(
  seriesList: SeriesMetadata[],
  sortBy: SeriesSortOption,
): SeriesMetadata[] {
  const sorted = [...seriesList]

  switch (sortBy) {
    case "latest":
      return sorted.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
    case "count":
      return sorted.sort((a, b) => b.totalPosts - a.totalPosts)
    default:
      return sorted
  }
}

/**
 * Returns localized translations for series page
 */
export function getSeriesTranslations(lang: Lang): SeriesTranslations {
  const translations: Record<Lang, SeriesTranslations> = {
    ko: {
      pageTitle: "Series",
      pageDescription:
        "여러 편에 걸쳐 이어 쓴 글을 시리즈로 묶었습니다. 한 주제를 처음부터 끝까지 따라 읽을 수 있습니다.",
      postsCount: (count: number) => `${count}개의 포스트`,
      sortByLabel: "정렬",
      sortOptions: {
        latest: "최신순",
        name: "이름순",
        count: "포스트 수순",
      },
      firstPublished: "첫 게시",
      lastUpdated: "마지막 업데이트",
      primaryCategory: "주요 카테고리",
      readingTime: "총 읽기 시간",
      minutes: "분",
    },
    en: {
      pageTitle: "Series",
      pageDescription: "Jinmu's blog series",
      postsCount: (count: number) => `${count} post${count !== 1 ? "s" : ""}`,
      sortByLabel: "Sort by",
      sortOptions: {
        latest: "Latest",
        name: "Name",
        count: "Post count",
      },
      firstPublished: "First published",
      lastUpdated: "Last updated",
      primaryCategory: "Primary category",
      readingTime: "Total reading time",
      minutes: "min",
    },
  }

  return translations[lang]
}

/**
 * Formats date for display based on language
 */
export function formatSeriesDate(date: Date, lang: Lang): string {
  const locale = lang === "ko" ? "ko-KR" : "en-US"
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: lang === "ko" ? "long" : "short",
    day: "numeric",
  })
}
