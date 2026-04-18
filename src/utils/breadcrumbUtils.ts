import type { BreadcrumbItem } from "@/types/schema"

export interface BreadcrumbConfig {
  pathname: string
  origin: string
  lang?: "ko" | "en"
  title?: string
  category?: string
  postType?: "post" | "memo"
}

/**
 * URL 경로를 기반으로 breadcrumb 항목들을 자동 생성
 */
export function generateBreadcrumbItems(config: BreadcrumbConfig): BreadcrumbItem[] {
  const { pathname, origin, lang = "ko", title, category, postType } = config
  const items: BreadcrumbItem[] = []

  // 언어별 기본 텍스트
  const texts = {
    ko: {
      home: "Home",
      posts: "Posts",
      memos: "Memos",
      archives: "Archives",
      about: "About",
      gallery: "Gallery",
      category: "Category",
      tag: "Tag",
      year: "Year",
    },
    en: {
      home: "Home",
      posts: "Posts",
      memos: "Memos",
      archives: "Archives",
      about: "About",
      gallery: "Gallery",
      category: "Category",
      tag: "Tag",
      year: "Year",
    },
  }

  const t = texts[lang]
  const basePath = lang === "en" ? "/en" : ""

  // 홈 항상 추가
  items.push({
    name: t.home,
    item: `${origin}${basePath}/`,
  })

  // 경로 분석
  const pathSegments = pathname.split("/").filter(Boolean)

  // 영어 경로인 경우 'en' 세그먼트 제거
  if (pathSegments[0] === "en") {
    pathSegments.shift()
  }

  if (pathSegments.length === 0) {
    // 홈 페이지
    return items
  }

  const [firstSegment, secondSegment, thirdSegment, fourthSegment] = pathSegments

  switch (firstSegment) {
    case "posts":
      items.push({
        name: t.posts,
        item: `${origin}${basePath}/posts/`,
      })

      if (secondSegment && title) {
        // 개별 포스트 페이지
        items.push({
          name: title,
          item: `${origin}${pathname}`,
        })
      }
      break

    case "memos":
      items.push({
        name: t.memos,
        item: `${origin}${basePath}/memos/`,
      })

      if (secondSegment && title) {
        // 개별 메모 페이지
        items.push({
          name: title,
          item: `${origin}${pathname}`,
        })
      }
      break

    case "archives":
      items.push({
        name: t.archives,
        item: `${origin}${basePath}/archives/`,
      })

      if (secondSegment && thirdSegment) {
        // archives/category/tech 형태
        const classifyType = secondSegment as "category" | "tag" | "year"
        const classifyName = t[classifyType] || secondSegment
        const targetName = decodeURIComponent(thirdSegment)

        items.push({
          name: `${classifyName}: ${targetName.charAt(0).toUpperCase() + targetName.slice(1)}`,
          item: `${origin}${pathname}`,
        })
      }
      break

    case "about":
      items.push({
        name: t.about,
        item: `${origin}${pathname}`,
      })
      break

    case "gallery":
      items.push({
        name: t.gallery,
        item: `${origin}${pathname}`,
      })
      break

    default:
      // 기타 페이지들
      if (title) {
        items.push({
          name: title,
          item: `${origin}${pathname}`,
        })
      }
      break
  }

  return items
}

/**
 * 포스트/메모 페이지용 breadcrumb 생성
 */
export function generateContentBreadcrumbs(config: {
  pathname: string
  origin: string
  lang?: "ko" | "en"
  title: string
  category?: string
  contentType: "post" | "memo"
}): BreadcrumbItem[] {
  const { pathname, origin, lang = "ko", title, category, contentType } = config

  return generateBreadcrumbItems({
    pathname,
    origin,
    lang,
    title,
    category,
    postType: contentType,
  })
}

/**
 * 아카이브 페이지용 breadcrumb 생성
 */
export function generateArchiveBreadcrumbs(config: {
  pathname: string
  origin: string
  lang?: "ko" | "en"
  classify: string
  target: string
}): BreadcrumbItem[] {
  const { pathname, origin, lang = "ko", classify, target } = config

  return generateBreadcrumbItems({
    pathname,
    origin,
    lang,
  })
}
