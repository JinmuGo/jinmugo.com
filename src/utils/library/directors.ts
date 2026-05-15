import { getCollection } from "astro:content"
import type { DirectorData, DirectorEntry, DirectorWithSlug, MovieWithSlug } from "@/types/library"

const stripExt = (id: string) => id.replace(/\.mdx?$/, "")

export async function getDirectors(): Promise<DirectorWithSlug[]> {
  const entries = await getCollection("director", ({ data }: { data: DirectorData }) => !data.draft)
  return entries.map((entry: DirectorEntry) => {
    const slug = stripExt(entry.id)
    return {
      ...entry,
      slug,
      href: `/library/movies/director/${slug}/`,
    }
  })
}

export async function getDirectorById(directorId: string): Promise<DirectorWithSlug | undefined> {
  const directors = await getDirectors()
  return directors.find((d) => d.slug === directorId)
}

export function moviesByDirector(movies: MovieWithSlug[], directorId: string): MovieWithSlug[] {
  return movies.filter((m) => m.data.directorId === directorId)
}
