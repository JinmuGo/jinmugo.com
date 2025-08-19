import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import matter from "gray-matter";
import * as path from "path";

// Supabase 클라이언트 설정
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 환경 변수가 없으면 시뮬레이션 모드로 실행
const isSimulationMode = !supabaseUrl || !supabaseServiceKey;

if (isSimulationMode) {
  console.log("⚠️  환경 변수가 설정되지 않아 시뮬레이션 모드로 실행됩니다.");
  console.log("   실제 DB 마이그레이션은 수행되지 않습니다.\n");
}

const supabase = isSimulationMode ? null : createClient(supabaseUrl, supabaseServiceKey);

interface FrontMatter {
  title?: string;
  date?: string;
  draft?: boolean;
  tags?: string[];
  lastmod?: string;
  category?: string;
  summary?: string;
}

interface BlogPost {
  slug: string;
  title?: string;
  date?: string;
  draft?: boolean;
  tags?: string[];
  lastmod?: string;
  category?: string;
  summary?: string;
  type: "post" | "memo";
}

// 디렉토리에서 모든 .md 파일을 재귀적으로 찾기
function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (item.endsWith(".md") && !item.endsWith(".en.md")) {
      files.push(fullPath);
    }
  }

  return files;
}

// 파일에서 블로그 포스트 데이터 추출 (draft가 false인 것만)
function extractPublishedBlogPost(filePath: string, type: "post" | "memo"): BlogPost | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const { data: frontMatter, content: markdownContent } = matter(content);

    // draft가 true이거나 명시적으로 false가 아닌 경우 제외
    if (frontMatter.draft === true) {
      console.log(`⏭️  Draft skipped: ${filePath}`);
      return null;
    }

    // slug는 디렉토리명에서 추출
    const dirName = path.basename(path.dirname(filePath));
    const fileName = path.basename(filePath, ".md");

    // 파일명이 디렉토리명과 다르면 파일명을 slug로 사용
    const slug = fileName !== dirName ? fileName : dirName;

    return {
      slug,
      title: frontMatter.title,
      date: frontMatter.date,
      draft: false, // 명시적으로 false로 설정
      tags: frontMatter.tags || [],
      lastmod: frontMatter.lastmod,
      category: frontMatter.category,
      summary: frontMatter.summary,
      type,
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return null;
  }
}

// Supabase에 포스트 삽입 또는 업데이트
async function upsertPost(post: BlogPost) {
  try {
    if (isSimulationMode) {
      console.log(`✅ [시뮬레이션] ${post.type}: ${post.slug} - ${post.title || "No title"}`);
      return true;
    }

    const { data, error } = await supabase!
      .from("posts")
      .upsert(
        {
          slug: post.slug,
          title: post.title,
          date: post.date ? new Date(post.date).toISOString() : null,
          draft: post.draft,
          tags: post.tags,
          lastmod: post.lastmod ? new Date(post.lastmod).toISOString() : null,
          category: post.category,
          summary: post.summary,
          type: post.type,
        },
        {
          onConflict: "slug",
        },
      )
      .select()
      .single();

    if (error) {
      console.error(`Error upserting post ${post.slug}:`, error);
      return false;
    }

    console.log(`✅ ${post.type}: ${post.slug} - ${post.title || "No title"}`);
    return true;
  } catch (error) {
    console.error(`Error upserting post ${post.slug}:`, error);
    return false;
  }
}

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
