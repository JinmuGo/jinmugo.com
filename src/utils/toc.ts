import type { MarkdownHeading } from "astro"

/** h2만 목차 레일에 올린다. 헤딩 앞에 붙는 `#` 앵커 글자는 뺀다. */
export function tocItems(headings: MarkdownHeading[]): { href: string; text: string }[] {
  return headings
    .filter((heading) => heading.depth === 2)
    .map((heading) => ({ href: `#${heading.slug}`, text: heading.text.replace(/^#\s*/, "") }))
}
