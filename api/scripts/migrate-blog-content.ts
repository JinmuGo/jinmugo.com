import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import matter from "gray-matter";
import * as path from "path";

// Supabase 클라이언트 설정
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
async function migrateBlogContent() {
  console.log("🚀 블로그 콘텐츠 마이그레이션 시작...\n");

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

  console.log("🎉 마이그레이션 완료!");
}

// 스크립트 실행
if (require.main === module) {
  migrateBlogContent().catch(console.error);
}
