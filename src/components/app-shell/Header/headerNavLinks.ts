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
  {
    href: "/posts/",
    title: "Writing",
    shortCut: "w",
    subLinks: [
      {
        href: "/posts/",
        title: "Posts",
        description: "Technical, daily life, thoughts",
        shortCut: "p",
      },
      {
        href: "/weekly/",
        title: "Weekly",
        description: "Weekly summary",
        shortCut: "k",
      },
      {
        href: "/library/",
        title: "Library",
        description: "Library",
        shortCut: "l",
      },
    ],
  },
  { href: "/gallery/", title: "Gallery", shortCut: "g" },
  { href: "/projects/", title: "Projects", shortCut: "pr" },
]

export default headerNavLinks
