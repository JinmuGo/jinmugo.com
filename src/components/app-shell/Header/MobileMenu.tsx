import { ChevronDown, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import headerNavLinks from "./headerNavLinks"

interface MobileMenuProps {
  pathname: string
}

const MobileMenu = ({ pathname }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const menuPanelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

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

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen) {
      return
    }

    // Focus the close button when menu opens
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
        return
      }

      if (e.key !== "Tab") {
        return
      }

      const menuPanel = menuPanelRef.current
      if (!menuPanel) {
        return
      }

      const focusableElements = menuPanel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      if (focusableElements.length === 0) {
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Shift+Tab on first element -> go to last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
      // Tab on last element -> go to first
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

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
      <button
        type="button"
        tabIndex={-1}
        disabled={!isOpen}
        aria-hidden={!isOpen}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[var(--z-mobile-backdrop)] sm:hidden transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeMenu}
        onKeyDown={(e) => e.key === "Escape" && closeMenu()}
        aria-label="Close menu"
      />

      {/* Menu Panel */}
      <div
        ref={menuPanelRef}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        inert={!isOpen}
        aria-label="Navigation menu"
        className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-950
          border-l border-gray-200 dark:border-gray-800
          shadow-2xl z-[var(--z-mobile-menu)]
          transform transition-all duration-300 ease-out
          sm:hidden
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Close Button */}
          <div className="flex justify-end p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeMenu}
              className="p-2 rounded-lg
                hover:bg-black/5 dark:hover:bg-neutral-800
                active:scale-95
                transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              aria-label="Close menu"
            >
              <X size={20} aria-hidden="true" />
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
                          <ChevronDown
                            size={15}
                            aria-hidden="true"
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
