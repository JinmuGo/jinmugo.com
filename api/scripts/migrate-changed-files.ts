import * as fs from "node:fs";
import * as path from "node:path";
import matter from "gray-matter";
import PocketBase from "pocketbase";

// PocketBase 클라이언트 설정
const pbUrl = process.env.PB_URL || "http://127.0.0.1:8090";
const pb = new PocketBase(pbUrl);

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

// 파일에서 블로그 포스트 데이터 추출 (draft가 false인 것만)
function extractBlogPost(filePath: string, type: "post" | "memo"): BlogPost | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const { data: frontMatter } = matter(content);

    // draft가 true인 경우 제외
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

// PocketBase에 포스트 삽입 또는 업데이트
async function upsertPost(post: BlogPost): Promise<boolean> {
  try {
    // 기존 포스트 확인
    const existingPosts = await pb.collection("posts").getList(1, 1, {
      filter: `slug = "${post.slug}"`,
    });

    const postData = {
      slug: post.slug,
      title: post.title || "",
      date: post.date ? new Date(post.date).toISOString() : "",
      draft: post.draft || false,
      tags: post.tags || [],
      lastmod: post.lastmod ? new Date(post.lastmod).toISOString() : "",
      category: post.category || "",
      summary: post.summary || "",
      type: post.type,
    };

    if (existingPosts.items.length > 0) {
      // 업데이트
      await pb.collection("posts").update(existingPosts.items[0].id, postData);
    } else {
      // 생성
      await pb.collection("posts").create(postData);
    }

    return true;
  } catch (_error) {
    return false;
  }
}

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

// 디렉토리에서 모든 .md 파일을 재귀적으로 찾기 (전체 마이그레이션용)
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

// 메인 마이그레이션 함수
async function migrateChangedFiles() {
  // GitHub Actions에서 전달받은 변경된 파일 목록
  const changedFiles = process.env.CHANGED_FILES;

  if (!changedFiles) {
    // 전체 마이그레이션 실행
    const blogObsidianPath = path.join(process.cwd(), "..", "blog", "blog_obsidian");

    if (!fs.existsSync(blogObsidianPath)) {
      return;
    }

    // 포스트 마이그레이션
    const postsDir = path.join(blogObsidianPath, "post");
    if (fs.existsSync(postsDir)) {
      const postFiles = findMarkdownFiles(postsDir);
      let _successCount = 0;
      for (const filePath of postFiles) {
        const post = extractBlogPost(filePath, "post");
        if (post) {
          const success = await upsertPost(post);
          if (success) {
            _successCount++;
          }
        }
      }
    }

    // 메모 마이그레이션
    const memosDir = path.join(blogObsidianPath, "memo");
    if (fs.existsSync(memosDir)) {
      const memoFiles = findMarkdownFiles(memosDir);
      let _successCount = 0;
      for (const filePath of memoFiles) {
        const memo = extractBlogPost(filePath, "memo");
        if (memo) {
          const success = await upsertPost(memo);
          if (success) {
            _successCount++;
          }
        }
      }
    }
    return;
  }

  const files = changedFiles.split("\n").filter((file) => file.trim());

  let _successCount = 0;
  let _skippedCount = 0;

  for (const file of files) {
    // .md 파일만 처리 (영어 버전 제외)
    if (!file.endsWith(".md") || file.endsWith(".en.md")) {
      _skippedCount++;
      continue;
    }

    // blog_obsidian 디렉토리 내의 파일만 처리
    if (!file.includes("blog_obsidian")) {
      _skippedCount++;
      continue;
    }

    const postType = getPostType(file);
    if (!postType) {
      _skippedCount++;
      continue;
    }

    const fullPath = path.join(process.cwd(), "..", file);

    if (!fs.existsSync(fullPath)) {
      continue;
    }

    const post = extractBlogPost(fullPath, postType);
    if (post) {
      const success = await upsertPost(post);
      if (success) {
        _successCount++;
      }
      // API 제한을 피하기 위해 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  migrateChangedFiles();
}
