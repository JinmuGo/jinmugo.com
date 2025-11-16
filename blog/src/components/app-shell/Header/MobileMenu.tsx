import { useEffect, useState } from "react"
import headerNavLinks from "./headerNavLinks"

interface MobileMenuProps {
  pathname: string
}

const ChevronDownIcon = ({ className }: { className: string }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="아래 화살표 아이콘"
  >
    <title>아래 화살표 아이콘</title>
    <path
      d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
)

const MobileMenu = ({ pathname }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const isEn = pathname.includes("/en")

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen((prev) => !prev)
    }

    window.addEventListener("toggleMobileMenu", handleToggle)

    return () => {
      window.removeEventListener("toggleMobileMenu", handleToggle)
    }
  }, [])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(title)) {
        newSet.delete(title)
      } else {
        newSet.add(title)
      }
      return newSet
    })
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  // Check if current path matches link
  const isCurrentPage = (href: string) => {
    const linkPath = isEn ? `/en${href}` : href
    return pathname === linkPath
  }

  return (
    <>
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={-1}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] sm:hidden transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeMenu}
        onKeyDown={(e) => e.key === "Escape" && closeMenu()}
        aria-label="Close menu"
      />

      {/* Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-950
          border-l border-gray-200 dark:border-gray-800
          shadow-2xl z-[110]
          transform transition-all duration-300 ease-out
          sm:hidden
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Close Button */}
          <div className="flex justify-end p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={closeMenu}
              className="p-2 rounded-lg
                hover:bg-black/5 dark:hover:bg-neutral-800
                active:scale-95
                transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              aria-label="Close menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Close icon"
              >
                <title>Close icon</title>
                <path
                  d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 pb-4">
            {headerNavLinks
              .filter((link) => link.href !== "/")
              .map((link) => {
                const isCurrent = !link.subLinks && isCurrentPage(link.href)

                return (
                  <div key={link.title} className="mb-2">
                    {link.subLinks ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(link.title)}
                          aria-expanded={expandedItems.has(link.title)}
                          aria-controls={`submenu-${link.title}`}
                          className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg
                            text-base font-medium
                            hover:bg-black/5 dark:hover:bg-neutral-800
                            text-gray-900 dark:text-gray-100
                            transition-all duration-150
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        >
                          <span>{link.title}</span>
                          <ChevronDownIcon
                            className={`transition-transform duration-150 ${expandedItems.has(link.title) ? "rotate-180" : ""}`}
                          />
                        </button>
                        {expandedItems.has(link.title) && (
                          <section
                            id={`submenu-${link.title}`}
                            aria-label={`${link.title} submenu`}
                            className="ml-4 mt-1 space-y-1 animate-in slide-in-from-top-2 fade-in-0 duration-200"
                          >
                            {link.subLinks.map((subLink) => {
                              const isSubCurrent = isCurrentPage(subLink.href)

                              return (
                                <a
                                  key={subLink.title}
                                  href={isEn ? `/en${subLink.href}` : subLink.href}
                                  className={`group block py-2.5 px-3 rounded-lg
                                    transition-all duration-150
                                    ${
                                      isSubCurrent
                                        ? "bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400"
                                        : "hover:bg-black/5 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300"
                                    }`}
                                  onClick={closeMenu}
                                >
                                  <p
                                    className={`font-semibold text-sm ${
                                      isSubCurrent
                                        ? ""
                                        : "group-hover:text-primary-500 dark:group-hover:text-primary-400"
                                    }`}
                                  >
                                    {subLink.title}
                                  </p>
                                  {subLink.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      {subLink.description}
                                    </p>
                                  )}
                                </a>
                              )
                            })}
                          </section>
                        )}
                      </div>
                    ) : (
                      <a
                        href={isEn ? `/en${link.href}` : link.href}
                        className={`block py-2.5 px-3 rounded-lg
                          font-medium
                          transition-all duration-150
                          active:scale-[0.98]
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                          ${
                            isCurrent
                              ? "bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 font-semibold"
                              : "hover:bg-black/5 dark:hover:bg-neutral-800 text-gray-900 dark:text-gray-100 hover:text-primary-500 dark:hover:text-primary-400"
                          }`}
                        onClick={closeMenu}
                      >
                        {link.title}
                      </a>
                    )}
                  </div>
                )
              })}
          </nav>
        </div>
      </div>
    </>
  )
}

export default MobileMenu
