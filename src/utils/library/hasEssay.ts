export const ESSAY_MIN_CHARS = 200

const stripFrontmatter = (body: string): string => body.replace(/^---\n[\s\S]*?\n---\n/, "")

const stripMarkdownImages = (body: string): string => body.replace(/!\[[^\]]*\]\([^)]*\)/g, "")

const countMeaningfulChars = (body: string): number => {
  const stripped = stripMarkdownImages(stripFrontmatter(body))
  return stripped.replace(/\s+/g, "").length
}

export const hasEssay = (body: string): boolean => countMeaningfulChars(body) >= ESSAY_MIN_CHARS
