import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "../generated/client";

const prisma = new PrismaClient();

async function syncPosts() {
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

  for (const slug of slugs) {
    try {
      const _post = await prisma.post.upsert({
        where: { slug },
        create: {
          slug,
        },
        update: {},
      });
    } catch (_error) {}
  }
}

syncPosts()
  .catch((_e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
