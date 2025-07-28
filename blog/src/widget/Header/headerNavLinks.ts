export interface HeaderNavLink {
  href: string
  title: string
  description?: string
  subLinks?: HeaderNavLink[]
  shortCut?: string
}

const headerNavLinks: HeaderNavLink[] = [
  { href: "/", title: "Home", shortCut: "h" },
  { href: "/about", title: "About", shortCut: "a" },
  {
    href: "/blog",
    title: "Blog",
    shortCut: "b",
    subLinks: [
      {
        href: "/archives",
        title: "Archives",
        description: "Archive all my posts",
        shortCut: "ar",
      },
      {
        href: "/memos",
        title: "Memos",
        description: "Notes and thoughts shortly",
        shortCut: "m",
      },
      {
        href: "/posts",
        title: "Posts",
        description: "Posts about Thing's of my life",
        shortCut: "p",
      },
      {
        href: "/series",
        title: "Series",
        description: "Blog post series collections",
        shortCut: "s",
      },
    ],
  },
  { href: "/gallery", title: "Gallery", shortCut: "g" },
  { href: "/projects", title: "Projects", shortCut: "pr" },
]

export default headerNavLinks
