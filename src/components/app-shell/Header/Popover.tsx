import { ChevronDown } from "lucide-react"
import type React from "react"
import { type ComponentRef, useCallback, useEffect, useRef } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { HeaderNavLink } from "./headerNavLinks"

interface CustomPopoverProps extends HeaderNavLink {
  isEn: boolean
  isNavVisible: boolean
  onOpenChange: (open: boolean) => void
  open: boolean
  pathname: string
}

export default function CustomPopover({
  title,
  subLinks,
  isEn,
  isNavVisible,
  onOpenChange,
  open,
}: CustomPopoverProps): React.ReactElement {
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const blurDeferRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contentRef = useRef<ComponentRef<typeof PopoverContent>>(null)

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const clearBlurDefer = useCallback(() => {
    if (blurDeferRef.current) {
      clearTimeout(blurDeferRef.current)
      blurDeferRef.current = null
    }
  }, [])

  const handleOpen = useCallback(() => {
    if (!isNavVisible) {
      return
    }
    clearCloseTimeout()
    onOpenChange(true)
  }, [clearCloseTimeout, isNavVisible, onOpenChange])

  const handleCloseWithDelay = useCallback(() => {
    clearCloseTimeout()
    closeTimeoutRef.current = setTimeout(() => {
      onOpenChange(false)
    }, 80)
  }, [clearCloseTimeout, onOpenChange])

  const handleRootOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen && !isNavVisible) {
        return
      }
      onOpenChange(nextOpen)
    },
    [isNavVisible, onOpenChange],
  )

  const handleTriggerBlur = useCallback(
    (event: React.FocusEvent<HTMLButtonElement>) => {
      const related = event.relatedTarget
      if (related instanceof Node && contentRef.current?.contains(related)) {
        return
      }
      clearBlurDefer()
      blurDeferRef.current = setTimeout(() => {
        blurDeferRef.current = null
        const active = document.activeElement
        if (active instanceof Node && contentRef.current?.contains(active)) {
          return
        }
        handleCloseWithDelay()
      }, 0)
    },
    [clearBlurDefer, handleCloseWithDelay],
  )

  useEffect(() => {
    return () => {
      clearCloseTimeout()
      clearBlurDefer()
    }
  }, [clearBlurDefer, clearCloseTimeout])

  useEffect(() => {
    if (isNavVisible || !open) {
      return
    }
    clearCloseTimeout()
    clearBlurDefer()
    onOpenChange(false)
  }, [clearBlurDefer, clearCloseTimeout, isNavVisible, onOpenChange, open])

  useEffect(() => {
    if (!open) {
      return
    }
    const onScroll = () => {
      onOpenChange(false)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [onOpenChange, open])

  return (
    <Popover open={open} onOpenChange={handleRootOpenChange}>
      <PopoverTrigger
        className="flex m-1 items-center gap-1 py-2 hover:text-primary-500 dark:hover:text-primary-400 text-gray-600 dark:text-gray-400 cursor-pointer min-h-[44px]"
        onMouseEnter={handleOpen}
        onFocus={handleOpen}
        onMouseLeave={handleCloseWithDelay}
        onBlur={handleTriggerBlur}
      >
        {title}
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`transition ease-in duration-150 ${open ? "transform rotate-180" : ""}`}
        />
      </PopoverTrigger>
      <PopoverContent
        ref={contentRef}
        sideOffset={0}
        className="z-100 mt-1 bg-white rounded-xl dark:bg-black text-sm/6 transition duration-200 ease-in-out data-[state=closed]:-translate-y-1 data-[state=closed]:opacity-0 hover:bg-white dark:hover:bg-black"
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
