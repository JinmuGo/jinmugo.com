import debounce from "lodash.debounce"
import { useCallback, useEffect, useState } from "react"
import CommandPalette from "@/components/search/CommandPalette"
import type { PostMetadata, WeeklyMetadata } from "@/types/content"
import HeaderSlider from "./HeaderSlider"
import headerNavLinks from "./headerNavLinks"
import Logo from "./Logo"
import SearchButton from "./SearchButton"
import ThemeSwitch from "./ThemeSwitch"

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
  const [open, setOpen] = useState<boolean>(false)
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
  const lang = isEn ? "en" : "ko"

  return (
    <header className="w-full py-5 backdrop-blur-sm backdrop-saturate-180 sticky top-0 z-50">
      <div className="relative">
        <section
          className={`${isSlideOpen ? "-translate-y-[200%]" : "translate-y-0 "} duration-300 transition-all mx-auto flex items-center justify-between ${containerStyles.header}`}
        >
          <a href={isEn ? "/en" : "/"} className="flex min-h-[44px] items-center">
            <Logo />
          </a>
          <div className="flex items-center space-x-2 leading-5 -mr-3 text-sm">
            <nav aria-label="Main navigation" className="flex items-center gap-x-1">
              {headerNavLinks.map((link) => (
                <a
                  key={link.title}
                  href={isEn ? `/en${link.href}` : link.href}
                  className="hover:text-primary-500 dark:hover:text-primary-400 px-2 py-2 text-gray-600 dark:text-gray-400 min-h-[44px] flex items-center"
                >
                  {link.title}
                </a>
              ))}
            </nav>
            <SearchButton setOpen={setOpen} />
            <ThemeSwitch />
          </div>
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
      <CommandPalette lang={lang} open={open} setOpen={setOpen} />
    </header>
  )
}

export default Header
