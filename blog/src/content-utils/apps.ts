import { getCollection } from "astro:content";

export async function getEnglishApp() {
	return await getCollection("app", (item) => item.slug === "abouten");
}

export async function getKoreanApp() {
	return await getCollection("app", (item) => item.slug === "about");
} 