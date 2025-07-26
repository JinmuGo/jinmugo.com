import fs from "node:fs";
import path from "node:path";

async function syncLocalD1() {
	console.log("🚀 Starting local D1 post sync...");
	const obsidianRoot = path.join(process.cwd(), "../blog/blog_obsidian");
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
		console.log("✅ No slugs found to sync.");
		return;
	}

	console.log(`🔍 Found ${slugs.length} slugs to sync: ${slugs.join(", ")}`);

	// SQL INSERT 문 생성
	const insertStatements = slugs.map(slug => 
		`INSERT OR IGNORE INTO Post (slug) VALUES ('${slug}')`
	).join(';\n');

	// 임시 SQL 파일 생성
	const sqlFile = path.join(process.cwd(), 'temp_sync.sql');
	fs.writeFileSync(sqlFile, insertStatements);

	console.log("📝 Generated SQL file for local D1 sync");
	console.log("💡 Run the following command to sync to local D1:");
	console.log(`npx wrangler d1 execute blog-db --local --file=${sqlFile}`);

	// 자동으로 실행
	const { execSync } = require('child_process');
	try {
		execSync(`npx wrangler d1 execute blog-db --local --file=${sqlFile}`, { stdio: 'inherit' });
		console.log("✅ Successfully synced posts to local D1 database");
	} catch (error) {
		console.error("❌ Failed to sync posts to local D1 database:", error);
	} finally {
		// 임시 파일 삭제
		fs.unlinkSync(sqlFile);
	}
}

syncLocalD1()
	.catch((e) => {
		console.error("❌ An error occurred during the sync process:", e);
		process.exit(1);
	}); 