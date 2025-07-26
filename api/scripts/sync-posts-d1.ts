/// <reference types="node" />

import fs from "node:fs";
import path from "node:path";
import { execSync } from "child_process";
import { PrismaClient } from "../generated/client";
import { PrismaD1 } from "@prisma/adapter-d1";

// D1 바인딩을 사용하는 Prisma 클라이언트 생성
const createPrismaClient = (d1: D1Database) => {
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ adapter });
};

async function syncPostsToD1() {
  console.log("🚀 Starting post sync to D1...");
  
  // 로컬 파일 시스템에서 슬러그 수집
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
    console.log("✅ No new slugs found to sync.");
    return;
  }

  console.log(`🔍 Found ${slugs.length} slugs to sync: ${slugs.join(", ")}`);

  // D1 데이터베이스에 직접 SQL로 삽입
  for (const slug of slugs) {
    try {
      // INSERT OR IGNORE를 사용하여 중복 방지
      const sql = `INSERT OR IGNORE INTO "Post" ("slug") VALUES ('${slug}');`;
      
      execSync(`npx wrangler d1 execute blog-db --command="${sql}" --remote`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log(`✅ Successfully inserted post with slug: ${slug}`);
    } catch (error) {
      console.error(`❌ Failed to insert post with slug: ${slug}`, error);
    }
  }

  console.log("✨ Post sync to D1 finished.");
}

syncPostsToD1()
  .catch((e) => {
    console.error("❌ An error occurred during the sync process:", e);
    process.exit(1);
  }); 