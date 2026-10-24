export interface HeaderNavLink {
  href: string
  title: string
  /** 현재 경로(언어 접두사 제외)가 이 링크 구역에 속하는지 판단한다. */
  matches: (path: string) => boolean
}

const headerNavLinks: HeaderNavLink[] = [
  { href: "/", title: "Posts", matches: (path) => path === "/" || path.startsWith("/posts/") },
  { href: "/gallery/", title: "Gallery", matches: (path) => path.startsWith("/gallery/") },
]

export default headerNavLinks
