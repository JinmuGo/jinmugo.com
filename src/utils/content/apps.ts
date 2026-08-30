import { type CollectionEntry, getCollection } from "astro:content"

export async function getEnglishApp(): Promise<CollectionEntry<"app">[]> {
  return await getCollection("app", (item: CollectionEntry<"app">) => item.id === "about.en")
}

export async function getKoreanApp(): Promise<CollectionEntry<"app">[]> {
  return await getCollection("app", (item: CollectionEntry<"app">) => item.id === "about")
}

export async function getEnglishResume(): Promise<CollectionEntry<"app">[]> {
  return await getCollection("app", (item: CollectionEntry<"app">) => item.id === "resume.en")
}

export async function getKoreanResume(): Promise<CollectionEntry<"app">[]> {
  return await getCollection("app", (item: CollectionEntry<"app">) => item.id === "resume")
}
