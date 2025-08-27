import * as fs from "node:fs";
import * as path from "node:path";
import {
  createUpsertPost,
  extractBlogPost as extractPublishedBlogPost,
  findMarkdownFiles,
  initSupabase,
} from "./blog-migrate-utils";

const { isSimulationMode, supabase } = initSupabase();
const upsertPost = createUpsertPost(supabase, isSimulationMode);

// 메인 마이그레이션 함수
async function migratePublishedContent() {
  console.log("🚀 Published 블로그 콘텐츠 마이그레이션 시작...\n");
  console.log("📋 Draft가 false인 포스트와 메모만 마이그레이션합니다.\n");

  const blogObsidianPath = path.join(process.cwd(), "..", "blog", "blog_obsidian");

  if (!fs.existsSync(blogObsidianPath)) {
    console.error("❌ blog_obsidian 디렉토리를 찾을 수 없습니다.");
    return;
  }

  let totalProcessed = 0;
  let totalMigrated = 0;
  let totalSkipped = 0;

  // 포스트 마이그레이션
  const postsDir = path.join(blogObsidianPath, "post");
  if (fs.existsSync(postsDir)) {
    console.log("📝 포스트 마이그레이션 중...");
    const postFiles = findMarkdownFiles(postsDir);

    let successCount = 0;
    let skippedCount = 0;

    for (const filePath of postFiles) {
      totalProcessed++;
      const post = extractPublishedBlogPost(filePath, "post");
      if (post) {
        const success = await upsertPost(post);
        if (success) {
          successCount++;
          totalMigrated++;
        }
      } else {
        skippedCount++;
        totalSkipped++;
      }
    }
    console.log(
      `✅ 포스트 마이그레이션 완료: ${successCount} migrated, ${skippedCount} skipped (draft)\n`,
    );
  }

  // 메모 마이그레이션
  const memosDir = path.join(blogObsidianPath, "memo");
  if (fs.existsSync(memosDir)) {
    console.log("📌 메모 마이그레이션 중...");
    const memoFiles = findMarkdownFiles(memosDir);

    let successCount = 0;
    let skippedCount = 0;

    for (const filePath of memoFiles) {
      totalProcessed++;
      const memo = extractPublishedBlogPost(filePath, "memo");
      if (memo) {
        const success = await upsertPost(memo);
        if (success) {
          successCount++;
          totalMigrated++;
        }
      } else {
        skippedCount++;
        totalSkipped++;
      }
    }
    console.log(
      `✅ 메모 마이그레이션 완료: ${successCount} migrated, ${skippedCount} skipped (draft)\n`,
    );
  }

  console.log("📊 마이그레이션 요약:");
  console.log(`   - 총 처리된 파일: ${totalProcessed}`);
  console.log(`   - 마이그레이션된 파일: ${totalMigrated}`);
  console.log(`   - 건너뛴 파일 (draft): ${totalSkipped}`);
  console.log("\n🎉 Published 콘텐츠 마이그레이션 완료!");
}

// 스크립트 실행
if (require.main === module) {
  migratePublishedContent().catch(console.error);
}
