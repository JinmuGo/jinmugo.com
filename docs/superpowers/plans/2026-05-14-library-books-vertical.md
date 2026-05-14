# Library — Books Vertical Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a working `/library/books` destination end-to-end — book catalog (editorial list with inline expand), book detail pages (gated by writeup presence), author pages with auto-discography, header navigation, and migration of 3 existing book posts.

**Architecture:** Two new Astro content collections (`book`, `author`). Reusable React `EditorialList` component for catalog with inline expand interaction. `BookDetail` Astro layout adapted from existing `PostBannerY`. `hasEssay` build-time judgment determines whether a book gets a static detail page or stays catalog-only. Movies/Music verticals (Plan 2) will reuse `EditorialList` + `PersonHeader` patterns.

**Tech Stack:** Astro 6 (content collections + dynamic routes), React 19 (interactive catalog island), Tailwind v4, Vitest (unit tests for utilities), Biome (lint/format). Korean-only for this plan; English mirror is Plan 3.

**Spec reference:** `docs/superpowers/specs/2026-05-14-library-design.md`

---

## File Structure

**New files:**
- `src/content/book/` — destination for migrated book MDX files
- `src/content/author/` — author entries (one MDX per author, body optional)
- `src/types/library.ts` — shared TypeScript types
- `src/utils/library/hasEssay.ts` — body length judgment + tests
- `src/utils/library/books.ts` — fetch helpers + tests
- `src/utils/library/authors.ts` — fetch helpers
- `src/components/library/EditorialList.tsx` — React island for catalog + expand
- `src/components/library/EditorialRow.tsx` — single row with state
- `src/components/library/FilterChips.tsx` — filter UI
- `src/components/library/MetaStrip.astro` — detail page metadata strip
- `src/components/library/PersonHeader.astro` — person page header block
- `src/layouts/library/BookDetail.astro` — book writeup layout
- `src/layouts/library/AuthorDetail.astro` — author page layout
- `src/pages/library/books/index.astro` — catalog page
- `src/pages/library/books/[slug]/index.astro` — book detail route
- `src/pages/library/books/author/[slug].astro` — author route

**Modified files:**
- `src/content.config.ts` — register `book` and `author` collections
- `src/components/app-shell/Header/headerNavLinks.ts` — add Library entry
- `astro.config.mjs` — add 301 redirects from old `/posts/<book>` URLs

**Deleted/moved files:**
- `src/content/post/process-economy/` → moved to `src/content/book/process-economy/`
- `src/content/post/where-are-we-now/` → moved to `src/content/book/where-are-we-now/`
- `src/content/post/if-snow-is-silence-falling-from-the-sky/` → moved to `src/content/book/if-snow-is-silence-falling-from-the-sky/`

---

## Task 1: Add `author` collection schema

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/types/library.ts`

- [ ] **Step 1.1: Define Author Zod schema in content.config.ts**

Add after the existing `weeklyCollection` definition, before the Portfolio section:

```typescript
const authorCollection = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/author",
    generateId: stripExtension,
  }),
  schema: z.object({
    name: z.string(),
    originalName: z.string().optional(),
    birthYear: z.number().int().optional(),
    country: z.string().optional(),
    bio: z.string().optional(),
    photo: z.string().optional(),
    wiki: z.string().url().optional(),
    draft: z.preprocess((v: unknown) => v ?? undefined, z.boolean().default(false)),
  }),
})
```

Register in the exported `collections` object:

```typescript
export const collections = {
  post: postCollection,
  weekly: weeklyCollection,
  app: appCollection,
  author: authorCollection,
}
```

- [ ] **Step 1.2: Add Author type to src/types/library.ts**

Create the file:

```typescript
import type { CollectionEntry } from "astro:content"

export type AuthorEntry = CollectionEntry<"author">
export type AuthorData = AuthorEntry["data"]

export interface AuthorWithSlug extends AuthorEntry {
  slug: string
  href: string
}
```

- [ ] **Step 1.3: Run type-check**

Run: `pnpm exec astro check`
Expected: passes with no errors related to new schema.

- [ ] **Step 1.4: Commit**

```bash
git add src/content.config.ts src/types/library.ts
git commit -m "feat(library): add author content collection schema"
```

---

## Task 2: Add `book` collection schema

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/types/library.ts`

- [ ] **Step 2.1: Define BookStatus enum and Book Zod schema**

In `src/content.config.ts`, add after `authorCollection`:

```typescript
const BOOK_STATUS = ["read", "reading", "want"] as const
const bookStatusSchema = z.enum(BOOK_STATUS)

const bookCollection = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/book",
    generateId: stripExtension,
  }),
  schema: z.object({
    title: z.string(),
    authorId: z.string(),
    originalTitle: z.string().optional(),
    year: z.number().int(),
    publisher: z.string().optional(),
    pages: z.number().int().positive().optional(),
    language: z.enum(["ko", "en", "ja", "zh", "other"]).optional(),
    cover: z.string().optional(),
    dateRead: z.coerce.date().optional(),
    rating: z.number().int().min(1).max(5).optional(),
    status: bookStatusSchema.default("read"),
    oneLiner: z.string().optional(),
    tags: z.preprocess(
      (v: unknown) => v ?? undefined,
      z.array(z.string()).optional().default([]),
    ),
    quote: z.string().optional(),
    draft: z.preprocess((v: unknown) => v ?? undefined, z.boolean().default(false)),
    lastmod: z.preprocess((v: unknown) => v ?? undefined, z.coerce.date().optional()),
  }),
})
```

Register in collections:

```typescript
export const collections = {
  post: postCollection,
  weekly: weeklyCollection,
  app: appCollection,
  author: authorCollection,
  book: bookCollection,
}
```

- [ ] **Step 2.2: Add Book types to src/types/library.ts**

Append:

```typescript
export type BookEntry = CollectionEntry<"book">
export type BookData = BookEntry["data"]

export interface BookWithSlug extends BookEntry {
  slug: string
  href: string
  hasEssay: boolean
}

export type BookStatus = "read" | "reading" | "want"
```

