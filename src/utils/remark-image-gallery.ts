import type { Root } from "mdast"
import type { MdxJsxAttribute, MdxJsxFlowElement } from "mdast-util-mdx-jsx"
import { visit } from "unist-util-visit"

type GalleryParseResult = {
  title?: string
  images: string[]
}

function normalizeImageSrc(src: string): string {
  const trimmed = src.trim()
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed
  }
  return trimmed.startsWith("./") ? trimmed : `./${trimmed}`
}

function parseGalleryContent(value: string): GalleryParseResult {
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  let title: string | undefined
  const images: string[] = []

  for (const line of lines) {
    const titleMatch = line.match(/^title:\s*"([^"]*)"$/)
    if (titleMatch) {
      title = titleMatch[1]
      continue
    }

    const wikiMatch = line.match(/!\[\[([^\]]+)\]\]/)
    if (wikiMatch) {
      images.push(normalizeImageSrc(wikiMatch[1] ?? ""))
      continue
    }

    const mdMatch = line.match(/!\[[^\]]*\]\(([^)]+)\)/)
    if (mdMatch) {
      images.push(normalizeImageSrc(mdMatch[1] ?? ""))
      continue
    }

    if (/\.(webp|jpg|jpeg|png|gif)$/i.test(line)) {
      images.push(normalizeImageSrc(line))
    }
  }

  return { title, images }
}

/**
 * gallery 코드블록을 ImageGrid MDX 컴포넌트로 변환하는 remark 플러그인
 */
export default function remarkImageGallery() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "gallery" || index === undefined || !parent) {
        return
      }

      const { title, images } = parseGalleryContent(node.value)
      const attributes: MdxJsxAttribute[] = [
        {
          type: "mdxJsxAttribute",
          name: "images",
          value: JSON.stringify(images),
        },
      ]

      if (title) {
        attributes.push({
          type: "mdxJsxAttribute",
          name: "title",
          value: title,
        })
      }

      const imageGrid: MdxJsxFlowElement = {
        type: "mdxJsxFlowElement",
        name: "ImageGrid",
        attributes,
        children: [],
      }
      parent.children[index] = imageGrid
    })
  }
}
