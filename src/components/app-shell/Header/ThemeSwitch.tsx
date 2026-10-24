import type { Theme } from "astro-themes"
import { Moon, Sun } from "lucide-react"
import type React from "react"
import { useCallback, useEffect } from "react"
import { toggleTheme, updateTheme } from "@/scripts/theme.js"

const ThemeSwitch: React.FC = () => {
  const getButtonLabel = useCallback((preference: Theme | null): string => {
    switch (preference) {
      case null:
        return "automatic/system"
      case "dark":
      case "light":
        return preference
      default:
        preference satisfies never // Ensure exhaustive check
        throw new Error(`Unexpected theme preference: ${preference}`)
    }
  }, [])

  // If the system color scheme changes (while this page is loaded), switch
  // back to the system color scheme (i.e. unset the current theme preference
  // and remove it from local storage).
  useEffect(() => {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      updateTheme("system")
    })
  }, [])

  // react to user selecting different theme option
  useEffect(() => {
    const element = document.getElementById("theme-switcher")
    if (element == null || !(element instanceof HTMLButtonElement)) {
      throw new Error("Theme switcher button not found")
    }
    const button: HTMLButtonElement = element
    button.addEventListener("click", toggleTheme)
    document.addEventListener("set-theme", ({ detail }) => {
      button.setAttribute("aria-label", getButtonLabel(detail))
    })
  }, [getButtonLabel])

  return (
    <div className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 flex items-center justify-center">
      <button
        id="theme-switcher"
        data-testid="theme-switcher"
        title="Toggles light/dark theme"
        aria-label="automatic/system"
        aria-live="polite"
        type="button"
        className="flex items-center justify-center min-w-[44px] min-h-[44px]"
      >
        <Sun className="light h-5 w-5" aria-hidden="true" />
        <Moon className="dark h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )
}

export default ThemeSwitch