- [ ] **Step 2.3: Run type-check**

Run: `pnpm exec astro check`
Expected: passes.

- [ ] **Step 2.4: Commit**

```bash
git add src/content.config.ts src/types/library.ts
git commit -m "feat(library): add book content collection schema"
```

---

## Task 3: hasEssay utility (TDD)

**Files:**
- Create: `src/utils/library/hasEssay.ts`
- Test: `src/utils/library/hasEssay.test.ts`

Pure function: given a markdown/MDX body string, returns whether it qualifies as an "essay" (long enough to deserve its own detail page).

- [ ] **Step 3.1: Write the failing test**

Create `src/utils/library/hasEssay.test.ts`:

```typescript
import { describe, expect, it } from "vitest"
import { hasEssay, ESSAY_MIN_CHARS } from "./hasEssay"

describe("hasEssay", () => {
  it("returns false for empty body", () => {
    expect(hasEssay("")).toBe(false)
  })

  it("returns false for short body under threshold", () => {
    expect(hasEssay("짧은 메모.")).toBe(false)
  })

  it("returns true for body over threshold", () => {
    const longBody = "가".repeat(ESSAY_MIN_CHARS + 1)
    expect(hasEssay(longBody)).toBe(true)
  })

  it("ignores whitespace when counting", () => {
    const body = "가".repeat(ESSAY_MIN_CHARS) + "\n\n   \n   "
    expect(hasEssay(body)).toBe(true)
  })

  it("strips frontmatter when counting", () => {
    const body = `---\ntitle: foo\n---\n\n${"가".repeat(ESSAY_MIN_CHARS + 10)}`
    expect(hasEssay(body)).toBe(true)
  })

  it("strips markdown image syntax when counting", () => {
    const body = `![alt text](./very/long/path/to/image.png) 짧은 글.`
    expect(hasEssay(body)).toBe(false)
  })

  it("returns true exactly at threshold", () => {
    expect(hasEssay("가".repeat(ESSAY_MIN_CHARS))).toBe(true)
  })
})
```

- [ ] **Step 3.2: Run test, verify it fails**

Run: `pnpm test src/utils/library/hasEssay.test.ts`
Expected: FAIL with module not found.

- [ ] **Step 3.3: Implement hasEssay**

Create `src/utils/library/hasEssay.ts`:

```typescript
export const ESSAY_MIN_CHARS = 200

const stripFrontmatter = (body: string): string =>
  body.replace(/^---\n[\s\S]*?\n---\n/, "")

const stripMarkdownImages = (body: string): string =>
  body.replace(/!\[[^\]]*\]\([^)]*\)/g, "")

const countMeaningfulChars = (body: string): number => {
  const stripped = stripMarkdownImages(stripFrontmatter(body))
  return stripped.replace(/\s+/g, "").length
}

export const hasEssay = (body: string): boolean =>
  countMeaningfulChars(body) >= ESSAY_MIN_CHARS
```

- [ ] **Step 3.4: Run test, verify passes**

Run: `pnpm test src/utils/library/hasEssay.test.ts`
Expected: all 7 tests PASS.

- [ ] **Step 3.5: Commit**

```bash
git add src/utils/library/hasEssay.ts src/utils/library/hasEssay.test.ts
git commit -m "feat(library): add hasEssay body-length judgment utility"
```

---

## Task 4: Books fetch helper (TDD)

**Files:**
- Create: `src/utils/library/books.ts`
- Test: `src/utils/library/books.test.ts`

- [ ] **Step 4.1: Write the failing test**

Create `src/utils/library/books.test.ts`:

```typescript
import { describe, expect, it } from "vitest"
import { sortBooksByDateRead, filterBooksByStatus, filterBooksByRating } from "./books"
import type { BookWithSlug } from "@/types/library"

const fakeBook = (overrides: Partial<BookWithSlug["data"]> = {}): BookWithSlug =>
  ({
    id: "x",
    slug: "x",
    href: "/library/books/x/",
    hasEssay: false,
    data: {
      title: "X",
      authorId: "a",
      year: 2020,
      status: "read",
      tags: [],
      draft: false,
      ...overrides,
    },
  }) as unknown as BookWithSlug

describe("sortBooksByDateRead", () => {
  it("sorts descending by dateRead, nulls last", () => {
    const a = fakeBook({ dateRead: new Date("2025-01-01") })
    const b = fakeBook({ dateRead: new Date("2026-01-01") })
    const c = fakeBook({ dateRead: undefined })
    expect(sortBooksByDateRead([a, c, b]).map((x) => x.data.dateRead)).toEqual([
      b.data.dateRead,
      a.data.dateRead,
      undefined,
    ])
  })
})

describe("filterBooksByStatus", () => {
  it("returns only books matching status", () => {
    const r = fakeBook({ status: "read" })
    const w = fakeBook({ status: "want" })
    expect(filterBooksByStatus([r, w], "read")).toEqual([r])
  })

  it("returns all books when status is null", () => {
    const r = fakeBook({ status: "read" })
    const w = fakeBook({ status: "want" })
    expect(filterBooksByStatus([r, w], null)).toEqual([r, w])
  })
})

describe("filterBooksByRating", () => {
  it("returns books with rating >= min", () => {
    const a = fakeBook({ rating: 5 })
    const b = fakeBook({ rating: 3 })
    const c = fakeBook({ rating: undefined })
    expect(filterBooksByRating([a, b, c], 4)).toEqual([a])
  })

  it("returns all books when min is null", () => {
    const a = fakeBook({ rating: 5 })
    const b = fakeBook({ rating: 3 })
    expect(filterBooksByRating([a, b], null)).toEqual([a, b])
  })
})
```

- [ ] **Step 4.2: Run test, verify failure**

Run: `pnpm test src/utils/library/books.test.ts`
Expected: FAIL.

