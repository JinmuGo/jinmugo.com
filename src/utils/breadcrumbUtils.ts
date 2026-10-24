import type { BreadcrumbItem } from "@/types/schema"
import { withTrailingSlash } from "@/utils/language"

export interface BreadcrumbConfig {
  pathname: string
  origin: string
  title?: string
}

const SECTION_NAMES: Record<string, string> = {
  posts: "Posts",
  memos: "Memos",
  gallery: "Gallery",
}

/**
 * URL 경로로 breadcrumb 항목을 만든다. 화면에는 보이지 않고 JSON-LD에만 쓴다.
 */
export function generateBreadcrumbItems({
  pathname,
  origin,
  title,
}: BreadcrumbConfig): BreadcrumbItem[] {
  const itemUrl = (path: string) => new URL(withTrailingSlash(path), origin).href
  const segments = pathname.split("/").filter(Boolean)
  const basePath = segments[0] === "en" ? "/en" : ""
  if (basePath) {
    segments.shift()
  }

  const items: BreadcrumbItem[] = [{ name: "Home", item: itemUrl(`${basePath}/`) }]
  const [section, slug] = segments
  if (!section) {
    return items
  }

  const sectionName = SECTION_NAMES[section]
  if (sectionName) {
    items.push({ name: sectionName, item: itemUrl(`${basePath}/${section}/`) })
  }
  if ((slug || !sectionName) && title) {
    items.push({ name: title, item: itemUrl(pathname) })
  }
  return items
}
