import { defineCollection, z } from "astro:content";

const categorySchema = z.enum([
  "develop",
  "experience",
  "cloud",
  "movie",
  "book",
  "thinking",
  "health",
]);

const postCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    category: categorySchema.optional(),
    summary: z.string().optional(),
    draft: z.boolean().default(false),
    lastmod: z.coerce.date().optional(),
    bannerOnlyText: z.boolean().default(false),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    withAI: z.boolean().optional(),
    banner: z.string().optional(),
  }),
});

const memoCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
    category: categorySchema.optional(),
    summary: z.string().optional(),
    lastmod: z.coerce.date().optional(),
  }),
});

const appCollection = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    bio: z.string(),
    avatar: z.string(),
  }),
});

export const collections = {
  post: postCollection,
  memo: memoCollection,
  app: appCollection,
};
