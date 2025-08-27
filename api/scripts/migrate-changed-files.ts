import * as fs from "node:fs";
import * as path from "node:path";
import {
  createUpsertPost,
  extractBlogPost,
  findMarkdownFiles,
  initSupabase,
} from "./blog-migrate-utils";

const { isSimulationMode, supabase } = initSupabase();
const upsertPost = createUpsertPost(supabase, isSimulationMode);

// 파일 경로에서 포스트 타입 결정
function getPostType(filePath: string): "post" | "memo" | null {
  const normalizedPath = path.normalize(filePath);

  if (normalizedPath.includes("/post/")) {
    return "post";
  } else if (normalizedPath.includes("/memo/")) {
    return "memo";
  }

  return null;
}

// 메인 마이그레이션 함수
async function migrateChangedFiles() {
  console.log("🚀 변경된 파일 마이그레이션 시작...\n");

  // GitHub Actions에서 전달받은 변경된 파일 목록
  const changedFiles = process.env.CHANGED_FILES;

  if (!changedFiles) {
    console.log("❌ 변경된 파일 목록이 없습니다. 전체 마이그레이션을 실행합니다.");
    // 전체 마이그레이션 실행
    const blogObsidianPath = path.join(process.cwd(), "..", "blog", "blog_obsidian");

    if (!fs.existsSync(blogObsidianPath)) {
      console.error("❌ blog_obsidian 디렉토리를 찾을 수 없습니다.");
      return;
    }

    // 포스트 마이그레이션
    const postsDir = path.join(blogObsidianPath, "post");
    if (fs.existsSync(postsDir)) {
      console.log("📝 포스트 마이그레이션 중...");
      const postFiles = findMarkdownFiles(postsDir);
      let successCount = 0;
      for (const filePath of postFiles) {
        const post = extractBlogPost(filePath, "post");
        if (post) {
          const success = await upsertPost(post);
          if (success) {
            successCount++;
          }
        }
      }
      console.log(`✅ 포스트 마이그레이션 완료: ${successCount}/${postFiles.length}\n`);
    }

    // 메모 마이그레이션
    const memosDir = path.join(blogObsidianPath, "memo");
    if (fs.existsSync(memosDir)) {
      console.log("📌 메모 마이그레이션 중...");
      const memoFiles = findMarkdownFiles(memosDir);
      let successCount = 0;
      for (const filePath of memoFiles) {
        const memo = extractBlogPost(filePath, "memo");
        if (memo) {
          const success = await upsertPost(memo);
          if (success) {
            successCount++;
          }
        }
      }
      console.log(`✅ 메모 마이그레이션 완료: ${successCount}/${memoFiles.length}\n`);
    }
    return;
  }

  const files = changedFiles.split("\n").filter((file) => file.trim());
  console.log(`📋 변경된 파일 ${files.length}개 감지됨:\n`);

  let successCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    // .md 파일만 처리 (영어 버전 제외)
    if (!file.endsWith(".md") || file.endsWith(".en.md")) {
      console.log(`⏭️  건너뜀: ${file} (영어 버전 또는 마크다운이 아님)`);
      skippedCount++;
      continue;
    }

    // blog_obsidian 디렉토리 내의 파일만 처리
    if (!file.includes("blog_obsidian")) {
      console.log(`⏭️  건너뜀: ${file} (blog_obsidian 디렉토리가 아님)`);
      skippedCount++;
      continue;
    }

    const postType = getPostType(file);
    if (!postType) {
      console.log(`⏭️  건너뜀: ${file} (포스트 타입을 결정할 수 없음)`);
      skippedCount++;
      continue;
    }

    const fullPath = path.join(process.cwd(), "..", file);

    if (!fs.existsSync(fullPath)) {
      console.log(`❌ 파일을 찾을 수 없음: ${fullPath}`);
      continue;
    }

    const post = extractBlogPost(fullPath, postType);
    if (post) {
      const success = await upsertPost(post);
      if (success) {
        successCount++;
      }
      // API 제한을 피하기 위해 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log(`\n🎉 마이그레이션 완료!`);
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`⏭️  건너뜀: ${skippedCount}개`);
  console.log(`📊 총 처리: ${files.length}개`);
}

// findMarkdownFiles 는 유틸에서 가져옵니다 (전체 마이그레이션용)

// 스크립트 실행
if (require.main === module) {
  migrateChangedFiles().catch(console.error);
}
