import type { ImageMetadata } from "astro"
import type { PostLayoutType } from "@/types/utils"

/**
 * Result of layout selection
 */
export interface LayoutSelection {
  /** Selected layout type */
  layout: PostLayoutType
  /** Banner image if available */
  bannerImage?: ImageMetadata
}

/**
 * Selects the appropriate post layout based on banner image dimensions
 *
 * @param bannerImage - Optional banner image metadata
 * @returns Layout selection result
 *
 * @example
 * const bannerImage = getBannerImageBySlug(slug)
 * const { layout, bannerImage: image } = selectPostLayout(bannerImage)
 */
export function selectPostLayout(bannerImage?: ImageMetadata): LayoutSelection {
  if (!bannerImage) {
    return {
      layout: "PostDefault",
    }
  }

  const { width, height } = bannerImage

  // Landscape orientation -> PostBannerX
  if (width > height) {
    return {
      layout: "PostBannerX",
      bannerImage,
    }
  }

  // Portrait orientation -> PostBannerY
  return {
    layout: "PostBannerY",
    bannerImage,
  }
}
