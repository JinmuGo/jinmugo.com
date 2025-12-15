# @jinmu/utils

jinmu.me 프로젝트의 공유 유틸리티 함수 모음

## 설치

이 패키지는 워크스페이스 내부 패키지이므로 별도 설치가 필요하지 않습니다.

```json
{
  "dependencies": {
    "@jinmu/utils": "workspace:*"
  }
}
```

## 사용법

### 마크다운 유틸리티

#### `findMarkdownFiles(dir, excludeEnglish?)`

디렉토리에서 마크다운 파일을 재귀적으로 찾습니다.

```typescript
import { findMarkdownFiles } from "@jinmu/utils/markdown";

// 모든 .md 파일 찾기 (영어 파일 제외)
const files = findMarkdownFiles("./blog_obsidian/post");

// 영어 파일 포함
const allFiles = findMarkdownFiles("./blog_obsidian/post", false);
```

**파라미터:**
- `dir` (string): 검색할 디렉토리 경로
- `excludeEnglish` (boolean, 기본값: true): `.en.md` 파일 제외 여부

**반환값:** `string[]` - 마크다운 파일 경로 배열

#### `parseFrontmatter<T>(filePath)`

마크다운 파일의 frontmatter를 파싱합니다.

```typescript
import { parseFrontmatter } from "@jinmu/utils/markdown";
import type { PostFrontmatter } from "@jinmu/types/content";

// 타입 지정하여 파싱
const result = parseFrontmatter<PostFrontmatter>("./post/my-post.md");

if (result) {
  console.log(result.data.title); // frontmatter 데이터
  console.log(result.content);    // 마크다운 본문
}
```

**파라미터:**
- `filePath` (string): 마크다운 파일 경로
- `T` (제네릭): frontmatter 데이터의 타입

**반환값:** `{ data: T, content: string } | null`

### Slug 유틸리티

#### `extractSlugFromPath(filePath)`

파일 경로에서 slug를 추출합니다.

```typescript
import { extractSlugFromPath } from "@jinmu/utils/slug";

const slug = extractSlugFromPath("/path/to/my-post/index.md");
// 반환: "my-post" 또는 "index" (컨텍스트에 따라)
```

**파라미터:**
- `filePath` (string): 파일 경로

**반환값:** `string` - 추출된 slug

#### `getPostTypeFromPath(filePath)`

파일 경로에서 포스트 타입(post 또는 memo)을 판별합니다.

```typescript
import { getPostTypeFromPath } from "@jinmu/utils/slug";

const type = getPostTypeFromPath("/blog_obsidian/post/my-post.md");
// 반환: "post"

const memoType = getPostTypeFromPath("/blog_obsidian/memo/my-memo.md");
// 반환: "memo"

const unknown = getPostTypeFromPath("/some/other/path.md");
// 반환: null
```

**파라미터:**
- `filePath` (string): 파일 경로

**반환값:** `"post" | "memo" | null`

## 예제

### 마이그레이션 스크립트 예제

```typescript
import { findMarkdownFiles, parseFrontmatter } from "@jinmu/utils/markdown";
import { extractSlugFromPath, getPostTypeFromPath } from "@jinmu/utils/slug";
import type { PostFrontmatter } from "@jinmu/types/content";

// 모든 포스트 파일 찾기
const postFiles = findMarkdownFiles("./blog_obsidian/post");

for (const filePath of postFiles) {
  // Frontmatter 파싱
  const result = parseFrontmatter<PostFrontmatter>(filePath);

  if (!result) continue;

  const { data: frontmatter } = result;

  // draft 게시물 제외
  if (frontmatter.draft) continue;

  // Slug 추출
  const slug = extractSlugFromPath(filePath);

  // 타입 판별
  const type = getPostTypeFromPath(filePath); // "post"

  console.log({ slug, type, title: frontmatter.title });
}
```

## 개발

```bash
# 패키지 디렉토리로 이동
cd packages/utils

# 빌드
pnpm build

# 타입 체크
pnpm typecheck
```

## 의존성

- `@jinmu/types`: 타입 정의
- `gray-matter`: Frontmatter 파싱

## 라이선스

MIT
