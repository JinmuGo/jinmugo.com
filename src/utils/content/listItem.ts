import type { Post } from "@/types/content"
import type { ListItem } from "@/types/schema"
import { buildItemUrl } from "@/utils/structuredData"

export function postToListItem(post: Post, position: number): ListItem {
  return {
    "@type": "ListItem",
    url: buildItemUrl(post.href),
    position,
    item: {
      "@type": "BlogPosting",
      name: post.data.title,
      url: buildItemUrl(post.href),
      description: post.data.summary,
    },
  }
}