- [ ] **Step 4.3: Implement pure helpers**

Create `src/utils/library/books.ts`:

```typescript
import { getCollection, render } from "astro:content"
import type { BookEntry, BookStatus, BookWithSlug } from "@/types/library"
import { hasEssay } from "./hasEssay"

const stripExt = (id: string) => id.replace(/\.mdx?$/, "")

export const sortBooksByDateRead = (books: BookWithSlug[]): BookWithSlug[] =>
  [...books].sort((a, b) => {
    const aTime = a.data.dateRead?.getTime() ?? -Infinity
    const bTime = b.data.dateRead?.getTime() ?? -Infinity
    return bTime - aTime
  })

export const filterBooksByStatus = (
  books: BookWithSlug[],
  status: BookStatus | null,
): BookWithSlug[] => (status === null ? books : books.filter((b) => b.data.status === status))

export const filterBooksByRating = (
  books: BookWithSlug[],
  min: number | null,
): BookWithSlug[] =>
  min === null ? books : books.filter((b) => (b.data.rating ?? 0) >= min)

/**
 * Fetch all non-draft books with computed slug, href, hasEssay.
 * Astro `render()` is awaited per entry to determine body length.
 */
export async function getBooks(): Promise<BookWithSlug[]> {
  const entries = await getCollection("book", ({ data }) => !data.draft)
  const enriched = await Promise.all(
    entries.map(async (entry: BookEntry) => {
      const slug = stripExt(entry.id)
      const body = entry.body ?? ""
      return {
        ...entry,
        slug,
        href: `/library/books/${slug}/`,
        hasEssay: hasEssay(body),
      } as BookWithSlug
    }),
  )
  return enriched
}
```

- [ ] **Step 4.4: Verify tests pass**

Run: `pnpm test src/utils/library/books.test.ts`
Expected: all 5 tests PASS.

- [ ] **Step 4.5: Commit**

```bash
git add src/utils/library/books.ts src/utils/library/books.test.ts
git commit -m "feat(library): add book fetch + sort/filter helpers"
```

---

## Task 5: Authors fetch helper

**Files:**
- Create: `src/utils/library/authors.ts`

- [ ] **Step 5.1: Implement authors helper**

```typescript
import { getCollection } from "astro:content"
import type { AuthorEntry, AuthorWithSlug } from "@/types/library"
import type { BookWithSlug } from "@/types/library"

const stripExt = (id: string) => id.replace(/\.mdx?$/, "")

export async function getAuthors(): Promise<AuthorWithSlug[]> {
  const entries = await getCollection("author", ({ data }) => !data.draft)
  return entries.map((entry: AuthorEntry) => {
    const slug = stripExt(entry.id)
    return {
      ...entry,
      slug,
      href: `/library/books/author/${slug}/`,
    }
  })
}

export async function getAuthorById(
  authorId: string,
): Promise<AuthorWithSlug | undefined> {
  const authors = await getAuthors()
  return authors.find((a) => a.slug === authorId)
}

export function booksByAuthor(
  books: BookWithSlug[],
  authorId: string,
): BookWithSlug[] {
  return books.filter((b) => b.data.authorId === authorId)
}
```

- [ ] **Step 5.2: Run type-check**

Run: `pnpm exec astro check`
Expected: passes.

- [ ] **Step 5.3: Commit**

```bash
git add src/utils/library/authors.ts
git commit -m "feat(library): add author fetch helpers"
```

---

## Task 6: EditorialRow + EditorialList components (React)

**Files:**
- Create: `src/components/library/EditorialRow.tsx`
- Create: `src/components/library/EditorialList.tsx`
- Test: `src/components/library/EditorialList.test.tsx`

React island for the catalog, since the inline expand is interactive (one open at a time).

- [ ] **Step 6.1: Write the failing test**

Create `src/components/library/EditorialList.test.tsx`:

```typescript
import { render, screen, fireEvent } from "@testing-library/react"
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
```

- [ ] **Step 6.2: Run test, verify failure**

Run: `pnpm test src/components/library/EditorialList.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 6.3: Implement EditorialList**

Create `src/components/library/EditorialList.tsx`:

```tsx
import { useState } from "react"
import EditorialRow from "./EditorialRow"

export interface ExpandField {
  label: string
  value: string
}

export interface EditorialListItem {
  id: string
  num: string
  href: string
  hasEssay: boolean
  cover?: string
  coverAspectRatio: "2/3" | "1/1"
  title: string
  subtitle: string
  oneLiner?: string
  rating?: number
  rightMeta: string
  expandFields: ExpandField[]
  quote?: string
  tags: string[]
}

interface Props {
  items: EditorialListItem[]
}

export default function EditorialList({ items }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id))

  return (
    <ul className="flex flex-col divide-y divide-stone-200 dark:divide-stone-700">
      {items.map((it) => (
        <EditorialRow
          key={it.id}
          item={it}
          isOpen={openId === it.id}
          onToggle={() => toggle(it.id)}
        />
      ))}
    </ul>
  )
}
```

Create `src/components/library/EditorialRow.tsx`:

```tsx
import type { EditorialListItem } from "./EditorialList"

interface Props {
  item: EditorialListItem
  isOpen: boolean
  onToggle: () => void
}

const Stars = ({ rating }: { rating?: number }) => {
  if (!rating) return null
  return (
    <span className="text-[#D97706]" aria-label={`${rating} stars`}>
      {"★".repeat(rating)}
    </span>
  )
}

const Cover = ({
  cover,
  aspect,
  alt,
}: {
  cover?: string
  aspect: "2/3" | "1/1"
  alt: string
}) => {
  const sizeClass = aspect === "1/1" ? "w-20 aspect-square" : "w-14 aspect-[2/3]"
  if (cover) {
    return (
      <img
        src={cover}
        alt={alt}
        className={`${sizeClass} rounded-sm object-cover shrink-0 bg-stone-200 dark:bg-stone-700`}
        loading="lazy"
      />
    )
  }
  return (
    <div
      className={`${sizeClass} rounded-sm shrink-0 bg-stone-300 dark:bg-stone-700`}
      aria-hidden="true"
    />
  )
}

