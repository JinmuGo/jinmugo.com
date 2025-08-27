import * as fs from "node:fs";
import * as path from "node:path";
import { createClient } from "@supabase/supabase-js";
import matter from "gray-matter";

export interface FrontMatter {
  title?: string;
  date?: string;
  draft?: boolean;
  tags?: string[];
  lastmod?: string;
  category?: string;
  summary?: string;
}

export interface BlogPost {
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

// Supabase 초기화 및 시뮬레이션 모드 안내 출력
export function initSupabase(): {
  isSimulationMode: boolean;
  supabase: ReturnType<typeof createClient> | null;
} {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const isSimulationMode = !supabaseUrl || !supabaseServiceKey;

  if (isSimulationMode) {
    console.log("⚠️  환경 변수가 설정되지 않아 시뮬레이션 모드로 실행됩니다.");
    console.log("   실제 DB 마이그레이션은 수행되지 않습니다.\n");
  }

  const supabase = isSimulationMode
    ? null
    : createClient(supabaseUrl as string, supabaseServiceKey as string);
  return { isSimulationMode, supabase };
}

// 디렉토리에서 모든 .md 파일을 재귀적으로 찾기
export function findMarkdownFiles(dir: string): string[] {
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
export function extractBlogPost(filePath: string, type: "post" | "memo"): BlogPost | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const { data: frontMatter } = matter(content);

    // draft가 true인 경우 제외
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
      title: (frontMatter as FrontMatter).title,
      date: (frontMatter as FrontMatter).date,
      draft: false, // 명시적으로 false로 설정
      tags: (frontMatter as FrontMatter).tags || [],
      lastmod: (frontMatter as FrontMatter).lastmod,
      category: (frontMatter as FrontMatter).category,
      summary: (frontMatter as FrontMatter).summary,
      type,
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return null;
  }
}

// Supabase에 포스트 삽입 또는 업데이트 함수 생성
export function createUpsertPost(
  supabase: ReturnType<typeof createClient> | null,
  isSimulationMode: boolean,
) {
  if (isSimulationMode || !supabase) {
    return async function upsertPost(post: BlogPost): Promise<boolean> {
      console.log(`✅ [시뮬레이션] ${post.type}: ${post.slug} - ${post.title || "No title"}`);
      return true;
    };
  }

  return async function upsertPost(post: BlogPost): Promise<boolean> {
    try {
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
        console.error(`Error upserting post ${post.slug}:`, error);
        return false;
      }

      console.log(`✅ ${post.type}: ${post.slug} - ${post.title || "No title"}`);
      return true;
    } catch (error) {
      console.error(`Error upserting post ${post.slug}:`, error);
      return false;
    }
  };
}
