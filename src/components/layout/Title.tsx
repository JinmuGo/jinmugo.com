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
        "text-2xl leading-tight font-semibold tracking-tight text-gray-900 sm:text-3xl dark:text-gray-100",
        className,
      )}
    >
      {children}
    </h1>
  )
}
