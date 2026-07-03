import type { ImageMetadata } from "astro"
import { pickAssetBySlug } from "@/utils/assetLookup"

export const getBannerImageBySlug = (slug: string): ImageMetadata | undefined => {
  const images = import.meta.glob<{ default: ImageMetadata }>(
    "../../obsidian/post/**/*.{jpg,jpeg,png,webp}",
    { eager: true },
  )

  return pickAssetBySlug(images, "../../obsidian/post", slug)
}
