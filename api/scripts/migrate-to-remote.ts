import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import * as fs from "fs";
import matter from "gray-matter";
import * as path from "path";

dotenv.config();

// 원격 Supabase 클라이언트 설정
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface FrontMatter {
  title?: string;
  date?: string;
  draft?: boolean;
  tags?: string[];
  lastmod?: string;
  category?: string;
  withAI?: boolean;
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
  withAI?: boolean;
  summary?: string;
  type: "post" | "memo";
  content: string;
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

// 파일에서 블로그 포스트 데이터 추출
function extractBlogPost(filePath: string, type: "post" | "memo"): BlogPost | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const { data: frontMatter, content: markdownContent } = matter(content);

    // slug는 디렉토리명에서 추출
    const dirName = path.basename(path.dirname(filePath));
    const fileName = path.basename(filePath, ".md");

    // 파일명이 디렉토리명과 다르면 파일명을 slug로 사용
    const slug = fileName !== dirName ? fileName : dirName;

    return {
      slug,
      title: frontMatter.title,
      date: frontMatter.date,
      draft: frontMatter.draft || false,
      tags: frontMatter.tags || [],
      lastmod: frontMatter.lastmod,
      category: frontMatter.category,
      withAI: frontMatter.withAI || false,
      summary: frontMatter.summary,
      type,
      content: markdownContent.trim(),
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return null;
  }
}

// Supabase에 포스트 삽입 또는 업데이트
async function upsertPost(post: BlogPost) {
  try {
    const { data, error } = await supabase
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
          withAI: post.withAI,
          summary: post.summary,
          type: post.type,
          content: post.content,
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
async function migrateToRemote() {
  console.log("🚀 원격 Supabase DB로 블로그 콘텐츠 마이그레이션 시작...\n");

  const blogObsidianPath = path.join(process.cwd(), "..", "blog", "blog_obsidian");

  if (!fs.existsSync(blogObsidianPath)) {
    console.error("❌ blog_obsidian 디렉토리를 찾을 수 없습니다.");
    return;
  }

  // 원격 DB 연결 확인
  try {
    const { data, error } = await supabase.from("posts").select("count").limit(1);
    if (error) {
      console.error("❌ 원격 DB 연결 실패:", error.message);
      console.log("💡 다음을 확인하세요:");
      console.log("   1. SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 올바르게 설정되었는지");
      console.log("   2. 원격 Supabase 프로젝트가 활성화되어 있는지");
      console.log("   3. posts 테이블이 생성되어 있는지");
      return;
    }
    console.log("✅ 원격 DB 연결 성공\n");
  } catch (error) {
    console.error("❌ 원격 DB 연결 실패:", error);
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
        // API 제한을 피하기 위해 잠시 대기
        await new Promise((resolve) => setTimeout(resolve, 100));
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
        // API 제한을 피하기 위해 잠시 대기
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    console.log(`✅ 메모 마이그레이션 완료: ${successCount}/${memoFiles.length}\n`);
  }

  console.log("🎉 원격 DB 마이그레이션 완료!");
  console.log("💡 이제 원격 Supabase 프로젝트에서 데이터를 확인할 수 있습니다.");
}

// 스크립트 실행
if (require.main === module) {
  migrateToRemote().catch(console.error);
}
