import debounce from "lodash.debounce"
import { useCallback, useEffect, useState } from "react"
import CommandPalette from "@/components/search/CommandPalette"
import type { MemoMetadata, PostMetadata } from "@/types/content"
import HeaderSlider from "./HeaderSlider"
import headerNavLinks from "./headerNavLinks"
import Logo from "./Logo"
import CustomPopover from "./Popover"
import SearchButton from "./SearchButton"
import ThemeSwitch from "./ThemeSwitch"

const BASE_LINE = 50

interface ContainerStyles {
  header: string
  headerButton: string
}

interface HeaderProps {
  frontmatter?: PostMetadata | MemoMetadata
  pathname: string
  containerStyles: ContainerStyles
}
const Header = ({ frontmatter, pathname, containerStyles }: HeaderProps) => {
  const [isSlideOpen, setIsSlideOpen] = useState<boolean>(false)
  const [isEndofContent, setIsEndofContent] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const handleScroll = useCallback(() => {
    const target = document.querySelector("#post-title, #memo-title")
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
          <a href={isEn ? "/en" : "/"}>
            <div className="flex items-center justify-between">
              <div className="mr-3">
                <Logo />
              </div>
            </div>
          </a>
          <div className="flex items-center space-x-4 leading-5 sm:-mr-6 sm:space-x-6">
            <div className="no-scrollbar hidden max-w-40 items-center gap-x-4 overflow-x-auto sm:flex md:max-w-72 lg:max-w-96">
              {headerNavLinks
                .filter((link) => link.href !== "/")
                .map((link) =>
                  link.subLinks ? (
                    <CustomPopover isEn={isEn} key={link.title} {...link} pathname={pathname} />
                  ) : (
                    <a
                      key={link.title}
                      href={isEn ? `/en${link.href}` : link.href}
                      className="hover:text-primary-500 dark:hover:text-primary-400 m-1 text-gray-900 dark:text-gray-100"
                    >
                      {link.title}
                    </a>
                  ),
                )}
            </div>
            <SearchButton setOpen={setOpen} />
            <ThemeSwitch />
            {/* Hamburger menu button for mobile */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("toggleMobileMenu"))}
              className="sm:hidden rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Open navigation menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Menu icon"
              >
                <title>Menu icon</title>
                <path
                  d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </button>
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
