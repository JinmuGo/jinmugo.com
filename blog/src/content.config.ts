import { defineCollection, z } from "astro:content"

const categorySchema = z.enum([
  "develop",
  "experience",
  "cloud",
  "movie",
  "book",
  "thinking",
  "health",
  "tech",
  "network",
  "linux",
])

const postCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // null 허용 + 기본값 []
    tags: z.preprocess((v: unknown) => v ?? undefined, z.array(z.string()).optional().default([])),
    // null 허용
    category: categorySchema.nullish(),
    summary: z.string().or(z.undefined()),
    // null을 undefined로 변환 후 기본값 false 적용
    draft: z.preprocess((v: unknown) => v ?? undefined, z.boolean().default(false)),
    // null 허용
    lastmod: z.coerce.date().optional(),
    series: z.string().nullish(),
    seriesOrder: z.preprocess((v: unknown) => v ?? undefined, z.number().optional()),
    banner: z.string().nullish(),
  }),
})

const memoCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // null을 undefined로 변환 후 기본값 false 적용
    draft: z.preprocess((v: unknown) => v ?? undefined, z.boolean().default(false)),
    // null 허용 + 기본값 []
    tags: z.preprocess((v: unknown) => v ?? undefined, z.array(z.string()).optional().default([])),
    // null 허용
    category: categorySchema.nullish(),
    summary: z.string().or(z.undefined()),
    lastmod: z.preprocess((v: unknown) => v ?? undefined, z.coerce.date().optional()),
  }),
})

const appCollection = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    // Portfolio 관련 필드들
    philosophy: z.string().optional(),
    contact: z.object({
      email: z.string(),
      github: z.string(),
    }).optional(),
    sections: z.array(z.any()).optional(),
  }).passthrough(), // 정의되지 않은 필드도 허용
})

export const collections = {
  post: postCollection,
  memo: memoCollection,
  app: appCollection,
}
