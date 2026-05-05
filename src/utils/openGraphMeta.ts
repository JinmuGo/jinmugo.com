import { detectLanguage } from "@/utils/language"

type ContentType = "memo" | "post"

interface BuildContentOgImagePathOptions {
  contentType: ContentType
  pathname: string
  slug: string
}

interface ImageMetadataLike {
  src: string
}

export type OpenGraphImageInput = ImageMetadataLike | string | undefined

export function buildContentOgImagePath({
  contentType,
  pathname,
  slug,
}: BuildContentOgImagePathOptions): string {
  const localePrefix = detectLanguage(pathname) === "en" ? "/en" : ""
  const collectionPath = contentType === "post" ? "posts" : "memos"

  return `${localePrefix}/${collectionPath}/${slug}/og.png`
}

export function getOpenGraphImageSource(image: OpenGraphImageInput): string | undefined {
  if (typeof image === "string") {
    return image
  }

  return image?.src
}