const ExpandPanel = ({ item }: { item: EditorialListItem }) => (
  <div className="mt-4 pt-4 border-t border-dashed border-stone-300 dark:border-stone-600 grid grid-cols-2 gap-3 text-sm text-stone-700 dark:text-stone-300">
    {item.expandFields.map((f) => (
      <div key={f.label}>
        <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">
          {f.label}
        </div>
        <div className="text-stone-700 dark:text-stone-200">{f.value}</div>
      </div>
    ))}
    {item.quote && (
      <blockquote className="col-span-2 border-l-2 border-[#D97706] pl-3 italic text-stone-600 dark:text-stone-300 leading-relaxed">
        {item.quote}
      </blockquote>
    )}
    {item.tags.length > 0 && (
      <div className="col-span-2 flex gap-2 flex-wrap">
        {item.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-0.5 text-[11px] text-stone-600 dark:text-stone-300"
          >
            {t}
          </span>
        ))}
      </div>
    )}
  </div>
)

const RowContent = ({ item }: { item: EditorialListItem }) => (
  <>
    <div className="font-mono tabular-nums text-xs text-stone-400 pt-0.5 w-7 shrink-0">
      {item.num}
    </div>
    <Cover cover={item.cover} aspect={item.coverAspectRatio} alt={item.title} />
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-[15px] -tracking-tight">{item.title}</h4>
      <div className="text-[13px] text-stone-500 mb-1.5">{item.subtitle}</div>
      {item.oneLiner && (
        <div className="text-[13px] text-stone-700 dark:text-stone-300 leading-relaxed max-w-[48ch]">
          {item.oneLiner}
        </div>
      )}
    </div>
    <div className="text-right text-xs text-stone-500 pt-0.5 min-w-[80px]">
      <Stars rating={item.rating} />
      <div>{item.rightMeta}</div>
      {item.hasEssay && (
        <span className="block text-[#D97706] mt-1 text-[11px]" aria-label="has essay">
          ✎
        </span>
      )}
    </div>
  </>
)

export default function EditorialRow({ item, isOpen, onToggle }: Props) {
  const baseClass =
    "flex gap-4 py-4 transition-colors data-[open=true]:bg-stone-100 dark:data-[open=true]:bg-stone-800"

  if (item.hasEssay) {
    return (
      <li>
        <a href={item.href} className={`${baseClass} hover:bg-stone-100 dark:hover:bg-stone-800`}>
          <RowContent item={item} />
        </a>
      </li>
    )
  }

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        data-open={isOpen}
        aria-expanded={isOpen}
        className={`${baseClass} w-full text-left cursor-pointer`}
      >
        <RowContent item={item} />
      </button>
      {isOpen && (
        <div className="px-7 pb-4">
          <ExpandPanel item={item} />
        </div>
      )}
    </li>
  )
}
```

- [ ] **Step 6.4: Verify tests pass**

Run: `pnpm test src/components/library/EditorialList.test.tsx`
Expected: all 4 tests PASS.

- [ ] **Step 6.5: Lint and format**

Run: `pnpm check`
Expected: passes (or auto-fix any minor issues).

- [ ] **Step 6.6: Commit**

```bash
git add src/components/library/EditorialList.tsx src/components/library/EditorialRow.tsx src/components/library/EditorialList.test.tsx
git commit -m "feat(library): add EditorialList with inline-expand interaction"
```

---

## Task 7: FilterChips component

**Files:**
- Create: `src/components/library/FilterChips.tsx`

- [ ] **Step 7.1: Implement FilterChips**

```tsx
interface FilterOption<T extends string | number | null> {
  label: string
  value: T
}

interface Props<T extends string | number | null> {
  options: FilterOption<T>[]
  active: T
  onChange: (value: T) => void
  ariaLabel: string
}

export default function FilterChips<T extends string | number | null>({
  options,
  active,
  onChange,
  ariaLabel,
}: Props<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = opt.value === active
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={isActive}
            className={
              isActive
                ? "rounded-full px-3 py-1 text-xs font-medium bg-[#D97706] text-white"
                : "rounded-full px-3 py-1 text-xs font-medium bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-stone-400"
            }
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 7.2: Lint**

Run: `pnpm check`

- [ ] **Step 7.3: Commit**

```bash
git add src/components/library/FilterChips.tsx
git commit -m "feat(library): add FilterChips component"
```

---

## Task 8: Books catalog page (BooksCatalog island wrapping EditorialList + FilterChips)

**Files:**
- Create: `src/components/library/BooksCatalog.tsx`
- Create: `src/pages/library/books/index.astro`

Catalog needs filter state, so combine FilterChips + EditorialList in a React island. The Astro page builds the data and passes it as props.

- [ ] **Step 8.1: Implement BooksCatalog island**

Create `src/components/library/BooksCatalog.tsx`:

```tsx
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

const STATUS_OPTIONS = [
  { label: "전체", value: null },
  { label: "읽음", value: "read" },
  { label: "읽는 중", value: "reading" },
  { label: "읽고 싶음", value: "want" },
] as const

const RATING_OPTIONS = [
  { label: "전체", value: null },
  { label: "★★★★+", value: 4 },
  { label: "★★★★★", value: 5 },
] as const

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
      value:
        book.status === "read"
          ? "읽음"
          : book.status === "reading"
            ? "읽는 중"
            : "읽고 싶음",
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
  const [status, setStatus] = useState<"read" | "reading" | "want" | null>(null)
  const [rating, setRating] = useState<number | null>(null)

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
        <FilterChips
          ariaLabel="Status filter"
          options={STATUS_OPTIONS as unknown as { label: string; value: typeof status }[]}
          active={status}
          onChange={setStatus}
        />
        <FilterChips
          ariaLabel="Rating filter"
          options={RATING_OPTIONS as unknown as { label: string; value: typeof rating }[]}
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
```

- [ ] **Step 8.2: Implement books catalog Astro page**

Create `src/pages/library/books/index.astro`:

```astro
---
import Layout from "@/layouts/Layout.astro"
import BooksCatalog from "@/components/library/BooksCatalog"
import { getBooks, sortBooksByDateRead } from "@/utils/library/books"
import { getAuthors } from "@/utils/library/authors"

const books = sortBooksByDateRead(await getBooks())
const authors = await getAuthors()
const authorName = (id: string) =>
  authors.find((a) => a.slug === id)?.data.name ?? id

const formatDate = (d?: Date) => {
  if (!d) return "—"
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`
}

