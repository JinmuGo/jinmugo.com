import type { InferGetStaticParamsType } from "astro"
import { format } from "date-fns"
import { OpenGraphImage } from "@/components/og/image"
import { getMovieMedia } from "@/utils/library/movies"
import { PNG } from "@/utils/openGraph"

const movies = await getMovieMedia("ko")

type Params = InferGetStaticParamsType<typeof getStaticPaths>

export async function GET({ params }: { params: Params }) {
  const movie = movies.find((m) => m.slug === params.slug)
  if (!movie) {
    return new Response("Movie not found", { status: 404 })
  }

  const element = OpenGraphImage({
    title: movie.title,
    summary: movie.oneLiner,
    category: "Movie",
    date: movie.dateConsumed ? format(movie.dateConsumed, "yyyy.MM.dd") : String(movie.year),
  })
  const png = await PNG(element)
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
    },
  })
}

export async function getStaticPaths() {
  return movies.map((movie) => ({
    params: { slug: movie.slug },
    props: movie,
  }))
}
