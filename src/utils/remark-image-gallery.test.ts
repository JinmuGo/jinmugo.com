import { describe, expect, it } from "vitest"
import remarkImageGallery from "./remark-image-gallery"

type MdxJsxFlowElement = {
  type: "mdxJsxFlowElement"
  name: string
  attributes: Array<{ name: string; value: string }>
  children: unknown[]
}

function runPlugin(markdown: string) {
  const tree = {
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

  return tree.children[0] as MdxJsxFlowElement
}

describe("remarkImageGallery", () => {
  it("converts gallery code block to ImageGrid with parsed images", () => {
    const node = runPlugin(`title: "운동 기록"
![[a.webp]]
![](./b.webp)`)

    expect(node.type).toBe("mdxJsxFlowElement")
    expect(node.name).toBe("ImageGrid")
    expect(node.children).toEqual([])

    const imagesAttr = node.attributes.find((attr) => attr.name === "images")
    expect(JSON.parse(imagesAttr?.value ?? "[]")).toEqual(["./a.webp", "./b.webp"])

    const titleAttr = node.attributes.find((attr) => attr.name === "title")
    expect(titleAttr?.value).toBe("운동 기록")
  })

  it("ignores non-gallery code blocks", () => {
    const tree = {
      type: "root",
      children: [{ type: "code", lang: "text", value: "hello" }],
    }

    remarkImageGallery()(tree)

    expect(tree.children[0]).toMatchObject({ type: "code", lang: "text" })
  })
})
