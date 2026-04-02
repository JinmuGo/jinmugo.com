/**
 * Spacing System
 *
 * Provides consistent spacing/padding across portfolio sections.
 * Creates visual rhythm and professional polish.
 */

export const spacing = {
  // Section spacing - Main content sections
  section: "py-20 md:py-28 px-6 md:px-8 lg:px-12",
  sectionTight: "py-16 md:py-20 px-6 md:px-8 lg:px-12",
  sectionLoose: "py-24 md:py-32 px-6 md:px-8 lg:px-12",

  // Container spacing
  container: "max-w-7xl mx-auto",
  containerNarrow: "max-w-4xl mx-auto",
  containerWide: "max-w-screen-2xl mx-auto",

  // Internal spacing
  contentPadding: "px-6 md:px-8",
  contentPaddingLarge: "px-8 md:px-12",
} as const

export type SpacingKey = keyof typeof spacing
