import { withTrailingSlash } from "@/utils/language"
import headerNavLinks from "./headerNavLinks"

interface HeaderNavProps {
  pathname: string
  isEn: boolean
}

export default function HeaderNav({ pathname, isEn }: HeaderNavProps) {
  const path = withTrailingSlash(isEn ? pathname.replace(/^\/en(?=\/|$)/, "") : pathname)

  return (
    <nav aria-label="Main navigation" className="-mr-3 flex items-center">
      {headerNavLinks.map(({ href, title, icon: Icon, matches }) => {
        const isActive = matches(path)
        return (
          <a
            key={title}
            href={isEn ? `/en${href}` : href}
            aria-label={title}
            title={title}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center transition-colors duration-150 ${
              isActive
                ? "text-gray-900 dark:text-gray-50"
                : "text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </a>
        )
      })}
    </nav>
  )
}
