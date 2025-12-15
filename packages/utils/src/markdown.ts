import * as fs from "node:fs"
import * as path from "node:path"
import matter from "gray-matter"

/**
 * Find all markdown files recursively in a directory
 * @param dir - Directory to search
 * @param excludeEnglish - Exclude .en.md files (default: true)
 * @returns Array of file paths
 */
export function findMarkdownFiles(dir: string, excludeEnglish = true): string[] {
  const files: string[] = []

  if (!fs.existsSync(dir)) {
    return files
  }

  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath, excludeEnglish))
    } else if (item.endsWith(".md")) {
      if (excludeEnglish && item.endsWith(".en.md")) {
        continue
      }
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Parse frontmatter from markdown file
 * @param filePath - Path to markdown file
 * @returns Parsed frontmatter data or null if parsing fails
 */
export function parseFrontmatter<T = Record<string, unknown>>(
  filePath: string,
): { data: T; content: string } | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8")
    const { data, content: markdownContent } = matter(content)
    return { data: data as T, content: markdownContent }
  } catch (_error) {
    return null
  }
}

/**
 * Parse frontmatter from string content
 * @param content - Markdown content string
 * @returns Parsed frontmatter data
 */
export function parseFrontmatterFromString<T = Record<string, unknown>>(
  content: string,
): {
  data: T
  content: string
} {
  const { data, content: markdownContent } = matter(content)
  return { data: data as T, content: markdownContent }
}
