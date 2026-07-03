import type { InferGetStaticParamsType } from "astro"
import { format } from "date-fns"
import { OpenGraphImage } from "@/components/og/image"
import { getBookMedia } from "@/utils/library/books"
import { PNG } from "@/utils/openGraph"

const books = await getBookMedia("en")

type Params = InferGetStaticParamsType<typeof getStaticPaths>

export async function GET({ params }: { params: Params }) {
  const book = books.find((b) => b.slug === params.slug)
  if (!book) {
    return new Response("Book not found", { status: 404 })
  }

  const element = OpenGraphImage({
    title: book.title,
    summary: book.oneLiner,
    category: "Book",
    date: book.dateConsumed ? format(book.dateConsumed, "yyyy.MM.dd") : String(book.year),
  })
  const png = await PNG(element)
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
    },
  })
}

export async function getStaticPaths() {
  return books.map((book) => ({
    params: { slug: book.slug },
    props: book,
  }))
}
