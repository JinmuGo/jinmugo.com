import type { ImageMetadata } from "astro"
import { pickAssetBySlug } from "@/utils/assetLookup"

export function getCover(kind: "book" | "movie", slug: string): ImageMetadata | undefined {
  const images = import.meta.glob<{ default: ImageMetadata }>(
    ["../../content/book/**/*.{jpg,jpeg,png,webp}", "../../content/movie/**/*.{jpg,jpeg,png,webp}"],
    { eager: true },
  )

  return pickAssetBySlug(images, `../../content/${kind}`, slug)
}
