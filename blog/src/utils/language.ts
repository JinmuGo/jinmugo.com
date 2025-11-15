import type { Lang } from "@/types/utils"

/**
 * Detects the language from the URL pathname
 * @param pathname - The URL pathname to check
 * @returns "en" if pathname starts with "/en", otherwise "ko"
 */
export function detectLanguage(pathname: string): Lang {
  return pathname.startsWith("/en") ? "en" : "ko"
}

/**
 * Gets the URL prefix for a given language
 * @param lang - The language code
 * @returns Empty string for Korean, "/en" for English
 */
export function getLanguagePrefix(lang: Lang): string {
  return lang === "en" ? "/en" : ""
}

/**
 * Builds a localized URL path
 * @param basePath - The base path without language prefix (e.g., "/posts/my-post")
 * @param lang - The target language
 * @returns The full localized path
 */
export function buildLocalizedUrl(basePath: string, lang: Lang): string {
  const prefix = getLanguagePrefix(lang)
  // Ensure basePath starts with /
  const normalizedPath = basePath.startsWith("/") ? basePath : `/${basePath}`
  return `${prefix}${normalizedPath}`
}
