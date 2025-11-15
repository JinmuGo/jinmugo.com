import type React from "react"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { HeaderNavLink } from "./headerNavLinks"

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

export default function CustomPopover({
  title,
  subLinks,
  isEn,
}: HeaderNavLink & { isEn: boolean; pathname: string }): React.ReactElement {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex  m-1 items-center gap-1 hover:text-primary-500 dark:hover:text-primary-400 text-gray-900 dark:text-gray-100 cursor-pointer">
        {title}
        <ChevronDownIcon
          className={`transition ease-in duration-150 ${open ? "transform rotate-180" : ""}`}
        />
      </PopoverTrigger>
      <PopoverContent className="z-100 bg-white rounded-xl dark:bg-black text-sm/6 transition duration-200 ease-in-out [--anchor-gap:1rem] data-[closed]:-translate-y-1 data-[closed]:opacity-0 hover:bg-white dark:hover:bg-black">
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
