import { ChevronDown } from "lucide-react"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { HeaderNavLink } from "./headerNavLinks"

export default function CustomPopover({
  title,
  subLinks,
  isEn,
}: HeaderNavLink & { isEn: boolean; pathname: string }): React.ReactElement {
  const [open, setOpen] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const handleOpen = useCallback(() => {
    clearCloseTimeout()
    setOpen(true)
  }, [clearCloseTimeout])

  const handleCloseWithDelay = useCallback(() => {
    clearCloseTimeout()
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 80)
  }, [clearCloseTimeout])

  useEffect(() => {
    return () => {
      clearCloseTimeout()
    }
  }, [clearCloseTimeout])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex m-1 items-center gap-1 py-2 hover:text-primary-500 dark:hover:text-primary-400 text-gray-900 dark:text-gray-100 cursor-pointer min-h-[44px]"
        onMouseEnter={handleOpen}
        onFocus={handleOpen}
        onMouseLeave={handleCloseWithDelay}
        onBlur={handleCloseWithDelay}
      >
        {title}
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`transition ease-in duration-150 ${open ? "transform rotate-180" : ""}`}
        />
      </PopoverTrigger>
      <PopoverContent
        className="z-100 bg-white rounded-xl dark:bg-black text-sm/6 transition duration-200 ease-in-out [--anchor-gap:1rem] data-[closed]:-translate-y-1 data-[closed]:opacity-0 hover:bg-white dark:hover:bg-black"
        onMouseEnter={handleOpen}
        onMouseLeave={handleCloseWithDelay}
      >
        {subLinks?.map((subLink) => (
          <div key={subLink.title} className="p-1">
            <a
              className="block rounded-lg py-2 px-3 transition hover:bg-black/5 dark:hover:bg-neutral-800 group"
              href={isEn ? `/en${subLink.href}` : subLink.href}
            >
              <p className="font-semibold group-hover:text-primary-500 group-hover:dark:text-primary-400">
                {subLink.title}
              </p>
              <p>{subLink.description}</p>
            </a>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
