import * as fs from "node:fs";
import * as path from "node:path";
import dotenv from "dotenv";
import matter from "gray-matter";
import PocketBase from "pocketbase";

dotenv.config();

// PocketBase 클라이언트 설정
const pbUrl = process.env.PB_URL || "http://127.0.0.1:8090";
const pb = new PocketBase(pbUrl);
pb.authStore.save(process.env.PB_TOKEN || "", null);

// 현재 스키마에 맞는 인터페이스
interface BlogPost {
  slug: string;
  type?: "post" | "memo";
  // 추가 필드들은 현재 스키마에 없으므로 제거
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

// 파일에서 블로그 포스트 데이터 추출 (현재 스키마에 맞게 간소화)
function extractPublishedBlogPost(filePath: string, type: "post" | "memo"): BlogPost | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const { data: frontMatter } = matter(content);

    // draft가 true인 경우 제외
    if (frontMatter.draft === true) {
      return null;
    }

    // 파일명에서 slug 추출
    const fileName = path.basename(filePath, ".md");
    const slug = frontMatter.slug || fileName;

    return {
      slug,
      type: type || "post",
    };
  } catch (_error) {
    return null;
  }
}

// PocketBase에 포스트 업서트
async function upsertPost(post: BlogPost): Promise<void> {
  try {
    // 기존 포스트 확인
    const existingPosts = await pb.collection("posts").getList(1, 1, {
      filter: `slug = "${post.slug}"`,
    });

    if (existingPosts.items.length > 0) {
      // 업데이트
      const existingPost = existingPosts.items[0];
      await pb.collection("posts").update(existingPost.id, {
        type: post.type,
      });
    } else {
      // 생성
      await pb.collection("posts").create({
        slug: post.slug,
        type: post.type,
      });
    }
  } catch (_error) {}
}

// 메인 마이그레이션 함수
async function migratePublishedContent(): Promise<void> {
  const blogObsidianPath = path.join(process.cwd(), "..", "blog", "blog_obsidian");

  if (!fs.existsSync(blogObsidianPath)) {
    return;
  }
  const postsDir = path.join(blogObsidianPath, "post");
  if (fs.existsSync(postsDir)) {
    const postFiles = findMarkdownFiles(postsDir);

    for (const filePath of postFiles) {
      const post = extractPublishedBlogPost(filePath, "post");
      if (post) {
        await upsertPost(post);
      }
    }
  }
  const memosDir = path.join(blogObsidianPath, "memo");
  if (fs.existsSync(memosDir)) {
    const memoFiles = findMarkdownFiles(memosDir);

    for (const filePath of memoFiles) {
      const memo = extractPublishedBlogPost(filePath, "memo");
      if (memo) {
        await upsertPost(memo);
      }
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  migratePublishedContent().catch((_error) => {
    process.exit(1);
  });
}
