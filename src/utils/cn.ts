import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and twMerge for proper Tailwind merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Tagged template literal for Tailwind CSS classes
 * Useful for defining class strings in a template literal format
 */
export const tw = (strings: TemplateStringsArray, ...args: unknown[]) =>
  strings.reduce((acc, str, i) => acc + str + (args.at(i) ?? ""), "")

/**
 * Count items by a key function
 * Returns a record of key -> count
 */
export function countBy<T>(
  items: T[],
  keyFn: (item: T) => string | string[],
): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const keys = ([] as string[]).concat(keyFn(item))
    keys.forEach((key) => {
      if (!acc[key]) {
        acc[key] = 0
      }
      acc[key]++
    })
    return acc
  }, {})
}
