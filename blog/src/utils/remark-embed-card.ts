import { visit } from "unist-util-visit";

/**
 * embed 코드블록을 EmbedCard 컴포넌트로 변환하는 remark 플러그인
 */
export default function remarkEmbedCard() {
  return (tree: any) => {
    visit(tree, "code", (node: any, index: number | undefined, parent: any) => {
      if (node.lang === "embed") {
        // key: "value" 형태 파싱
        const regex = /(\w+):\s*"([^"]*)"/g;
        const result: Record<string, string> = {};
        let match;
        while ((match = regex.exec(node.value)) !== null) {
          const key = match[1] ?? "";
          const value = match[2] ?? "";
          result[key] = value;
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
        };
      }
    });
  };
} 