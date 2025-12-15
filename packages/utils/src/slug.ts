import * as path from "node:path"

/**
 * Extract slug from file path
 * Uses directory name as slug, or filename if different from directory name
 * @param filePath - Full path to markdown file
 * @returns Extracted slug
 */
export function extractSlugFromPath(filePath: string): string {
  const dirName = path.basename(path.dirname(filePath))
  const fileName = path.basename(filePath, ".md")

  // If filename is different from directory name, use filename as slug
  return fileName !== dirName ? fileName : dirName
}

/**
 * Normalize slug (remove special characters, convert to lowercase)
 * @param slug - Raw slug string
 * @returns Normalized slug
 */
export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9가-힣-]/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
}

/**
 * Get post type from file path
 * @param filePath - File path
 * @returns "post", "memo", or null
 */
export function getPostTypeFromPath(filePath: string): "post" | "memo" | null {
  const normalizedPath = path.normalize(filePath)

  if (normalizedPath.includes("/post/")) {
    return "post"
  } else if (normalizedPath.includes("/memo/")) {
    return "memo"
  }

  return null
}