const data = books.map((b) => ({
  id: b.slug,
  href: b.href,
  hasEssay: b.hasEssay,
  cover: b.data.cover,
  title: b.data.title,
  authorName: authorName(b.data.authorId),
  year: b.data.year,
  oneLiner: b.data.oneLiner,
  rating: b.data.rating,
  dateReadDisplay: formatDate(b.data.dateRead),
  dateReadYear: b.data.dateRead?.getFullYear(),
  status: b.data.status,
  publisher: b.data.publisher,
  pages: b.data.pages,
  language: b.data.language,
  quote: b.data.quote,
  tags: b.data.tags,
}))

const essayCount = books.filter((b) => b.hasEssay).length
---

<Layout title="Books · Library" description="읽은 책들" lang="ko">
  <div class="mx-auto max-w-3xl px-4 py-12">
    <BooksCatalog client:load books={data} essayCount={essayCount} />
  </div>
</Layout>
```

- [ ] **Step 8.3: Verify build succeeds (will show empty catalog until Task 11)**

Run: `pnpm build`
Expected: build completes; `/library/books/` exists in `dist/`; shows "전체 0권" since no books migrated yet.

- [ ] **Step 8.4: Commit**

```bash
git add src/components/library/BooksCatalog.tsx src/pages/library/books/index.astro
git commit -m "feat(library): add /library/books catalog page"
```

---

## Task 9: MetaStrip + BookDetail layout

**Files:**
- Create: `src/components/library/MetaStrip.astro`
- Create: `src/layouts/library/BookDetail.astro`

- [ ] **Step 9.1: Implement MetaStrip**

Create `src/components/library/MetaStrip.astro`:

```astro
---
interface MetaField {
  label: string
  value: string
  accent?: boolean
}

interface Props {
  fields: MetaField[]
}

const { fields } = Astro.props
---

<dl class="flex flex-wrap gap-x-6 gap-y-3 text-sm">
  {
    fields.map((f) => (
      <div class="flex flex-col gap-0.5">
        <dt class="font-mono text-[10px] uppercase tracking-wider font-semibold text-stone-400">
          {f.label}
        </dt>
        <dd class={`text-[13px] ${f.accent ? "text-[#D97706]" : "text-stone-700 dark:text-stone-200"}`}>
          {f.value}
        </dd>
      </div>
    ))
  }
</dl>
```

- [ ] **Step 9.2: Implement BookDetail layout**

Create `src/layouts/library/BookDetail.astro`:

```astro
---
import Layout from "@/layouts/Layout.astro"
import Prose from "@/components/layout/Prose.astro"
import Breadcrumb from "@/components/seo/Breadcrumb.astro"
import MetaStrip from "@/components/library/MetaStrip.astro"
import type { BookWithSlug, AuthorWithSlug } from "@/types/library"

interface Props {
  book: BookWithSlug
  author: AuthorWithSlug | undefined
  num: string
}

const { book, author, num } = Astro.props
const data = book.data

const formatDate = (d?: Date) =>
  d ? `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}` : "—"

const statusLabel =
  data.status === "read" ? "Finished" : data.status === "reading" ? "Reading" : "Want"

const fields = [
  data.rating
    ? { label: "Rating", value: "★".repeat(data.rating), accent: true }
    : null,
  { label: "Read", value: formatDate(data.dateRead) },
  data.pages ? { label: "Pages", value: `${data.pages}p` } : null,
  data.language ? { label: "Language", value: data.language.toUpperCase() } : null,
  { label: "Status", value: statusLabel },
].filter(Boolean) as { label: string; value: string; accent?: boolean }[]

const breadcrumbItems = [
  { label: "Library", href: "/library/" },
  { label: "Books", href: "/library/books/" },
  { label: data.title, href: book.href },
]
---

<Layout title={`${data.title} · Books`} description={data.oneLiner ?? data.title} lang="ko">
  <article class="mx-auto max-w-3xl px-4 py-10">
    <Breadcrumb items={breadcrumbItems} />

    <header class="flex gap-7 pb-7 border-b border-stone-200 dark:border-stone-700 items-start">
      {
        data.cover ? (
          <img
            src={data.cover}
            alt={`${data.title} cover`}
            class="w-[140px] aspect-[2/3] rounded shadow-md object-cover bg-stone-200"
            loading="eager"
          />
        ) : (
          <div class="w-[140px] aspect-[2/3] rounded shadow-md bg-stone-300 dark:bg-stone-700" aria-hidden="true" />
        )
      }
      <div class="flex-1">
        <div class="font-mono text-[10px] uppercase tracking-wider text-[#D97706] font-semibold mb-2">
          Book · {num}
        </div>
        <h1 class="font-display text-3xl font-bold tracking-tight leading-tight mb-1">
          {data.title}
        </h1>
        <p class="text-[15px] text-stone-600 dark:text-stone-300 mb-4">
          by
          {
            author ? (
              <a href={author.href} class="text-[#D97706] hover:underline">
                {author.data.name}
              </a>
            ) : (
              data.authorId
            )
          } · {data.year}
        </p>
        <MetaStrip fields={fields} />
      </div>
    </header>

    <Prose as="div" class="pt-7">
      <slot />
    </Prose>
  </article>
