import Giscus from "@giscus/react"
import { useEffect, useState } from "react"

export function GiscusComments() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // 초기 테마 설정
    const currentTheme = document.documentElement.getAttribute("data-theme")
    setTheme(currentTheme === "dark" ? "dark" : "light")

    // 테마 변경 감지
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
          const newTheme = document.documentElement.getAttribute("data-theme")
          setTheme(newTheme === "dark" ? "dark" : "light")
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <Giscus
      id="comments"
      repo="JinmuGo/blog_obsidian"
      repoId="R_kgDON5UAbw"
      category="Comments"
      categoryId="DIC_kwDON5UAb84CtszT"
      mapping="title"
      strict="0"
      reactionsEnabled="0"
      emitMetadata="0"
      inputPosition="bottom"
      theme={theme}
      lang="en"
    />
  )
}
