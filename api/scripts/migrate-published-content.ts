import * as fs from "node:fs";
import * as path from "node:path";
import { createClient } from "@supabase/supabase-js";
import matter from "gray-matter";

// Supabase 클라이언트 설정
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 환경 변수가 없으면 시뮬레이션 모드로 실행
const isSimulationMode = !supabaseUrl || !supabaseServiceKey;

if (isSimulationMode) {
}

const supabase = isSimulationMode ? null : createClient(supabaseUrl, supabaseServiceKey);

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
    const { data: frontMatter } = matter(content);

    // draft가 true이거나 명시적으로 false가 아닌 경우 제외
    if (frontMatter.draft === true) {
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
  } catch (_error) {
    return null;
  }
}

// Supabase에 포스트 삽입 또는 업데이트
async function upsertPost(post: BlogPost) {
  try {
    if (isSimulationMode) {
      return true;
    }

    if (!supabase) {
      return false;
    }

    const { error } = await supabase
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
      return false;
    }
    return true;
  } catch (_error) {
    return false;
  }
}

// 메인 마이그레이션 함수
async function migratePublishedContent() {
  const blogObsidianPath = path.join(process.cwd(), "..", "blog", "blog_obsidian");

  if (!fs.existsSync(blogObsidianPath)) {
    return;
  }

  let _totalProcessed = 0;
  let _totalMigrated = 0;
  let _totalSkipped = 0;

  // 포스트 마이그레이션
  const postsDir = path.join(blogObsidianPath, "post");
  if (fs.existsSync(postsDir)) {
    const postFiles = findMarkdownFiles(postsDir);

    let _successCount = 0;
    let _skippedCount = 0;

    for (const filePath of postFiles) {
      _totalProcessed++;
      const post = extractPublishedBlogPost(filePath, "post");
      if (post) {
        const success = await upsertPost(post);
        if (success) {
          _successCount++;
          _totalMigrated++;
        }
      } else {
        _skippedCount++;
        _totalSkipped++;
      }
    }
  }

  // 메모 마이그레이션
  const memosDir = path.join(blogObsidianPath, "memo");
  if (fs.existsSync(memosDir)) {
    const memoFiles = findMarkdownFiles(memosDir);

    let _successCount = 0;
    let _skippedCount = 0;

    for (const filePath of memoFiles) {
      _totalProcessed++;
      const memo = extractPublishedBlogPost(filePath, "memo");
      if (memo) {
        const success = await upsertPost(memo);
        if (success) {
          _successCount++;
          _totalMigrated++;
        }
      } else {
        _skippedCount++;
        _totalSkipped++;
      }
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  migratePublishedContent();
}
