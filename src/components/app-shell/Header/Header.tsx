import debounce from "lodash.debounce"
import { useCallback, useEffect, useState } from "react"
import type { PostMetadata, WeeklyMetadata } from "@/types/content"
import HeaderNav from "./HeaderNav"
import HeaderSlider from "./HeaderSlider"
import Logo from "./Logo"

const BASE_LINE = 50

interface ContainerStyles {
  header: string
  headerButton: string
}

interface HeaderProps {
  frontmatter?: PostMetadata | WeeklyMetadata
  pathname: string
  containerStyles: ContainerStyles
}
const Header = ({ frontmatter, pathname, containerStyles }: HeaderProps) => {
  const [isSlideOpen, setIsSlideOpen] = useState<boolean>(false)
  const [isEndofContent, setIsEndofContent] = useState<boolean>(false)
  const handleScroll = useCallback(() => {
    const target = document.querySelector("#post-title, #memo-title, #weekly-title")
    const rect = target?.getBoundingClientRect()
    if (!rect) {
      return
    }

    const slideOpen = rect.top < BASE_LINE

    setIsSlideOpen(slideOpen)
  }, [])

  const handleLastScroll = useCallback(() => {
    const target = document.querySelector("#footer")
    const rect = target?.getBoundingClientRect()
    if (!rect) {
      return
    }

    const slideOpen = rect.top < window.innerHeight && rect.bottom > 0

    setIsEndofContent(slideOpen)
  }, [])

  const debouncedHandleScroll = debounce(handleScroll, 100)
  const debouncedHandleLastScroll = debounce(handleLastScroll, 100)

  useEffect(() => {
    window.addEventListener("scroll", debouncedHandleScroll)
    debouncedHandleScroll() // 초기 상태 확인

    window.addEventListener("scroll", debouncedHandleLastScroll)
    debouncedHandleLastScroll() // 초기 상태 확인

    return () => {
      window.removeEventListener("scroll", debouncedHandleScroll)
      window.removeEventListener("scroll", debouncedHandleLastScroll)
    }
  }, [debouncedHandleScroll, debouncedHandleLastScroll])

  const isEn = pathname.includes("/en")

  return (
    <header className="w-full py-5 backdrop-blur-sm backdrop-saturate-180 sticky top-0 z-50">
      <div className="relative">
        <section
          className={`${isSlideOpen ? "-translate-y-[200%]" : "translate-y-0 "} duration-300 transition-all mx-auto flex items-center justify-between ${containerStyles.header}`}
        >
          <a href={isEn ? "/en" : "/"} className="flex min-h-[44px] items-center">
            <Logo />
          </a>
          <HeaderNav pathname={pathname} isEn={isEn} />
        </section>
        {frontmatter && (
          <HeaderSlider
            isEndofContent={isEndofContent}
            isSlideOpen={isSlideOpen}
            postMetadata={frontmatter}
            pathname={pathname}
            containerStyles={containerStyles}
          />
        )}
      </div>
    </header>
  )
}

export default Header
