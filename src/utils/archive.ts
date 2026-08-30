import type { Post, Weekly } from "@/types/content"
import { normalizeArchiveSegment } from "@/utils/archive-segment.js"
import { withTrailingSlash } from "@/utils/language"

export const ARCHIVE_CLASSIFICATIONS = ["category", "tag", "year"] as const

export type ArchiveClassification = (typeof ARCHIVE_CLASSIFICATIONS)[number]
export type ArchiveContent = Post | Weekly
export type ArchivePrefix = "" | "/en"

export interface ArchiveEntry {
  label: string
  segment: string
  count: number
}

export interface ArchivePageProps {
  classify: ArchiveClassification
  label: string
  redirectTo?: string
}

function getLabels(item: ArchiveContent, classify: ArchiveClassification): string[] {
  if (classify === "category") {
    return "category" in item.data && item.data.category ? [item.data.category] : []
  }
  if (classify === "tag") {
    return item.data.tags ?? []
  }
  return [new Date(item.data.date).getFullYear().toString()]
}

export function createArchiveEntries(labels: Iterable<string>): ArchiveEntry[] {
  const counts = new Map<string, number>()
  for (const label of labels) {
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  const segments = new Map<string, string>()
  return [...counts].map(([label, count]) => {
    const segment = normalizeArchiveSegment(label)
    const existing = segments.get(segment)
    if (existing && existing !== label) {
      throw new Error(
        `Archive segment collision: ${JSON.stringify(existing)} and ${JSON.stringify(label)} both normalize to ${JSON.stringify(segment)}`,
      )
    }
    segments.set(segment, label)
    return { label, segment, count }
  })
}

export function getArchiveEntries(
  content: ArchiveContent[],
  classify: ArchiveClassification,
): ArchiveEntry[] {
  return createArchiveEntries(content.flatMap((item) => getLabels(item, classify)))
}

export function getArchiveContent(
  content: ArchiveContent[],
  classify: ArchiveClassification,
  label: string,
): ArchiveContent[] {
  return content.filter((item) => getLabels(item, classify).includes(label))
}

export function isArchiveIndexable(classify: ArchiveClassification, count: number): boolean {
  return classify !== "tag" || count > 1
}

export function getArchivePath(
  prefix: ArchivePrefix,
  classify: ArchiveClassification,
  label: string,
): string {
  return withTrailingSlash(`${prefix}/archives/${classify}/${normalizeArchiveSegment(label)}`)
}

export function getArchiveStaticPaths(content: ArchiveContent[], prefix: ArchivePrefix) {
  return ARCHIVE_CLASSIFICATIONS.flatMap((classify) =>
    getArchiveEntries(content, classify).flatMap(({ label, segment }) => {
      const props: ArchivePageProps = { classify, label }
      const canonical = { params: { classify, target: segment }, props }

      if (segment === label) {
        return [canonical]
      }

      // Keep the canonical page when legacy and normalized casing share a local filesystem path.
      return [
        {
          params: { classify, target: label },
          props: { ...props, redirectTo: getArchivePath(prefix, classify, label) },
        },
        canonical,
      ]
    }),
  )
}
