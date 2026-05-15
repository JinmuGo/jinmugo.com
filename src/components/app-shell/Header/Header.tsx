import debounce from "lodash.debounce"
import { Menu } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import CommandPalette from "@/components/search/CommandPalette"
import type { PostMetadata } from "@/types/content"
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
  frontmatter?: PostMetadata
  pathname: string
  containerStyles: ContainerStyles
}
const Header = ({ frontmatter, pathname, containerStyles }: HeaderProps) => {
  const [isSlideOpen, setIsSlideOpen] = useState<boolean>(false)
  const [isEndofContent, setIsEndofContent] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [openPopoverTitle, setOpenPopoverTitle] = useState<string | null>(null)
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

  const suppressNavForReadingChrome = Boolean(frontmatter) && isEndofContent

  useEffect(() => {
    if (isSlideOpen || suppressNavForReadingChrome) {
      setOpenPopoverTitle(null)
    }
  }, [isSlideOpen, suppressNavForReadingChrome])

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
            <nav aria-label="Main navigation" className="hidden items-center gap-x-4 sm:flex">
              {headerNavLinks
                .filter((link) => link.href !== "/")
                .map((link) =>
                  link.subLinks ? (
                    <CustomPopover
                      isEn={isEn}
                      isNavVisible={!isSlideOpen && !suppressNavForReadingChrome}
                      key={link.title}
                      onOpenChange={(nextOpen) => {
                        setOpenPopoverTitle((currentTitle) =>
                          nextOpen ? link.title : currentTitle === link.title ? null : currentTitle,
                        )
                      }}
                      open={openPopoverTitle === link.title}
                      {...link}
                      pathname={pathname}
                    />
                  ) : (
                    <a
                      key={link.title}
                      href={isEn ? `/en${link.href}` : link.href}
                      className="hover:text-primary-500 dark:hover:text-primary-400 m-1 py-2 text-gray-900 dark:text-gray-100 min-h-[44px] flex items-center"
                    >
                      {link.title}
                    </a>
                  ),
                )}
            </nav>
            <SearchButton setOpen={setOpen} />
            <ThemeSwitch />
            {/* Hamburger menu button for mobile */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("toggleMobileMenu"))}
              className="sm:hidden rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label="Open navigation menu"
            >
              <Menu size={24} aria-hidden="true" />
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