</Layout>
```

- [ ] **Step 9.3: Verify type-check**

Run: `pnpm exec astro check`
Expected: passes.

- [ ] **Step 9.4: Commit**

```bash
git add src/components/library/MetaStrip.astro src/layouts/library/BookDetail.astro
git commit -m "feat(library): add BookDetail layout and MetaStrip"
```

---

## Task 10: Book detail dynamic route (gated by hasEssay)

**Files:**
- Create: `src/pages/library/books/[slug]/index.astro`

Only books with `hasEssay === true` get a static page. Books without writeups have no detail route — clicks expand inline on the catalog.

- [ ] **Step 10.1: Implement the route**

Create `src/pages/library/books/[slug]/index.astro`:

```astro
---
import { render } from "astro:content"
import BookDetail from "@/layouts/library/BookDetail.astro"
import { components } from "@/components/mdx/components.astro"
import { getBooks, sortBooksByDateRead } from "@/utils/library/books"
import { getAuthorById } from "@/utils/library/authors"
import type { BookWithSlug } from "@/types/library"

export async function getStaticPaths() {
  const books = sortBooksByDateRead(await getBooks())
  return books
    .filter((b) => b.hasEssay)
    .map((book, idx) => {
      const num = String(idx + 1).padStart(3, "0")
      return {
        params: { slug: book.slug },
        props: { book, num },
      }
    })
}

const { book, num } = Astro.props as { book: BookWithSlug; num: string }
const author = await getAuthorById(book.data.authorId)
const { Content } = await render(book)
---

<BookDetail book={book} author={author} num={num}>
  <Content components={components} />
</BookDetail>
```

- [ ] **Step 10.2: Run build to confirm route compiles**

Run: `pnpm build`
Expected: completes successfully (no books yet, so no pages generated for this route).

- [ ] **Step 10.3: Commit**

```bash
git add src/pages/library/books/\[slug\]/index.astro
git commit -m "feat(library): add /library/books/[slug] detail route"
```

---

## Task 11: PersonHeader + AuthorDetail layout

**Files:**
- Create: `src/components/library/PersonHeader.astro`
- Create: `src/layouts/library/AuthorDetail.astro`

- [ ] **Step 11.1: Implement PersonHeader**

```astro
---
interface Props {
  name: string
  role: string
  meta: string
  bio?: string
  photo?: string
}

const { name, role, meta, bio, photo } = Astro.props
---

<header class="flex gap-5 items-center pb-6 border-b border-stone-200 dark:border-stone-700">
  {
    photo ? (
      <img
        src={photo}
        alt={name}
        class="w-20 h-20 rounded-full object-cover bg-stone-200"
      />
    ) : (
      <div class="w-20 h-20 rounded-full bg-stone-300 dark:bg-stone-700" aria-hidden="true" />
    )
  }
  <div>
    <h1 class="font-display text-2xl font-bold tracking-tight">{name}</h1>
    <div class="text-[13px] text-stone-500 mb-1.5">{role} · {meta}</div>
    {bio && <p class="text-[13px] text-stone-700 dark:text-stone-300 leading-relaxed">{bio}</p>}
  </div>
</header>
```

- [ ] **Step 11.2: Implement AuthorDetail layout**

```astro
---
import Layout from "@/layouts/Layout.astro"
import Prose from "@/components/layout/Prose.astro"
import Breadcrumb from "@/components/seo/Breadcrumb.astro"
import PersonHeader from "@/components/library/PersonHeader.astro"
import type { AuthorWithSlug, BookWithSlug } from "@/types/library"

interface Props {
  author: AuthorWithSlug
  works: BookWithSlug[]
  hasEssay: boolean
}

const { author, works, hasEssay } = Astro.props
const data = author.data

const formatDate = (d?: Date) =>
  d ? `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}` : "—"

const breadcrumbItems = [
  { label: "Library", href: "/library/" },
  { label: "Books", href: "/library/books/" },
  { label: "Authors", href: "/library/books/" },
  { label: data.name, href: author.href },
]

const meta = [data.birthYear, data.country].filter(Boolean).join(" · ")
---

<Layout title={`${data.name} · Authors`} description={data.bio ?? data.name} lang="ko">
  <div class="mx-auto max-w-3xl px-4 py-10">
    <Breadcrumb items={breadcrumbItems} />

    <PersonHeader
      name={data.name}
      role="Author"
      meta={meta}
      bio={data.bio}
      photo={data.photo}
    />

    <section class="pt-7">
      <div class="font-mono text-[11px] uppercase tracking-wider text-stone-500 font-semibold mb-4">
        Read Works · {works.length}
      </div>
      <ul class="flex flex-col divide-y divide-stone-200 dark:divide-stone-700">
        {
          works.map((w, idx) => (
            <li class="flex gap-3.5 py-3.5 items-center">
              <span class="font-mono tabular-nums text-xs text-stone-400 w-7">
                {String(idx + 1).padStart(3, "0")}
              </span>
              {w.data.cover ? (
                <img
                  src={w.data.cover}
                  alt=""
                  class="w-9 aspect-[2/3] rounded-sm object-cover bg-stone-200"
                  loading="lazy"
                />
              ) : (
                <div class="w-9 aspect-[2/3] rounded-sm bg-stone-300 dark:bg-stone-700" aria-hidden="true" />
              )}
              <div class="flex-1 text-sm text-stone-700 dark:text-stone-200">
                {w.hasEssay ? (
                  <a href={w.href} class="hover:text-[#D97706]">
                    {w.data.title}
                    <span class="text-stone-400 text-xs ml-1.5">{w.data.year}</span>
                  </a>
                ) : (
                  <>
                    {w.data.title}
                    <span class="text-stone-400 text-xs ml-1.5">{w.data.year}</span>
                  </>
                )}
              </div>
              <div class="text-xs text-stone-500">
                {w.data.rating && (
                  <span class="text-[#D97706] mr-2">{"★".repeat(w.data.rating)}</span>
                )}
                {formatDate(w.data.dateRead)}
                {w.hasEssay && <span class="text-[#D97706] ml-2">✎</span>}
              </div>
            </li>
          ))
        }
      </ul>
    </section>

    {
      hasEssay && (
        <section class="pt-7 mt-6 border-t border-stone-200 dark:border-stone-700">
          <h3 class="font-display text-base font-semibold mb-3">이 저자에 대해</h3>
          <Prose as="div">
            <slot />
          </Prose>
        </section>
      )
    }
  </div>
