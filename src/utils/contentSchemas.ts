import type { PostMetadata, WeeklyMetadata } from "@/types/content"
import type { ContentType, Lang } from "@/types/utils"
import { generateContentBreadcrumbs } from "@/utils/breadcrumbUtils"
import { detectLanguage } from "@/utils/language"
import {
  type BreadcrumbItem,
  generateArticleSchema,
  generateBlogPostingSchema,
  generateBreadcrumbSchema,
} from "@/utils/structuredData"

/**
 * Options for generating content schemas
 */
export interface GenerateContentSchemasOptions {
  /** Post or Weekly frontmatter */
  frontmatter: PostMetadata | WeeklyMetadata
  /** Current page pathname */
  pathname: string
  /** Site origin URL */
  origin: string
  /** Type of content (post or memo) */
  contentType: ContentType
  /** Optional image URL override */
  imageUrl?: string
}

/**
 * Generated schemas for content pages
 */
export interface ContentSchemas {
  /** BlogPosting or Article schema */
  pageSchema:
    | ReturnType<typeof generateBlogPostingSchema>
    | ReturnType<typeof generateArticleSchema>
  /** Breadcrumb list schema */
  breadcrumbSchema: ReturnType<typeof generateBreadcrumbSchema>
  /** Breadcrumb items for rendering */
  breadcrumbItems: BreadcrumbItem[]
  /** Detected language from pathname */
  lang: Lang
}

/**
 * Generates all schemas needed for a content page (post, memo, or weekly)
 * Consolidates schema generation logic used across all layout files
 *
 * @param options - Schema generation options
 * @returns All generated schemas and metadata
 */
export function generateContentSchemas(options: GenerateContentSchemasOptions): ContentSchemas {
  const { frontmatter, pathname, origin, contentType, imageUrl } = options
  const { title, date, summary, tags, href } = frontmatter
  const category = "category" in frontmatter ? frontmatter.category : undefined

  // Detect language from pathname
  const lang = detectLanguage(pathname)

  // Prepare common schema options
  const commonOptions = {
    title: title,
    description: summary || title,
    url: href,
    keywords: tags?.join(", ") || "",
    inLanguage: lang,
    datePublished: date.toISOString(),
    dateModified: date.toISOString(),
    authorName: "Jinmu",
    authorUrl: "https://jinmu.me/about",
    wordCount: frontmatter.wordCount,
    readingTime: frontmatter.readingTime,
    imageUrl: imageUrl || (frontmatter.image ? `${origin}${frontmatter.image}` : undefined),
  }

  // Generate appropriate schema based on content type
  const pageSchema =
    contentType === "post"
      ? generateBlogPostingSchema(commonOptions)
      : generateArticleSchema({ ...commonOptions, extra: { articleSection: contentType } })

  // Generate breadcrumb items
  const breadcrumbItems = generateContentBreadcrumbs({
    pathname,
    origin,
    lang,
    title,
    category,
    contentType,
  })

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems)

  return {
    pageSchema,
    breadcrumbSchema,
    breadcrumbItems,
    lang,
  }
}
