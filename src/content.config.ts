import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

const CATEGORIES = [
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

const memoCollection = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/memo",
    generateId: stripExtension,
  }),
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
    series: z.string().nullish(),
    seriesOrder: z.preprocess((v: unknown) => v ?? undefined, z.number().optional()),
  }),
})

// Portfolio 타입 정의
const ProjectMetricsSchema = z.object({
  users: z.string().optional(),
  performance: z.string().optional(),
  impact: z.string().optional(),
})

const ProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  title: z.string().optional(),
  tagline: z.string(),
  description: z.string(),
  problem: z.string(),
  role: z.string(),
  responsibilities: z.array(z.string()),
  image: z.string().optional(),
  category: z.string(),
  tags: z.array(z.string()),
  timeline: z.string(),
  github: z.string().optional(),
  live: z.string().optional(),
  exhibitNumber: z.string(),
  year: z.number(),
  metrics: ProjectMetricsSchema.optional(),
  award: z.string().optional(),
})

const SkillItemSchema = z.object({
  name: z.string(),
  level: z.enum(["Expert", "Advanced", "Intermediate", "Beginner"]),
})

const SkillCategorySchema = z.object({
  category: z.string(),
  items: z.array(SkillItemSchema),
})

const OpenSourceSchema = z.object({
  name: z.string(),
  description: z.string(),
  role: z.string(),
  tech: z.string(),
  github: z.string().optional(),
  live: z.string().optional(),
  githubRepo: z.string().optional(),
  obsidianPluginId: z.string().optional(),
})

const CertificationSchema = z.object({
  name: z.string(),
  link: z.string().optional(),
})

const SectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("experiences"),
    title: z.string(),
    data: z.array(ProjectSchema),
  }),
  z.object({
    type: z.literal("projects"),
    title: z.string(),
    data: z.array(ProjectSchema),
  }),
  z.object({
    type: z.literal("opensource"),
    title: z.string(),
    data: z.array(OpenSourceSchema),
  }),
  z.object({
    type: z.literal("skills"),
    title: z.string(),
    data: z.array(SkillCategorySchema),
  }),
  z.object({
    type: z.literal("certifications"),
    title: z.string(),
    data: z.array(CertificationSchema),
  }),
])

const appCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/app", generateId: stripExtension }),
  schema: z.object({
    name: z.string(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    philosophy: z.string().optional(),
    contact: z
      .object({
        email: z.string(),
        github: z.string().optional(),
        live: z.string().optional(),
      })
      .optional(),
    hero: z
      .object({
        tagline: z.string(),
        title: z.string(),
        description: z.string().optional(),
      })
      .optional(),
    about: z
      .object({
        bio: z.array(z.string()),
        caption: z.string(),
      })
      .optional(),
    sections: z.array(SectionSchema).optional(),
  }),
})

export const collections = {
  post: postCollection,
  memo: memoCollection,
  app: appCollection,
}
