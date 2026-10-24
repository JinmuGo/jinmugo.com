import type { PostMetadata } from "@/types/content"
import type { Lang } from "@/types/utils"
import { generateBreadcrumbItems } from "@/utils/breadcrumbUtils"
import { detectLanguage } from "@/utils/language"
import {
  AUTHOR_URL,
  type BreadcrumbItem,
  generateBlogPostingSchema,
  generateBreadcrumbSchema,
} from "@/utils/structuredData"
import pkg from "~/package.json"

/**
 * Options for generating content schemas
 */
export interface GenerateContentSchemasOptions {
  /** Post frontmatter */
  frontmatter: PostMetadata
  /** Current page pathname */
  pathname: string
  /** Site origin URL */
  origin: string
  /** Optional image URL override */
  imageUrl?: string
}

/**
 * Generated schemas for content pages
 */
export interface ContentSchemas {
  /** BlogPosting schema */
  pageSchema: ReturnType<typeof generateBlogPostingSchema>
  /** Breadcrumb list schema */
  breadcrumbSchema: ReturnType<typeof generateBreadcrumbSchema>
  /** Breadcrumb items for rendering */
  breadcrumbItems: BreadcrumbItem[]
  /** Detected language from pathname */
  lang: Lang
}

/**
 * Generates all schemas needed for a post or memo page
 * Consolidates schema generation logic used across all layout files
 *
 * @param options - Schema generation options
 * @returns All generated schemas and metadata
 */
export function generateContentSchemas(options: GenerateContentSchemasOptions): ContentSchemas {
  const { frontmatter, pathname, origin, imageUrl } = options
  const { title, date, lastmod, summary, tags } = frontmatter

  // Detect language from pathname
  const lang = detectLanguage(pathname)

  // Prepare common schema options
  const commonOptions = {
    title: title,
    description: summary || title,
    url: new URL(pathname, origin).href,
    keywords: tags?.join(", ") || "",
    inLanguage: lang,
    datePublished: date.toISOString(),
    dateModified: (lastmod ?? date).toISOString(),
    authorName: pkg.author,
    authorUrl: AUTHOR_URL,
    wordCount: frontmatter.wordCount,
    readingTime: frontmatter.readingTime,
    imageUrl: imageUrl || (frontmatter.image ? new URL(frontmatter.image, origin).href : undefined),
  }

  const pageSchema = generateBlogPostingSchema(commonOptions)
  const breadcrumbItems = generateBreadcrumbItems({ pathname, origin, title })

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems)

  return {
    pageSchema,
    breadcrumbSchema,
    breadcrumbItems,
    lang,
  }
}
