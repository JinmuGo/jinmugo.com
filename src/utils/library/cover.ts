import type { ImageMetadata } from "astro"

export function getCover(kind: "book" | "movie", slug: string): ImageMetadata | undefined {
  const images = import.meta.glob<{ default: ImageMetadata }>(
    ["../../content/book/**/*.{jpg,jpeg,png,webp}", "../../content/movie/**/*.{jpg,jpeg,png,webp}"],
    { eager: true },
  )

  for (const ext of ["webp", "png", "jpg", "jpeg"] as const) {
    const key = `../../content/${kind}/${slug}/${slug}.${ext}`
    const image = images[key]
    if (image) {
      return image.default
    }
  }

  return undefined
}
