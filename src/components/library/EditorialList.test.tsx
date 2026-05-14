// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import EditorialList, { type EditorialListItem } from "./EditorialList"

const item = (over: Partial<EditorialListItem> = {}): EditorialListItem => ({
  id: "id1",
  num: "001",
  href: "/library/books/sapiens/",
  hasEssay: true,
  cover: undefined,
  coverAspectRatio: "2/3",
  title: "사피엔스",
  subtitle: "유발 하라리 · 2011",
  oneLiner: "한 줄.",
  rating: 5,
  rightMeta: "2026.03",
  expandFields: [],
  quote: undefined,
  tags: [],
  ...over,
})

describe("EditorialList", () => {
  it("renders rows", () => {
    render(<EditorialList items={[item({ id: "a" }), item({ id: "b", num: "002" })]} />)
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
  })

  it("rows with essay are links to href", () => {
    render(<EditorialList items={[item({ hasEssay: true, href: "/x/" })]} />)
    const link = screen.getByRole("link")
    expect(link.getAttribute("href")).toBe("/x/")
  })

  it("rows without essay toggle expand on click", () => {
    render(
      <EditorialList
        items={[
          item({
            id: "lightweight",
            hasEssay: false,
            expandFields: [{ label: "READ", value: "2026.01" }],
            quote: "인용 문장.",
            tags: ["essay"],
          }),
        ]}
      />,
    )
    const row = screen.getByRole("button")
    expect(screen.queryByText("인용 문장.")).toBeNull()
    fireEvent.click(row)
    expect(screen.getByText("인용 문장.")).toBeInTheDocument()
    fireEvent.click(row)
    expect(screen.queryByText("인용 문장.")).toBeNull()
  })

  it("expanding one row collapses the previously expanded row", () => {
    render(
      <EditorialList
        items={[
          item({ id: "a", hasEssay: false, quote: "A quote." }),
          item({ id: "b", hasEssay: false, quote: "B quote." }),
        ]}
      />,
    )
    const rows = screen.getAllByRole("button")
    fireEvent.click(rows[0])
    expect(screen.getByText("A quote.")).toBeInTheDocument()
    fireEvent.click(rows[1])
    expect(screen.queryByText("A quote.")).toBeNull()
    expect(screen.getByText("B quote.")).toBeInTheDocument()
  })
})
