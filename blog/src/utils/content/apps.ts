import { getCollection } from "astro:content"

export async function getEnglishApp() {
  return await getCollection("app", (item) => item.slug === "abouten")
}

export async function getKoreanApp() {
  return await getCollection("app", (item) => item.slug === "about")
}

export async function getEnglishPortfolio() {
  return await getCollection("app", (item) => item.slug === "portfolioen")
}

export async function getKoreanPortfolio() {
  return await getCollection("app", (item) => item.slug === "portfolio")
}

export async function getEnglishResume() {
  return await getCollection(
    "app",
    (item) =>
      item.id === "app/resume.en.mdx" || item.slug === "resume-en" || item.slug === "resumeen",
  )
}

export async function getKoreanResume() {
  return await getCollection(
    "app",
    (item) => item.id === "app/resume.mdx" || item.slug === "resume",
  )
}
