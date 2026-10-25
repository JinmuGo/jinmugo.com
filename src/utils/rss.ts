import type MarkdownIt from "markdown-it"
import sanitizeHtml from "sanitize-html"

function isInvalidXmlChar(code: number): boolean {
  return (
    (code >= 0x00 && code <= 0x08) ||
    code === 0x0b ||
    code === 0x0c ||
    (code >= 0x0e && code <= 0x1f)
  )
}

export function sanitizeForRss(text: string | undefined | null): string {
  if (!text) {
    return ""
  }
  return Array.from(text)
    .filter((char) => !isInvalidXmlChar(char.charCodeAt(0)))
    .join("")
}

// 본문 없이 사진만 있는 글은 body가 비어 있다.
export function renderRssContent(body: string | undefined, parser: MarkdownIt): string {
  return sanitizeForRss(sanitizeHtml(parser.render(body ?? "")))
}
