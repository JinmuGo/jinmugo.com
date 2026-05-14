import { useMemo, useState } from "react"
import EditorialList, { type EditorialListItem } from "./EditorialList"
import FilterChips from "./FilterChips"

interface BookData {
  id: string
  href: string
  hasEssay: boolean
  cover?: string
  title: string
  authorName: string
  year: number
  oneLiner?: string
  rating?: number
  dateReadDisplay: string
  dateReadYear?: number
  status: "read" | "reading" | "want"
  publisher?: string
  pages?: number
  language?: string
  quote?: string
  tags: string[]
}

interface Props {
  books: BookData[]
  essayCount: number
}

type StatusValue = "read" | "reading" | "want" | null
type RatingValue = number | null

const STATUS_OPTIONS: { label: string; value: StatusValue }[] = [
  { label: "전체", value: null },
  { label: "읽음", value: "read" },
  { label: "읽는 중", value: "reading" },
  { label: "읽고 싶음", value: "want" },
]

const RATING_OPTIONS: { label: string; value: RatingValue }[] = [
  { label: "전체", value: null },
  { label: "★★★★+", value: 4 },
  { label: "★★★★★", value: 5 },
]

function toListItem(book: BookData, index: number): EditorialListItem {
  const expandFields = [
    book.dateReadDisplay !== "—" && {
      label: "READ",
      value: book.dateReadDisplay,
    },
    book.publisher && {
      label: "PUBLISHER",
      value: book.pages ? `${book.publisher} · ${book.pages}p` : book.publisher,
    },
    book.status && {
      label: "STATUS",
      value: book.status === "read" ? "읽음" : book.status === "reading" ? "읽는 중" : "읽고 싶음",
    },
    book.language && { label: "LANGUAGE", value: book.language.toUpperCase() },
  ].filter(Boolean) as { label: string; value: string }[]

  return {
    id: book.id,
    num: String(index + 1).padStart(3, "0"),
    href: book.href,
    hasEssay: book.hasEssay,
    cover: book.cover,
    coverAspectRatio: "2/3",
    title: book.title,
    subtitle: `${book.authorName} · ${book.year}`,
    oneLiner: book.oneLiner,
    rating: book.rating,
    rightMeta: book.dateReadDisplay,
    expandFields,
    quote: book.quote,
    tags: book.tags,
  }
}

export default function BooksCatalog({ books, essayCount }: Props) {
  const [status, setStatus] = useState<StatusValue>(null)
  const [rating, setRating] = useState<RatingValue>(null)

  const filtered = useMemo(() => {
    return books
      .filter((b) => (status === null ? true : b.status === status))
      .filter((b) => (rating === null ? true : (b.rating ?? 0) >= rating))
  }, [books, status, rating])

  const items = filtered.map((b, i) => toListItem(b, i))

  return (
    <div className="space-y-7">
      <header>
        <h2 className="font-display text-3xl font-bold tracking-tight">Books</h2>
        <p className="text-sm text-stone-500 mt-1">
          전체 {books.length}권 · 정리글 {essayCount}편
        </p>
      </header>

      <div className="flex flex-wrap gap-4">
        <FilterChips<StatusValue>
          ariaLabel="Status filter"
          options={STATUS_OPTIONS}
          active={status}
          onChange={setStatus}
        />
        <FilterChips<RatingValue>
          ariaLabel="Rating filter"
          options={RATING_OPTIONS}
          active={rating}
          onChange={setRating}
        />
      </div>

      {items.length === 0 ? (
        <p className="text-stone-500 text-sm">필터에 해당하는 책이 없어요.</p>
      ) : (
        <EditorialList items={items} />
      )}
    </div>
  )
}
