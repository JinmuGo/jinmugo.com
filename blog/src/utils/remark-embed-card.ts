import type { Code } from "mdast"
import type { Node, Parent } from "unist"
import { visit } from "unist-util-visit"

/**
 * embed 코드블록을 EmbedCard 컴포넌트로 변환하는 remark 플러그인
 */
export default function remarkEmbedCard() {
  return (tree: Node) => {
    visit(tree, "code", (node: Code, index: number | undefined, parent: Parent) => {
      if (node.lang === "embed") {
        // key: "value" 형태 파싱
        const regex = /(\w+):\s*"([^"]*)"/g
        const result: Record<string, string> = {}
        // biome-ignore lint/suspicious/noImplicitAnyLet: regex.exec의 반환 타입이 명확함
        let match
        // biome-ignore lint/suspicious/noAssignInExpressions: while 루프에서 일반적인 패턴
        while ((match = regex.exec(node.value)) !== null) {
          const key = match[1] ?? ""
          const value = match[2] ?? ""
          result[key] = value
        }
        // EmbedCard JSX 노드로 변환
        parent.children[index ?? 0] = {
          type: "mdxJsxFlowElement",
          name: "EmbedCard",
          attributes: Object.entries(result).map(([key, value]) => ({
            type: "mdxJsxAttribute",
            name: key,
            value,
          })),
          children: [],
        }
      }
    })
  }
}
