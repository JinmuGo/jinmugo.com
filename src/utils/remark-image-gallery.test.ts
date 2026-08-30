import type { Root } from "mdast"
import type { MdxJsxFlowElement } from "mdast-util-mdx-jsx"
import { describe, expect, it } from "vitest"
import remarkImageGallery from "./remark-image-gallery"

function runPlugin(markdown: string) {
  const tree: Root = {
    type: "root",
    children: [
      {
        type: "code",
        lang: "gallery",
        value: markdown,
      },
    ],
  }

  remarkImageGallery()(tree)

  const node = tree.children[0]
  if (node?.type !== "mdxJsxFlowElement") {
    throw new Error("Expected ImageGrid node")
  }
  return node satisfies MdxJsxFlowElement
}

describe("remarkImageGallery", () => {
  it("converts gallery code block to ImageGrid with parsed images", () => {
    const node = runPlugin(`title: "운동 기록"
![[a.webp]]
![](./b.webp)`)

    expect(node.type).toBe("mdxJsxFlowElement")
    expect(node.name).toBe("ImageGrid")
    expect(node.children).toEqual([])

    const imagesAttr = node.attributes.find(
      (attr) => attr.type === "mdxJsxAttribute" && attr.name === "images",
    )
    expect(typeof imagesAttr?.value === "string" ? JSON.parse(imagesAttr.value) : []).toEqual([
      "./a.webp",
      "./b.webp",
    ])

    const titleAttr = node.attributes.find(
      (attr) => attr.type === "mdxJsxAttribute" && attr.name === "title",
    )
    expect(titleAttr?.value).toBe("운동 기록")
  })

  it("ignores non-gallery code blocks", () => {
    const tree: Root = {
      type: "root",
      children: [{ type: "code", lang: "text", value: "hello" }],
    }

    remarkImageGallery()(tree)

    expect(tree.children[0]).toMatchObject({ type: "code", lang: "text" })
  })
})
