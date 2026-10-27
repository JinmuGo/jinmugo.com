# Design System — jinmu.me

## Product Context
- **What this is:** Bilingual (Korean/English) personal developer blog with technical deep-dives, running logs, and essays. The site has only posts and a gallery
- **Who it's for:** Fellow developers, Korean tech community, anyone who finds the posts via search
- **Space/industry:** Personal developer blog. Peers: leerob.io, rauno.me, paco.me, brianlovin.com
- **Project type:** Static editorial site (Astro 6 + max-w-maxx
## Aesthetic Direction
- **Direction:** Editorial/Magazine — strong typographic hierarchy, content-first, personality through typography and warmth rather than decoration
- **Decoration level:** Intentional — hero photo for personality, subtle warm surfaces, no decorative elements
- **Mood:** Warm, personal, technically competent. Like reading a well-crafted journal from someone who cares about both code and life
- **Risk #1:** Warm stone neutrals instead of blue-grays. Most dev blogs use cold colors. We use warm tones that feel more like paper.
- **Risk #2:** Orange accent in a sea of blue/purple. Every dev blog does blue. Orange signals warmth, energy, personal identity.

## Typography
- **Display/Hero:** Asta Sans (600). Headings never go above 600
- **Body:** Asta Sans (400) — one family for Korean and Latin, same as chl.ee and the OG images
- **UI/Labels:** Asta Sans (same as body)
- **Data/Tables:** Asta Sans with `font-variant-numeric: tabular-nums`
- **Code:** JetBrains Mono
- **Loading:** Astro Fonts API with the Google provider (`astro.config.mjs`), variable weight 300–700. Asta Sans ships about 93 unicode-range slices; only the Latin slice is preloaded
- **Scale (Major Third 1.25):**
  - xs: 12px — captions, timestamps
  - sm: 14px — metadata, labels, small text
  - base: 16px — UI text, navigation
  - md: 17px — body text (article content)
  - lg: 18px — post summary, intro text
  - xl: 20px — H3, H2 on mobile
  - 2xl: 24px — H2
  - 3xl: 30px — H1 (article and page titles, 24px on mobile)
  - 4xl: 48px — hero/display
- **Line height:** 1.8 for body (Korean text needs more), 1.25-1.4 for headings
- **Prose color:** body gray-800 `#292524`, headings gray-900 `#1C1917`; dark body gray-200, headings gray-100. No letter-spacing on body text
- **Measure:** article body fills the 768px reading column (720px of text at sm+)

## Color
- **Approach:** Restrained — one accent + warm neutrals. Color is rare and meaningful.
- **Primary (Orange):**
  - 50: #FFF7ED
  - 100: #FFEDD5
  - 200: #FED7AA
  - 300: #FDBA74
  - 400: #FB923C
  - 500: #D97706 (main accent)
  - 600: #C2410C
  - 700: #9A3412
  - 800: #7C2D12
  - 900: #6C2710
- **Neutrals (Warm Stone, not blue-gray):**
  - 50: #FAFAF8 (light background)
  - 100: #F5F5F0 (surface)
  - 200: #E7E5E0 (borders, light)
  - 300: #D6D3CC
  - 400: #A8A29E (muted text)
  - 500: #78716C
  - 600: #57534E (secondary text)
  - 700: #44403C
  - 800: #292524 (primary text)
  - 900: #1C1917 (dark background)
- **Semantic:** success #16A34A, warning #D97706, error #DC2626, info #2563EB
- **Dark mode strategy:** Follows the OS setting (`prefers-color-scheme`) only; there is no theme toggle. Surface inversion using stone scale. Reduce primary saturation slightly (#F59E0B in dark). Text off-white (#F5F5F0), not pure white. `color-scheme: light dark` on html.

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable — this is a blog, not a dashboard
- **Scale:**
  - 2xs: 2px
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px
  - 2xl: 48px
  - 3xl: 64px

## Layout
- **Approach:** Single reading column — header, home list, and article share one narrow column so the eye never re-aligns
- **Reading column:** `max-w-3xl` (768px) with `px-4 sm:px-6`. Every page uses it
- **Header:** flower logo (36px tall, same flower as the favicon) and one 20px gray-500 line icon with no text that points to the other view: on the gallery it is Posts (`AlignLeft`, links to the home list), everywhere else it is Gallery (`Image`). The icon carries `aria-label` and `title`. The header is sticky, 80px tall, over a blurred white fade. On post pages, once the page's h1 (`#post-title`) passes under the header, the logo and icon fade up and out and the post title (16px/600, centered, truncated) fades up in over a denser fade (300ms ease-out, off under reduced motion). Clicking that title scrolls to the top. No search, theme toggle, dropdowns, or mobile menu; the same row shows on every screen size
- **Footer:** centered under every page's content with no border: a tight row of 20px gray-500 icons (filled GitHub mark, lucide `rss` for the page language's feed, lucide `mail`), each with `aria-label` and `title`, then `© <year> Jinmu Go` (14px gray-500) below. No page links
- **Home hero:** photo fills the reading column (rounded-xl), aligned with the list below
- **Home list:** one row per post — title (20px semibold), summary (line-clamp-2, gray-600), date (14px gray-500). Rows separated by gray-100 dividers, `py-6`, hover fades the row to 60% opacity
- **Year nav:** on `lg+` a fixed left rail (`SideRail.astro`) of short lines links to the first post of each year; year labels appear on hover/focus
- **Post page:** one layout (`PostLayout.astro`). No breadcrumb or category chip on screen (breadcrumb stays in JSON-LD). Only the site footer follows the body: no comments, related-post, or previous/next cards
- **Post header:** centered title (30px/600, 24px on mobile), summary (18px gray-500), image, then the date (14px). No author name on screen; the author stays in JSON-LD. Landscape images are cropped to 2:1 at full column width (rounded-2xl); portrait images stay uncropped at 192px wide. Korean headings use `break-keep` + `text-balance`
- **Table of contents:** on `lg+` the same left rail as the home year nav lists the post's h2 headings; labels appear on hover/focus
- **Heading anchors:** h2/h3 get a `#` link in the left gutter (`rehype-autolink-headings`), visible on hover
- **Prose details:** links are brand orange with a faint primary-200 underline (offset 3px) that darkens on hover; images rounded-xl with no shadow; blockquote is a 2px gray-200 rule with gray-500 text; inline code 90% size on gray-100
- **Border radius hierarchy:**
  - sm: 4px — inline code, small chips
  - md: 8px — buttons, inputs, cards
  - lg: 12px — larger cards, dialogs
  - full: 9999px — tags, pills, avatars

## Motion
- **Approach:** Minimal-functional — only transitions that aid comprehension
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms) long(400-700ms)
- **Rules:**
  - Only animate `transform` and `opacity` (never layout properties)
  - Respect `prefers-reduced-motion`
  - No scroll-triggered entrance animations
  - The post-title header swap is the one scroll-triggered transition: it keeps the reader's place visible

