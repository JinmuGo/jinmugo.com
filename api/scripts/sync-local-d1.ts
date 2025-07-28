import fs from "node:fs";
import path from "node:path";

async function syncLocalD1() {
  const obsidianRoot = path.join(process.cwd(), "../blog/blog_obsidian");
  const postDir = path.join(obsidianRoot, "post");
  const memoDir = path.join(obsidianRoot, "memo");

  const dirsToScan = [postDir, memoDir];
  const slugs: string[] = [];

  for (const dir of dirsToScan) {
    if (!fs.existsSync(dir)) {
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
    return;
  }

  // SQL INSERT 문 생성
  const insertStatements = slugs
    .map((slug) => `INSERT OR IGNORE INTO Post (slug) VALUES ('${slug}')`)
    .join(";\n");

  // 임시 SQL 파일 생성
  const sqlFile = path.join(process.cwd(), "temp_sync.sql");
  fs.writeFileSync(sqlFile, insertStatements);

  // 자동으로 실행
  const { execSync } = require("node:child_process");
  try {
    execSync(`npx wrangler d1 execute blog-db --local --file=${sqlFile}`, { stdio: "inherit" });
  } catch (_error) {
  } finally {
    // 임시 파일 삭제
    fs.unlinkSync(sqlFile);
  }
}

syncLocalD1().catch((_e) => {
  process.exit(1);
});
