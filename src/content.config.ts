import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

const CATEGORIES = [
  "develop",
  "experience",
  "cloud",
  "thinking",
  "health",
  "tech",
  "network",
  "linux",
  "algorithm",
] as const

const categorySchema = z.enum(CATEGORIES)

const stripExtension = ({ entry }: { entry: string }) => entry.replace(/\.mdx?$/, "")

const postCollection = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/post",
    generateId: stripExtension,
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // null 허용 + 기본값 []
    tags: z.preprocess((v: unknown) => v ?? undefined, z.array(z.string()).optional().default([])),
    // null 허용
    category: categorySchema.nullish(),
    summary: z.preprocess(
      (value: unknown) => (value === null ? undefined : value),
      z.string().optional(),
    ),
    // null을 undefined로 변환 후 기본값 false 적용
    draft: z.preprocess((v: unknown) => v ?? undefined, z.boolean().default(false)),
    // null 허용
    lastmod: z.preprocess((v: unknown) => v ?? undefined, z.coerce.date().optional()),
    series: z.string().nullish(),
    seriesOrder: z.preprocess((v: unknown) => v ?? undefined, z.number().optional()),
    banner: z.string().nullish(),
  }),
})

export const collections = {
  post: postCollection,
}
