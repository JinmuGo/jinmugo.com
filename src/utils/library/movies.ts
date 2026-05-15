import { getCollection } from "astro:content"
import type {
  MediaItem,
  MovieData,
  MovieEntry,
  MovieMedia,
  MovieStatus,
  MovieWithSlug,
} from "@/types/library"
import { getDirectors } from "./directors"
import { hasEssay } from "./hasEssay"

const slugFromId = (id: string): string =>
  id
    .replace(/\.mdx?$/, "")
    .split("/")
    .pop() ?? id

export const sortMoviesByDateWatched = (movies: MovieWithSlug[]): MovieWithSlug[] =>
  [...movies].sort((a, b) => {
    const aTime = a.data.dateWatched?.getTime() ?? -Infinity
    const bTime = b.data.dateWatched?.getTime() ?? -Infinity
    return bTime - aTime
  })

export const sortMediaByDate = <T extends MediaItem>(items: T[]): T[] =>
  [...items].sort((a, b) => {
    const aTime = a.dateConsumed?.getTime() ?? -Infinity
    const bTime = b.dateConsumed?.getTime() ?? -Infinity
    return bTime - aTime
  })

export const filterMoviesByStatus = (
  movies: MovieWithSlug[],
  status: MovieStatus | null,
): MovieWithSlug[] => (status === null ? movies : movies.filter((m) => m.data.status === status))

export async function getMovies(): Promise<MovieWithSlug[]> {
  const entries = await getCollection("movie", ({ data }: { data: MovieData }) => !data.draft)
  return entries.map((entry: MovieEntry) => {
    const slug = slugFromId(entry.id)
    const body = entry.body ?? ""
    return {
      ...entry,
      slug,
      href: `/library/movies/${slug}/`,
      hasEssay: hasEssay(body),
    } as MovieWithSlug
  })
}

export async function getMovieMedia(): Promise<MovieMedia[]> {
  const [movies, directors] = await Promise.all([getMovies(), getDirectors()])
  const directorById = new Map(directors.map((d) => [d.slug, d]))

  return movies.map((movie): MovieMedia => {
    const d = movie.data
    const director = directorById.get(d.directorId)
    return {
      kind: "movie",
      slug: movie.slug,
      href: movie.href,
      hasEssay: movie.hasEssay,
      title: d.title,
      year: d.year,
      creatorId: d.directorId,
      creatorName: director?.data.name ?? d.directorId,
      creatorHref: director?.href,
      oneLiner: d.oneLiner,
      rating: d.rating,
      status: d.status,
      dateConsumed: d.dateWatched,
      cover: d.cover,
      tags: d.tags,
      quote: d.quote,
      language: d.language,
      runtime: d.runtime,
      studio: d.studio,
      originalTitle: d.originalTitle,
    }
  })
}
