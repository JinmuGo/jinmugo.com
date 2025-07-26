import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "../generated/client";

const prisma = new PrismaClient();

async function syncPosts() {
	console.log("🚀 Starting post sync...");
	const obsidianRoot = path.join(process.cwd(), "blog_obsidian");
	const postDir = path.join(obsidianRoot, "post");
	const memoDir = path.join(obsidianRoot, "memo");

	const dirsToScan = [postDir, memoDir];
	const slugs: string[] = [];

	for (const dir of dirsToScan) {
		if (!fs.existsSync(dir)) {
			console.warn(`⚠️ Directory not found: ${dir}. Skipping.`);
			continue;
		}

		const entries = fs.readdirSync(dir, { withFileTypes: true });
		for (const entry of entries) {
			if (entry.isDirectory()) {
				slugs.push(entry.name);
			}
		}
	}

	if (slugs.length === 0) {
		console.log("✅ No new slugs found to sync.");
		return;
	}

	console.log(`🔍 Found ${slugs.length} slugs to sync: ${slugs.join(", ")}`);

	for (const slug of slugs) {
		try {
			const post = await prisma.post.upsert({
				where: { slug },
				create: {
					slug,
				},
				update: {},
			});
			console.log(`✅ Successfully upserted post with slug: ${post.slug}`);
		} catch (error) {
			console.error(`❌ Failed to upsert post with slug: ${slug}`, error);
		}
	}

	console.log("✨ Post sync finished.");
}

syncPosts()
	.catch((e) => {
		console.error("❌ An error occurred during the sync process:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		console.log("🔌 Prisma client disconnected.");
	});
