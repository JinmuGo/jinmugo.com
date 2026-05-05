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

export function withTrailingSlash(url: string): string {
  const suffixIndex = url.search(/[?#]/)
  const pathname = suffixIndex === -1 ? url : url.slice(0, suffixIndex)
  const suffix = suffixIndex === -1 ? "" : url.slice(suffixIndex)

  if (!pathname) {
    return `/${suffix}`
  }

  return pathname.endsWith("/") ? `${pathname}${suffix}` : `${pathname}/${suffix}`
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
  return withTrailingSlash(`${prefix}${normalizedPath}`)
}
