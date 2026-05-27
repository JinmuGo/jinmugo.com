import type { Post, Weekly } from "@/types/content"
import type { ListItem } from "@/types/schema"

export type TimelineEntry = Post | Weekly

export function mergeTimelineEntries(posts: Post[], weeklies: Weekly[]): TimelineEntry[] {
  return [...posts, ...weeklies].sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  )
}

export function timelineEntryToListItem(entry: TimelineEntry, position: number): ListItem {
  return {
    "@type": "ListItem",
    url: entry.href,
    position,
    item: {
      "@type": entry.type === "weekly" ? "Article" : "BlogPosting",
      name: entry.data.title,
      url: entry.href,
      description: entry.data.summary,
    },
  }
}