## Accessibility
- **Focus:** 2px solid primary-500 outline with 2px offset on all focusable elements
- **Touch targets:** 44px minimum on all interactive elements
- **Color:** Never use color alone to convey information
- **Contrast:** WCAG AA minimum (4.5:1 body text, 3:1 large text and UI)
- **Heading hierarchy:** One H1 per page, no skipped levels
- **Images:** Descriptive alt text (not filenames)

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-03 | Initial design system created | Built from existing site analysis + competitive research (leerob.io, rauno.me, paco.me, brianlovin.com). Codified warm orange accent + stone neutrals as brand identity. |
| 2026-04-03 | Warm stone over blue-gray neutrals | Deliberate departure from dev blog conventions. Feels more personal, like paper. Matches the blog's range (tech + life). |
| 2026-04-03 | Keep Geist + Pretendard (replaced 2026-10-24) | Already working well for bilingual content. No reason to change what works. |
| 2026-04-03 | Prose width fixed to 65ch | Was 114ch (full 1024px container). Fixed for readability. |
| 2026-10-24 | Single 768px reading column, summary list home, centered post header | Layout structure adapted from chl.ee. Colors and fonts unchanged. Grid pages opt into `wide`. |
| 2026-10-24 | Asta Sans + JetBrains Mono, titles 30px | Font matched to chl.ee and the existing OG images. 36px titles felt too large, so H1 is 30px (24px mobile). |
| 2026-10-24 | Posts and gallery only, no footer | About, resume, projects, archives, series, and portfolio pages were removed; career content moved to the brain vault. Weekly, book, and movie entries became ordinary posts, and their old URLs redirect to `/posts/<slug>/`. |
| 2026-10-27 | Small centered icon footer | Pages ended with no signal and no place for the feed or contact. The footer holds only the copyright and three outbound links, so it adds no navigation. |
