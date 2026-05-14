export interface HeaderNavLink {
  href: string
  title: string
  description?: string
  subLinks?: HeaderNavLink[]
  shortCut?: string
}

const headerNavLinks: HeaderNavLink[] = [
  { href: "/", title: "Home", shortCut: "h" },
  {
    href: "/about/",
    title: "About",
    shortCut: "a",
    subLinks: [
      {
        href: "/about/",
        title: "About",
        description: "About me",
        shortCut: "a",
      },
      {
        href: "/resume/",
        title: "Resume",
        description: "My resume and career",
        shortCut: "r",
      },
    ],
  },
  { href: "/posts/", title: "Posts", shortCut: "p" },
  { href: "/weekly/", title: "Weekly", shortCut: "w" },
  {
    href: "/library/books/",
    title: "Library",
    shortCut: "l",
    subLinks: [
      {
        href: "/library/books/",
        title: "Books",
        description: "내가 읽은 책",
        shortCut: "b",
      },
    ],
  },
  { href: "/gallery/", title: "Gallery", shortCut: "g" },
  { href: "/projects/", title: "Projects", shortCut: "pr" },
]

export default headerNavLinks
