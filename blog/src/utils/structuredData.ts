import pkg from "~/package.json"

export interface ListItem {
  "@type": "ListItem"
  url: string
  position: number
  item: {
    "@type": "Article" | "Collection" | "CreativeWork"
    name: string
    url: string
    description?: string
  }
}

export interface PageSchemaOptions {
  type?:
    | "WebPage"
    | "AboutPage"
    | "CheckoutPage"
    | "CollectionPage"
    | "MediaGallery"
    | "ImageGallery"
    | "VideoGallery"
    | "ContactPage"
    | "FAQPage"
    | "ItemPage"
    | "MedicalWebPage"
    | "ProfilePage"
    | "QAPage"
    | "RealEstateListing"
    | "SearchResultsPage"
  title: string
  description: string
  url: string
  imageUrl?: string
  keywords?: string
  inLanguage?: string
  itemListElements?: ListItem[]
  extra?: Record<string, unknown>
}

export const generateStructuredData = <T extends Record<string, unknown>>(data: T) => ({
  "@context": "https://schema.org",
  ...data,
})

export interface BreadcrumbItem {
  name: string
  item: string
}

export const generateBreadcrumbSchema = (items: BreadcrumbItem[]) =>
  generateStructuredData({
    "@type": "BreadcrumbList",
    itemListElement: items.map((breadcrumbItem, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumbItem.name,
      item: breadcrumbItem.item,
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

  // 기본 WebPage 객체
  const pageSchema: Record<string, unknown> = {
    "@type": type,
    name: title,
    description,
    url,
    inLanguage,
    keywords,
    ...extra,
  }

  if (imageUrl) {
    pageSchema.image = {
      "@type": "ImageObject",
      url: imageUrl,
    }
  }

  // 공통 publisher 정보 추가
  pageSchema.publisher = {
    "@type": "Organization",
    name: pkg.title,
  }

  // 목록 페이지라면, itemListElements 옵션이 있을 경우 ItemList 스키마를 mainEntity에 포함
  if (itemListElements && itemListElements.length > 0) {
    pageSchema.mainEntity = {
      "@type": "ItemList",
      itemListElement: itemListElements.map((item) => ({
        ...item,
        "@type": "ListItem",
      })),
    }
  }

  return generateStructuredData(pageSchema)
}

// Posts 페이지 전용 스키마 생성 함수 (편의 함수)
export const generatePostsPageSchema = (options: Omit<PageSchemaOptions, "type">) => {
  return generatePageSchema({ ...options, type: "CollectionPage" })
}

// Article/BlogPosting 스키마 옵션
export interface ArticleSchemaOptions {
  title: string
  description: string
  url: string
  imageUrl?: string
  keywords?: string
  inLanguage?: string
  datePublished: string
  dateModified?: string
  authorName: string
  authorUrl?: string
  wordCount?: number
  readingTime?: number
  extra?: Record<string, unknown>
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

  const articleSchema: Record<string, unknown> = {
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished,
    inLanguage,
    author: {
      "@type": "Person",
      name: authorName,
      ...(authorUrl && { url: authorUrl }),
    },
    publisher: {
      "@type": "Organization",
      name: pkg.title,
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

// URL 빌더 함수 (통합)
export const buildUrl = (basePath: string, path?: string) => {
  if (path) {
    return `${basePath}${path}`.toLowerCase()
  }
  return basePath.toLowerCase()
}

// 편의 함수들 (하위 호환성을 위해 유지)
export const buildPageUrl = (basePath: string, path: string) => buildUrl(basePath, path)
export const buildItemUrl = (url: string) => buildUrl(url)

// Organization 스키마 생성 함수
export interface OrganizationSchemaOptions {
  name: string
  url: string
  logo?: string
  description?: string
  sameAs?: string[]
  contactPoint?: {
    telephone?: string
    email?: string
    contactType?: string
  }
}

export const generateOrganizationSchema = (options: OrganizationSchemaOptions) => {
  const { name, url, logo, description, sameAs, contactPoint } = options

  const organizationSchema: Record<string, unknown> = {
    "@type": "Organization",
    name,
    url,
  }

  if (logo) {
    organizationSchema.logo = {
      "@type": "ImageObject",
      url: logo,
    }
  }

  if (description) {
    organizationSchema.description = description
  }

  if (sameAs && sameAs.length > 0) {
    organizationSchema.sameAs = sameAs
  }

  if (contactPoint) {
    organizationSchema.contactPoint = {
      "@type": "ContactPoint",
      ...contactPoint,
    }
  }

  return generateStructuredData(organizationSchema)
}

// Person 스키마 생성 함수
export interface PersonSchemaOptions {
  name: string
  url?: string
  image?: string
  description?: string
  jobTitle?: string
  worksFor?: string
  sameAs?: string[]
}

export const generatePersonSchema = (options: PersonSchemaOptions) => {
  const { name, url, image, description, jobTitle, worksFor, sameAs } = options

  const personSchema: Record<string, unknown> = {
    "@type": "Person",
    name,
  }

  if (url) {
    personSchema.url = url
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

  if (jobTitle) {
    personSchema.jobTitle = jobTitle
  }

  if (worksFor) {
    personSchema.worksFor = {
      "@type": "Organization",
      name: worksFor,
    }
  }

  if (sameAs && sameAs.length > 0) {
    personSchema.sameAs = sameAs
  }

  return generateStructuredData(personSchema)
}

// Website 스키마 생성 함수
export interface WebsiteSchemaOptions {
  name: string
  url: string
  description: string
  inLanguage?: string
  potentialAction?: {
    "@type": "SearchAction"
    target: string
    "query-input": string
  }
}

export const generateWebsiteSchema = (options: WebsiteSchemaOptions) => {
  const { name, url, description, inLanguage = "ko", potentialAction } = options

  const websiteSchema: Record<string, unknown> = {
    "@type": "WebSite",
    name,
    url,
    description,
    inLanguage,
  }

  if (potentialAction) {
    websiteSchema.potentialAction = potentialAction
  }

  return generateStructuredData(websiteSchema)
}
