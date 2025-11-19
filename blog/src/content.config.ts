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
    summary: z.preprocess(
      (value: unknown) => (value === null ? undefined : value),
      z.string().optional(),
    ),
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
  image: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  timeline: z.string(),
  github: z.string(),
  live: z.string(),
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
  github: z.string(),
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
  type: "content",
  schema: z.object({
    name: z.string(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    philosophy: z.string().optional(),
    contact: z
      .object({
        email: z.string(),
        github: z.string(),
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

const ResumeExperienceSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  award: z.string().optional(),
  description: z.string(),
  github: z.string().optional(),
  news: z.string().optional(),
  blog: z.string().optional(),
})

const ResumeOpenSourceSchema = z.object({
  name: z.string(),
  description: z.string(),
  role: z.string().optional(),
  tech: z.string().optional(),
  github: z.string().optional(),
  githubRepo: z.string().optional(),
  obsidianPluginId: z.string().optional(),
  stars: z.number().optional(),
})

const ResumeSkillSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
})

const ResumeCertificationSchema = z.object({
  name: z.string(),
  link: z.string().optional(),
  image: z.string().optional(),
})

const ResumeProjectSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  period: z.string(),
  link: z.string().optional(),
  image: z.string().optional(),
})

const ResumeSectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("experiences"),
    title: z.string(),
    titleClass: z.string().optional(),
    data: z.array(ResumeExperienceSchema),
  }),
  z.object({
    type: z.literal("opensource"),
    title: z.string(),
    titleClass: z.string().optional(),
    data: z.array(ResumeOpenSourceSchema),
  }),
  z.object({
    type: z.literal("skills"),
    title: z.string(),
    titleClass: z.string().optional(),
    data: z.array(ResumeSkillSchema),
  }),
  z.object({
    type: z.literal("certifications"),
    title: z.string(),
    titleClass: z.string().optional(),
    data: z.array(ResumeCertificationSchema),
  }),
  z.object({
    type: z.literal("projects"),
    title: z.string(),
    titleClass: z.string().optional(),
    data: z.array(ResumeProjectSchema),
  }),
])

const resumeCollection = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    philosophy: z.string(),
    contact: z.object({
      email: z.string(),
      github: z.string(),
    }),
    sections: z.array(ResumeSectionSchema),
  }),
})

export const collections = {
  post: postCollection,
  memo: memoCollection,
  app: appCollection,
  resume: resumeCollection,
}
