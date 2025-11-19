/**
 * Typography Scale System
 *
 * Provides consistent typography classes across the portfolio.
 * Eliminates inline styles and creates a maintainable type hierarchy.
 */

export const typography = {
  // Display levels - Hero sections, main headings
  displayLarge: "text-5xl md:text-6xl font-bold tracking-tight leading-tight",
  displayMedium: "text-4xl md:text-5xl font-semibold tracking-tight leading-tight",

  // Heading levels - Section titles, card headers
  headingLarge: "text-3xl md:text-4xl font-semibold tracking-tight",
  headingMedium: "text-2xl md:text-3xl font-semibold",
  headingSmall: "text-xl md:text-2xl font-semibold",

  // Title levels - Project titles, list items
  titleLarge: "text-2xl font-semibold tracking-tight leading-tight",
  titleMedium: "text-xl font-semibold",
  titleSmall: "text-lg font-semibold",

  // Body text
  bodyLarge: "text-lg leading-relaxed",
  bodyMedium: "text-base leading-relaxed",
  bodySmall: "text-sm leading-normal",

  // Labels and metadata
  labelLarge: "text-sm font-medium tracking-wide",
  labelMedium: "text-xs font-medium tracking-wide uppercase",
  labelSmall: "text-xs tracking-widest uppercase",

  // Captions and helper text
  caption: "text-xs leading-normal",
  captionSmall: "text-[0.625rem] leading-tight",
} as const

export type TypographyKey = keyof typeof typography