</Layout>
```

- [ ] **Step 11.3: Commit**

```bash
git add src/components/library/PersonHeader.astro src/layouts/library/AuthorDetail.astro
git commit -m "feat(library): add AuthorDetail layout with auto-discography"
```

---

## Task 12: Author dynamic route

**Files:**
- Create: `src/pages/library/books/author/[slug].astro`

- [ ] **Step 12.1: Implement author route**

```astro
---
import { render } from "astro:content"
import AuthorDetail from "@/layouts/library/AuthorDetail.astro"
import { components } from "@/components/mdx/components.astro"
import { getAuthors, booksByAuthor } from "@/utils/library/authors"
import { getBooks, sortBooksByDateRead } from "@/utils/library/books"
import { hasEssay } from "@/utils/library/hasEssay"
import type { AuthorWithSlug } from "@/types/library"

export async function getStaticPaths() {
  const authors = await getAuthors()
  const books = sortBooksByDateRead(await getBooks())
  return authors.map((author) => ({
    params: { slug: author.slug },
    props: {
      author,
      works: booksByAuthor(books, author.slug),
    },
  }))
}

const { author, works } = Astro.props as {
  author: AuthorWithSlug
  works: Awaited<ReturnType<typeof getBooks>>
}

const { Content } = await render(author)
const authorHasEssay = hasEssay(author.body ?? "")
---

<AuthorDetail author={author} works={works} hasEssay={authorHasEssay}>
  <Content components={components} />
</AuthorDetail>
```

- [ ] **Step 12.2: Verify build**

Run: `pnpm build`
Expected: passes (no authors yet, no pages generated).

- [ ] **Step 12.3: Commit**

```bash
git add src/pages/library/books/author/\[slug\].astro
git commit -m "feat(library): add /library/books/author/[slug] route"
```

---

## Task 13: Migrate 3 existing book posts

**Files:**
- Create: `src/content/author/oba-kazuhiro.mdx`
- Create: `src/content/author/glen-david-gold.mdx` (if applicable — verify actual author)
- Create: `src/content/author/ryu-shiwa.mdx` (verify actual author)
- Create: `src/content/book/process-economy/process-economy.mdx`
- Create: `src/content/book/where-are-we-now/where-are-we-now.mdx`
- Create: `src/content/book/if-snow-is-silence-falling-from-the-sky/if-snow-is-silence-falling-from-the-sky.mdx`
- Delete: original folders under `src/content/post/`

The existing book post: `process-economy` has tag "오바라 가즈히로" (the author). For the other two books, verify the actual author from the existing files before migration.

- [ ] **Step 13.1: Inspect existing book frontmatter**

Run: `head -15 src/content/post/process-economy/process-economy.mdx src/content/post/where-are-we-now/where-are-we-now.mdx src/content/post/if-snow-is-silence-falling-from-the-sky/If-snow-is-silence-falling-from-the-sky.mdx`

Record the title, tags, summary, date for each. Verify the author name (from tags or content).

- [ ] **Step 13.2: Create author entries**

For each unique author, create `src/content/author/<slug>.mdx`. Example for Oba Kazuhiro:

```markdown
---
name: 오바라 가즈히로
originalName: 尾原 和啓
country: Japan
bio: IT평론가, 사업가. 프로세스의 가치를 강조하는 비즈니스 저술가.
---
```

Body optional. Repeat for the two other authors found in Step 13.1.

- [ ] **Step 13.3: Move and reframe each book**

For each of the 3 books, move the directory:

```bash
git mv src/content/post/process-economy src/content/book/process-economy
git mv src/content/post/where-are-we-now src/content/book/where-are-we-now
git mv src/content/post/if-snow-is-silence-falling-from-the-sky src/content/book/if-snow-is-silence-falling-from-the-sky
```

Then rewrite frontmatter on each `.mdx`. Example for `process-economy.mdx`:

```markdown
---
title: 프로세스 이코노미
authorId: oba-kazuhiro
year: 2022
language: ko
dateRead: 2022-09-12
rating: 4
status: read
oneLiner: 결과보다 과정 자체를 콘텐츠로 만드는 시대.
tags:
  - 프로세스 이코노미
  - 비즈니스
---

(body unchanged)
```

Drop the old `category: book` and reuse the body as-is. The date that was in the old frontmatter becomes `dateRead`.

Repeat for the other two books with appropriate `authorId`, `year`, `oneLiner`, etc.

If any `.en.mdx` exists in the old folder, **delete it** for this plan (English mirror is Plan 3). It can be re-added later.

- [ ] **Step 13.4: Run prebuild + verify books appear**

Run: `pnpm prebuild`
Run: `pnpm build`

Expected: build passes, no schema errors.

- [ ] **Step 13.5: Start dev server and verify in browser**

Run: `pnpm dev`
Open: `http://localhost:4321/library/books/`

Verify:
- 3 books appear in catalog
- Books with sufficient body (likely all 3) show ✎ marker and link to detail page
- Detail pages render with banner cover (or placeholder if no `cover` field), meta strip, body
- Author name in detail page links to author page
- Author page shows the works correctly

If any book has short body, expand-on-click should work in catalog.

Stop dev server.

- [ ] **Step 13.6: Commit**

```bash
git add -A src/content/
git commit -m "feat(library): migrate 3 book posts to book collection + add authors"
```

