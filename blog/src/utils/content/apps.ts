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
