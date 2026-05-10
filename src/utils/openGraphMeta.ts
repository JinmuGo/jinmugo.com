import { detectLanguage } from "@/utils/language"

type ContentType = "post" | "weekly"

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
  const collectionPathByType: Record<ContentType, string> = {
    post: "posts",
    weekly: "weekly",
  }
  const collectionPath = collectionPathByType[contentType]

  return `${localePrefix}/${collectionPath}/${slug}/og.png`
}

export function getOpenGraphImageSource(image: OpenGraphImageInput): string | undefined {
  if (typeof image === "string") {
    return image
  }

  return image?.src
}
