import { getCollection } from "astro:content"
import type { MovieData, MovieEntry, MovieMedia, MovieStatus, MovieWithSlug } from "@/types/library"
import { isEnglishEntry, type LibraryLang, slugFromId } from "./common"
import { getCover } from "./cover"
import { hasEssay } from "./hasEssay"

export type { LibraryLang }

export const sortMoviesByDateWatched = (movies: MovieWithSlug[]): MovieWithSlug[] =>
  [...movies].sort((a, b) => {
    const aTime = a.data.dateWatched?.getTime() ?? -Infinity
    const bTime = b.data.dateWatched?.getTime() ?? -Infinity
    return bTime - aTime
  })

export const filterMoviesByStatus = (
  movies: MovieWithSlug[],
  status: MovieStatus | null,
): MovieWithSlug[] => (status === null ? movies : movies.filter((m) => m.data.status === status))

export async function getMovies(lang: LibraryLang = "ko"): Promise<MovieWithSlug[]> {
  const entries = await getCollection("movie", ({ data }: { data: MovieData }) => !data.draft)
  return entries
    .filter((entry: MovieEntry) => (lang === "en") === isEnglishEntry(entry.id))
    .map((entry: MovieEntry) => {
      const slug = slugFromId(entry.id)
      const body = entry.body ?? ""
      return {
        ...entry,
        slug,
        href: lang === "en" ? `/en/library/movies/${slug}/` : `/library/movies/${slug}/`,
        hasEssay: hasEssay(body),
      } as MovieWithSlug
    })
}

export async function getMovieMedia(lang: LibraryLang = "ko"): Promise<MovieMedia[]> {
  const movies = await getMovies(lang)

  return movies.map((movie): MovieMedia => {
    const d = movie.data
    return {
      kind: "movie",
      slug: movie.slug,
      href: movie.href,
      hasEssay: movie.hasEssay,
      title: d.title,
      year: d.year,
      creatorName: d.director,
      oneLiner: d.oneLiner,
      rating: d.rating,
      status: d.status,
      dateConsumed: d.dateWatched,
      cover: getCover("movie", movie.slug),
      tags: d.tags,
      quote: d.quote,
      language: d.language,
      originalTitle: d.originalTitle,
    }
  })
}
