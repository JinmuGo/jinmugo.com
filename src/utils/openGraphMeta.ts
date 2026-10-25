import { detectLanguage } from "@/utils/language"

interface BuildContentOgImagePathOptions {
  pathname: string
  slug: string
}

interface ImageMetadataLike {
  src: string
}

export type OpenGraphImageInput = ImageMetadataLike | string | undefined

export function buildContentOgImagePath({
  pathname,
  slug,
}: BuildContentOgImagePathOptions): string {
  const localePrefix = detectLanguage(pathname) === "en" ? "/en" : ""
  return `${localePrefix}/posts/${slug}/og.png`
}

export function getOpenGraphImageSource(image: OpenGraphImageInput): string | undefined {
  if (typeof image === "string") {
    return image
  }

  return image?.src
}
