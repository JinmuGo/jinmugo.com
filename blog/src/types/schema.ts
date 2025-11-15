/**
 * JSON-LD Schema.org types for SEO and structured data
 */

/**
 * List item for Schema.org ItemList
 */
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

/**
 * Breadcrumb item for navigation
 */
export interface BreadcrumbItem {
  name: string
  item: string
}

/**
 * Page schema generation options
 */
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

/**
 * Article/BlogPosting schema options
 */
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

/**
 * Organization schema options
 */
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

/**
 * Person schema options
 */
export interface PersonSchemaOptions {
  name: string
  url?: string
  image?: string
  description?: string
  jobTitle?: string
  worksFor?: string
  sameAs?: string[]
}

/**
 * Website schema options
 */
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
