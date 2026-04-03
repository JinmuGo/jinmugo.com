import { getCollection } from "astro:content"

export async function getEnglishApp() {
  return await getCollection("app", (item) => item.id === "about.en")
}

export async function getKoreanApp() {
  return await getCollection("app", (item) => item.id === "about")
}

export async function getEnglishResume() {
  return await getCollection("app", (item) => item.id === "resume.en")
}

export async function getKoreanResume() {
  return await getCollection("app", (item) => item.id === "resume")
}
