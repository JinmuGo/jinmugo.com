import type { ImageMetadata } from "astro"
import type { Weekly } from "@/types/content"

const covers = import.meta.glob<{ default: ImageMetadata }>(
  "~/obsidian/weekly/**/*.{jpg,jpeg,png,webp}",
  { eager: true },
)

export function getWeeklyCoverImage(weekly: Weekly): ImageMetadata | undefined {
  if (!weekly.data.cover) {
    return undefined
  }

  const coverPath = weekly.data.cover.replace(/^\.\//, "")
  const cleanSlug = weekly.slug.replace(/\.en$/, "")

  return covers[`/obsidian/weekly/${cleanSlug}/${coverPath}`]?.default
}
