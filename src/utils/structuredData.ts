import type {
  ArticleSchemaOptions,
  BreadcrumbItem,
  ListItem,
  PageSchemaOptions,
  PersonSchemaOptions,
  WebsiteSchemaOptions,
} from "@/types/schema"
import { withTrailingSlash } from "@/utils/language"
import pkg from "~/package.json"

// Re-export types for backward compatibility
export type {
  ArticleSchemaOptions,
  BreadcrumbItem,
  ListItem,
  PageSchemaOptions,
  PersonSchemaOptions,
  WebsiteSchemaOptions,
}

export const buildUrl = (basePath: string, path?: string) => {
  const url = new URL(`${basePath}${path ?? ""}`, pkg.homepage)
  url.pathname = withTrailingSlash(url.pathname)
  return url.href
}

export const buildPageUrl = (basePath: string, path: string) => buildUrl(basePath, path)
export const buildItemUrl = (url: string) => buildUrl(url)

export const AUTHOR_URL = new URL("/about/", pkg.homepage).href
export const PERSON_ID = new URL("/#person", pkg.homepage).href
export const WEBSITE_ID = new URL("/#website", pkg.homepage).href

const entityId = (url: string, fragment: string) => new URL(`#${fragment}`, buildItemUrl(url)).href
const authorEntity = (name: string, url?: string) => ({
  "@type": "Person",
  ...(name === pkg.author && { "@id": PERSON_ID, sameAs: Object.values(pkg.social) }),
  name,
  ...(url && { url: buildItemUrl(url) }),
})

export const generateStructuredData = <T extends Record<string, unknown>>(data: T) => ({
  "@context": "https://schema.org",
  ...data,
})

export const generateBreadcrumbSchema = (items: BreadcrumbItem[]) =>
  generateStructuredData({
    "@type": "BreadcrumbList",
    itemListElement: items.map((breadcrumbItem, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumbItem.name,
      item: {
        "@type": "WebPage",
        "@id": breadcrumbItem.item,
        url: breadcrumbItem.item,
        name: breadcrumbItem.name,
      },
    })),
  })

// 기본 페이지 스키마 생성 함수
export const generatePageSchema = (options: PageSchemaOptions) => {
  const {
    type = "WebPage",
    title,
    description,
    url,
    imageUrl,
    keywords,
    inLanguage = "ko",
    itemListElements,
    extra = {},
  } = options

  const canonicalUrl = buildItemUrl(url)
  const pageSchema: Record<string, unknown> = {
    "@type": type,
    "@id": entityId(canonicalUrl, "webpage"),
    name: title,
    description,
    url: canonicalUrl,
    inLanguage,
    keywords,
    isPartOf: { "@id": WEBSITE_ID },
    ...(type === "ProfilePage" && { mainEntity: { "@id": PERSON_ID } }),
    ...extra,
  }

  if (imageUrl) {
    pageSchema.image = {
      "@type": "ImageObject",
      url: imageUrl,
    }
  }

  // 목록 페이지라면, itemListElements 옵션이 있을 경우 ItemList 스키마를 mainEntity에 포함
  if (itemListElements && itemListElements.length > 0) {
    pageSchema.mainEntity = {
      "@type": "ItemList",
      itemListElement: itemListElements.map((item) => ({
        ...item,
        "@type": "ListItem",
        url: buildItemUrl(item.url),
        item: {
          ...item.item,
          url: buildItemUrl(item.item.url),
        },
      })),
    }
  }

  return generateStructuredData(pageSchema)
}

// Posts 페이지 전용 스키마 생성 함수 (편의 함수)
export const generatePostsPageSchema = (options: Omit<PageSchemaOptions, "type">) => {
  return generatePageSchema({ ...options, type: "CollectionPage" })
}

// Article 스키마 생성 함수
export const generateArticleSchema = (options: ArticleSchemaOptions) => {
  const {
    title,
    description,
    url,
    imageUrl,
    keywords,
    inLanguage = "ko",
    datePublished,
    dateModified,
    authorName,
    authorUrl,
    wordCount,
    readingTime,
    extra = {},
  } = options

  const canonicalUrl = buildItemUrl(url)
  const author = authorEntity(authorName, authorUrl)
  const articleSchema: Record<string, unknown> = {
    "@type": "Article",
    "@id": entityId(canonicalUrl, "article"),
    headline: title,
    description,
    url: canonicalUrl,
    datePublished,
    inLanguage,
    author,
    publisher: author,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": entityId(canonicalUrl, "webpage"),
    },
    ...extra,
  }

  if (dateModified) {
    articleSchema.dateModified = dateModified
  }

  if (imageUrl) {
    articleSchema.image = {
      "@type": "ImageObject",
      url: imageUrl,
    }
  }

  if (keywords) {
    articleSchema.keywords = keywords
  }

  if (wordCount) {
    articleSchema.wordCount = wordCount
  }

  if (readingTime) {
    articleSchema.timeRequired = `PT${readingTime}M`
  }

  return generateStructuredData(articleSchema)
}

// BlogPosting 스키마 생성 함수 (편의 함수)
export const generateBlogPostingSchema = (options: ArticleSchemaOptions) => {
  const articleSchema = generateArticleSchema(options)
  // BlogPosting은 Article의 하위 타입이므로 @type만 변경
  return {
    ...articleSchema,
    "@type": "BlogPosting",
  }
}

// Person 스키마 생성 함수
export const generatePersonSchema = (options: PersonSchemaOptions) => {
  const { name, url, image, description, sameAs } = options

  const personSchema: Record<string, unknown> = {
    "@type": "Person",
    ...(name === pkg.author && { "@id": PERSON_ID }),
    name,
  }

  if (url) {
    personSchema.url = buildItemUrl(url)
  }

  if (image) {
    personSchema.image = {
      "@type": "ImageObject",
      url: image,
    }
  }

  if (description) {
    personSchema.description = description
  }

  if (sameAs && sameAs.length > 0) {
    personSchema.sameAs = sameAs
  }

  return generateStructuredData(personSchema)
}

// Website 스키마 생성 함수
export const generateWebsiteSchema = (options: WebsiteSchemaOptions) => {
  const { name, url, description, inLanguage = "ko", potentialAction } = options

  const websiteSchema: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name,
    url: buildItemUrl(url),
    description,
    inLanguage,
    publisher: { "@id": PERSON_ID },
  }

  if (potentialAction) {
    websiteSchema.potentialAction = potentialAction
  }

  return generateStructuredData(websiteSchema)
}
