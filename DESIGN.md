# Design System — jinmu.me

## Product Context
- **What this is:** Bilingual (Korean/English) personal developer blog with technical deep-dives, running logs, movie reviews, and philosophical essays
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
- **Display/Hero:** Geist (700) — clean, geometric, distinctive. Good Latin rendering.
- **Body:** Pretendard (300/400/600) — excellent Korean readability, designed for screens, good Latin fallback
- **UI/Labels:** Pretendard (same as body)
- **Data/Tables:** Geist with `font-variant-numeric: tabular-nums`
- **Code:** Geist Mono
- **Loading:** Geist via Next.js font optimization (already configured). Pretendard self-hosted with `font-display: swap`.
- **Scale (Major Third 1.25):**
  - xs: 12px — captions, timestamps
  - sm: 14px — metadata, labels, small text
  - base: 16px — UI text, navigation
  - md: 18px — body text (article content)
  - lg: 20px — large body, intro text
  - xl: 24px — H3
  - 2xl: 30px — H2
  - 3xl: 36px — H1 (article title)
  - 4xl: 48px — hero/display
- **Line height:** 1.7-1.8 for body (Korean text needs more), 1.1-1.3 for headings
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
- **Dark mode strategy:** Surface inversion using stone scale. Reduce primary saturation slightly (#F59E0B in dark). Text off-white (#F5F5F0), not pure white. `color-scheme: light dark` on html.

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
- **Reading column:** `max-w-3xl` (768px) with `px-4 sm:px-6`. Default for every page using `Layout.astro`
- **Wide pages:** `<Layout wide>` keeps the 1024px (`max-w-5xl`) container for grid pages: gallery, portfolio, resume, projects, library lists
- **Header:** small logo (96px), 14px gray nav, 20px icons. Quiet chrome; content is the loudest thing on the page
- **Home list:** one row per post — title (20px semibold), summary (line-clamp-2, gray-600), date (14px gray-500). Rows separated by gray-100 dividers, `py-6`, hover fades the row to 60% opacity
- **Year nav:** on `lg+` a fixed left rail of short lines links to the first post of each year; year labels appear on hover/focus
- **Post header:** centered title, summary, landscape banner (rounded-xl, full column width), then category · author · date. Korean headings use `break-keep` + `text-balance`
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
  - Header slider animation is the one exception: intentional UX for scroll-to-top

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
| 2026-04-03 | Keep Geist + Pretendard | Already working well for bilingual content. No reason to change what works. |
| 2026-04-03 | Prose width fixed to 65ch | Was 114ch (full 1024px container). Fixed for readability. |
| 2026-10-24 | Single 768px reading column, summary list home, centered post header | Layout structure adapted from chl.ee. Colors and fonts unchanged. Grid pages opt into `wide`. |