---

## Task 14: Header navigation — add Library entry

**Files:**
- Modify: `src/components/app-shell/Header/headerNavLinks.ts`

- [ ] **Step 14.1: Add Library to nav links**

Modify `src/components/app-shell/Header/headerNavLinks.ts`. Add Library entry after `Weekly`:

```typescript
const headerNavLinks: HeaderNavLink[] = [
  { href: "/", title: "Home", shortCut: "h" },
  {
    href: "/about/",
    title: "About",
    shortCut: "a",
    subLinks: [
      {
        href: "/about/",
        title: "About",
        description: "About me",
        shortCut: "a",
      },
      {
        href: "/resume/",
        title: "Resume",
        description: "My resume and career",
        shortCut: "r",
      },
    ],
  },
  { href: "/posts/", title: "Posts", shortCut: "p" },
  { href: "/weekly/", title: "Weekly", shortCut: "w" },
  {
    href: "/library/books/",
    title: "Library",
    shortCut: "l",
    subLinks: [
      {
        href: "/library/books/",
        title: "Books",
        description: "내가 읽은 책",
        shortCut: "b",
      },
    ],
  },
  { href: "/gallery/", title: "Gallery", shortCut: "g" },
  { href: "/projects/", title: "Projects", shortCut: "pr" },
]
```

Note: only "Books" sub-link for now. Plan 2 will add Movies and Music.

- [ ] **Step 14.2: Verify header in dev**

Run: `pnpm dev`
Verify Library appears in header. Hovering shows popover with Books sub-link.

Stop dev server.

- [ ] **Step 14.3: Commit**

```bash
git add src/components/app-shell/Header/headerNavLinks.ts
git commit -m "feat(library): add Library entry to header navigation"
```

---

## Task 15: 301 redirects from old `/posts/<book-slug>` URLs

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 15.1: Add redirects config**

In `astro.config.mjs`, add a top-level `redirects` field to the Astro config object:

```javascript
redirects: {
  "/posts/process-economy": "/library/books/process-economy/",
  "/posts/process-economy/": "/library/books/process-economy/",
  "/posts/where-are-we-now": "/library/books/where-are-we-now/",
  "/posts/where-are-we-now/": "/library/books/where-are-we-now/",
  "/posts/if-snow-is-silence-falling-from-the-sky": "/library/books/if-snow-is-silence-falling-from-the-sky/",
  "/posts/if-snow-is-silence-falling-from-the-sky/": "/library/books/if-snow-is-silence-falling-from-the-sky/",
},
```

Place this inside `defineConfig({ ... })` alongside other top-level options.

- [ ] **Step 15.2: Verify build emits redirect pages**

Run: `pnpm build`
Expected: `dist/posts/process-economy/index.html` contains a meta-refresh / canonical to the new URL (Astro generates this for static redirects).

- [ ] **Step 15.3: Commit**

```bash
git add astro.config.mjs
git commit -m "feat(library): redirect old /posts/<book> URLs to /library/books"
```

---

## Task 16: Manual QA pass

**Files:**
- No code changes — QA only.

- [ ] **Step 16.1: Run full build**

Run: `pnpm build`
Expected: completes with no errors.

- [ ] **Step 16.2: Check sitemap**

Open `dist/sitemap-index.xml` and verify new `/library/books/*` URLs appear.
If they don't, the sitemap config (`astro-sitemap` or similar) may need attention — note for follow-up, do not block this plan.

- [ ] **Step 16.3: Start dev server and walk through user paths**

Run: `pnpm dev`

For each scenario, verify in browser:

1. **Catalog renders.** `/library/books/` → 3 books visible. Filters work (try ★★★★+, status filter).
2. **Detail page works for books with essays.** Click a book with ✎ marker → goes to `/library/books/<slug>/`. Banner cover, meta strip, body all render. Breadcrumb works.
3. **Inline expand works for books without essays.** If any book has short body, clicking the row expands inline showing metadata. Click again to collapse. Click a different row → previous collapses.
4. **Author link works.** From book detail page, click author name → goes to author page. Author's books list renders. ✎ marker correct.
5. **Empty author page works.** If any author has no body, "이 저자에 대해" section is hidden.
6. **Header nav works.** Library shows in header, popover lists Books.
7. **Redirects work.** Visit `/posts/process-economy` → redirects to `/library/books/process-economy/`.
8. **Dark mode looks right.** Toggle dark mode, verify catalog and detail pages adapt.
9. **Mobile width looks right.** Resize to ~375px, verify catalog rows wrap acceptably.

- [ ] **Step 16.4: Run all tests**

Run: `pnpm test`
Expected: all tests pass (utility tests + EditorialList tests).

- [ ] **Step 16.5: Lint check**

Run: `pnpm check`
Expected: passes.

- [ ] **Step 16.6: Final commit (if any fixes were needed during QA)**

If any issues surfaced, fix and commit. Otherwise this step is a no-op.

---

## Done Criteria

- [ ] `pnpm build` passes cleanly
- [ ] `pnpm test` passes (all utility + component tests)
- [ ] `pnpm check` passes
- [ ] `/library/books/` shows 3 migrated books in editorial list
- [ ] Books with essays have working detail pages at `/library/books/<slug>/`
- [ ] Author pages exist for each migrated author with auto-discography
- [ ] Old `/posts/<book-slug>` URLs redirect to new locations
- [ ] Header shows Library entry with Books sub-link
- [ ] Inline expand works for any lightweight (essay-less) book entry
- [ ] DESIGN.md tokens respected (warm stone neutrals, orange `#D97706` accent, Geist for display, Pretendard for body)

## Follow-up (out of scope for this plan)

- Plan 2: Movies + Music verticals (clone these patterns)
- Plan 3: `/library` hub landing + English mirror + cross-type polish
- RSS / search-index integration for library content
- Translation of book essays via `translate.js`
- Sitemap inclusion check (if Step 16.2 surfaced a gap)
