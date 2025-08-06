import type { InferGetStaticParamsType } from "astro"

import { OpenGraphImage } from "@/components/og/image"
import { getEnglishMemos } from "@/content-utils/memos"

import { PNG } from "@/utils/openGraph"

const memos = await getEnglishMemos()

type Params = InferGetStaticParamsType<typeof getStaticPaths>

export async function GET({ params }: { params: Params }) {
  const memo = memos.find((memo) => memo.slug === params.slug)
  if (!memo) {
    return new Response("Memo not found", { status: 404 })
  }

  const element = OpenGraphImage({
    title: memo.data.title,
    summary: memo.data.summary,
  })
  const png = await PNG(element)
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
    },
  })
}

export async function getStaticPaths() {
  return memos.map((memo) => ({
    params: { slug: memo.slug },
    props: memo,
  }))
}
