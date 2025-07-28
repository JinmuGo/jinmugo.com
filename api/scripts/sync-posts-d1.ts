/// <reference types="node" />

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "../generated/client";

// D1 바인딩을 사용하는 Prisma 클라이언트 생성
const _createPrismaClient = (d1: D1Database) => {
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ adapter });
};

async function syncPostsToD1() {
  // 로컬 파일 시스템에서 슬러그 수집
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

  // D1 데이터베이스에 직접 SQL로 삽입
  for (const slug of slugs) {
    try {
      // INSERT OR IGNORE를 사용하여 중복 방지
      const sql = `INSERT OR IGNORE INTO "Post" ("slug") VALUES ('${slug}');`;

      execSync(`npx wrangler d1 execute blog-db --command="${sql}" --remote`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch (_error) {}
  }
}

syncPostsToD1().catch((_e) => {
  process.exit(1);
});
