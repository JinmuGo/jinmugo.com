import { useEffect, useState } from "react";

export function PageViewIsland({ slug, apiBaseUrl }: { slug: string; apiBaseUrl: string }) {
  const [count, setCount] = useState<number>(-1);

  useEffect(() => {
    (async () => {
      // 조회수 증가 (body로 slug 전달)
      await fetch(`${apiBaseUrl}/api/view/${slug}`, {
        method: "POST",
      });
      // 조회수 가져오기 (GET은 쿼리스트링 그대로)
      const res = await fetch(`${apiBaseUrl}/api/view/${slug}`);
      const data = await res.json();
      setCount(data?.data?.views ?? -1);
    })();
  }, [slug, apiBaseUrl]);

  return (
    <span className="text-xs text-gray-500 dark:text-gray-400">
      {count === -1 ? "..." : count} views
    </span>
  );
} 