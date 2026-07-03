import type { ImageMetadata } from "astro"

const EXTENSIONS = ["webp", "png", "jpg", "jpeg"] as const

/**
 * Pick the first matching `<basePath>/<slug>/<slug>.<ext>` image from an
 * eagerly loaded import.meta.glob result.
 *
 * Callers must pass the literal glob result so Vite can analyze the glob
 * pattern at build time.
 */
export function pickAssetBySlug(
  images: Record<string, { default: ImageMetadata }>,
  basePath: string,
  slug: string,
): ImageMetadata | undefined {
  for (const ext of EXTENSIONS) {
    const key = `${basePath}/${slug}/${slug}.${ext}`
    const image = images[key]
    if (image) {
      return image.default
    }
  }

  return undefined
}
