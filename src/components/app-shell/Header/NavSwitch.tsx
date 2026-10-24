import type React from "react"
import { useState } from "react"
import { withTrailingSlash } from "@/utils/language"
import headerNavLinks from "./headerNavLinks"

// 표시기가 옆 칸으로 미끄러진 뒤 이동하도록 이 시간만큼 이동을 늦춘다.
const SLIDE_MS = 180

interface NavSwitchProps {
  pathname: string
  isEn: boolean
}

export default function NavSwitch({ pathname, isEn }: NavSwitchProps) {
  const path = withTrailingSlash(isEn ? pathname.replace(/^\/en(?=\/|$)/, "") : pathname)
  const [activeIndex, setActiveIndex] = useState(() =>
    headerNavLinks.findIndex((link) => link.matches(path)),
  )

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    const isPlainClick =
      event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!isPlainClick || reduceMotion || index === activeIndex) {
      return
    }
    event.preventDefault()
    setActiveIndex(index)
    const href = event.currentTarget.href
    window.setTimeout(() => window.location.assign(href), SLIDE_MS)
  }

  return (
    <nav
      aria-label="Main navigation"
      className="relative grid grid-cols-2 rounded-full bg-gray-100 p-1 text-sm dark:bg-gray-800/70"
    >
      {activeIndex >= 0 && (
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none dark:bg-gray-700"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
      )}
      {headerNavLinks.map((link, index) => {
        const isActive = index === activeIndex
        return (
          <a
            key={link.title}
            href={isEn ? `/en${link.href}` : link.href}
            aria-current={isActive ? "page" : undefined}
            onClick={(event) => handleClick(event, index)}
            className={`relative flex min-h-9 items-center justify-center rounded-full px-4 transition-colors duration-200 after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] ${
              isActive
                ? "font-medium text-gray-900 dark:text-gray-50"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            {link.title}
          </a>
        )
      })}
    </nav>
  )
}
