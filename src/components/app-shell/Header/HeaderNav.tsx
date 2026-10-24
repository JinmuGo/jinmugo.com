import { AlignLeft, Image } from "lucide-react"
import { withTrailingSlash } from "@/utils/language"

interface HeaderNavProps {
  pathname: string
  isEn: boolean
}

// 지금 보고 있지 않은 쪽으로 가는 아이콘 하나만 보여준다. 홈은 로고가 맡는다.
const POSTS = { href: "/", title: "Posts", Icon: AlignLeft }
const GALLERY = { href: "/gallery/", title: "Gallery", Icon: Image }

export default function HeaderNav({ pathname, isEn }: HeaderNavProps) {
  const path = withTrailingSlash(isEn ? pathname.replace(/^\/en(?=\/|$)/, "") : pathname)
  const { href, title, Icon } = path.startsWith("/gallery/") ? POSTS : GALLERY

  return (
    <nav aria-label="Main navigation" className="-mr-3 flex items-center">
      <a
        href={isEn ? `/en${href}` : href}
        aria-label={title}
        title={title}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center text-gray-500 transition-colors duration-150 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      </a>
    </nav>
  )
}
