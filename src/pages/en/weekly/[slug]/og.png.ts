import type { InferGetStaticParamsType } from "astro"
import { format } from "date-fns"
import { OpenGraphImage } from "@/components/og/image"
import { formatWeeklyLabel, getEnglishWeeklies } from "@/utils/content/weekly"
import { PNG } from "@/utils/openGraph"

const weeklies = await getEnglishWeeklies()

type Params = InferGetStaticParamsType<typeof getStaticPaths>

export async function GET({ params }: { params: Params }) {
  const weekly = weeklies.find((weekly) => weekly.slug === params.slug)
  if (!weekly) {
    return new Response("Weekly not found", { status: 404 })
  }

  const element = OpenGraphImage({
    title: weekly.data.title,
    summary: weekly.data.summary,
    category: `Weekly ${formatWeeklyLabel(weekly)}`,
    date: format(weekly.data.date, "yyyy.MM.dd"),
  })
  const png = await PNG(element)
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
    },
  })
}

export async function getStaticPaths() {
  return weeklies.map((weekly) => ({
    params: { slug: weekly.slug },
    props: weekly,
  }))
}
