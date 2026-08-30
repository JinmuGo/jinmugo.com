// @vitest-environment jsdom

import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import MobileMenu from "./MobileMenu"

describe("MobileMenu", () => {
  it("keeps its transition DOM inert and hidden from accessibility APIs while closed", () => {
    const { container } = render(<MobileMenu pathname="/" />)
    const panel = container.querySelector('[aria-label="Navigation menu"]')

    expect(panel).toHaveClass("translate-x-full")
    expect(panel).toHaveAttribute("aria-hidden", "true")
    expect(panel).toHaveAttribute("inert")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()

    act(() => window.dispatchEvent(new Event("toggleMobileMenu")))

    const dialog = screen.getByRole("dialog", { name: "Navigation menu" })
    expect(dialog).toHaveClass("translate-x-0")
    expect(dialog).not.toHaveAttribute("aria-hidden", "true")
    expect(dialog).not.toHaveAttribute("inert")

    fireEvent.click(within(dialog).getByRole("button", { name: "Close menu" }))

    expect(panel).toHaveClass("translate-x-full")
    expect(panel).toHaveAttribute("aria-hidden", "true")
    expect(panel).toHaveAttribute("inert")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})
