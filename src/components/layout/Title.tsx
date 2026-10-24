import type React from "react"
import { cn } from "@/utils/cn"

export default function Title({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h1
      className={cn(
        "text-2xl leading-9 font-semibold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-4xl md:leading-14 dark:text-gray-100",
        className,
      )}
    >
      {children}
    </h1>
  )
}
