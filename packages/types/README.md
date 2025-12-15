# @jinmu/types

jinmu.me 프로젝트의 공유 TypeScript 타입 정의 및 상수

## 설치

이 패키지는 워크스페이스 내부 패키지이므로 별도 설치가 필요하지 않습니다.

```json
{
  "dependencies": {
    "@jinmu/types": "workspace:*"
  }
}
```

## 사용법

### Category 타입 및 상수

```typescript
import { CATEGORIES } from "@jinmu/types/content";
import type { Category } from "@jinmu/types/content";

// CATEGORIES 배열 사용
console.log(CATEGORIES); // ["develop", "experience", "cloud", ...]

// Category 타입 사용
const myCategory: Category = "develop";

// Zod 스키마 생성 (필요한 경우)
import { z } from "zod";
const categorySchema = z.enum(CATEGORIES);
```

### 콘텐츠 메타데이터 타입

```typescript
import type {
  PostFrontmatter,
  MemoFrontmatter,
  BaseMetadata
} from "@jinmu/types/content";

const post: PostFrontmatter = {
  title: "My Post",
  date: new Date(),
  draft: false,
  category: "develop",
  tags: ["typescript", "react"],
  summary: "A blog post about TypeScript"
};
```

### Firestore 타입

```typescript
import type {
  PostStatsDocument,
  ViewIncrementResult,
  LikeIncrementResult
} from "@jinmu/types/firestore";

const stats: PostStatsDocument = {
  slug: "my-post",
  total_views: 100,
  total_likes: 5,
  likes_by_ip: {},
  created_at: new Date(),
  updated_at: new Date(),
  last_synced_to_pb: null
};
```

## Exports

### `@jinmu/types/content`
- `CATEGORIES`: 블로그 카테고리 상수 배열
- `Category`: 카테고리 타입
- `BaseMetadata`: 기본 콘텐츠 메타데이터 인터페이스
- `PostFrontmatter`: 블로그 포스트 frontmatter 인터페이스
- `MemoFrontmatter`: 메모 frontmatter 인터페이스

### `@jinmu/types/firestore`
- `PostStatsDocument`: Firestore 통계 문서 인터페이스
- `ViewIncrementResult`: 조회수 증가 결과 인터페이스
- `LikeIncrementResult`: 좋아요 증가 결과 인터페이스
- `PostStatsCreate`: 통계 생성 데이터 인터페이스

## 개발

```bash
# 패키지 디렉토리로 이동
cd packages/types

# 빌드
pnpm build

# 타입 체크
pnpm typecheck
```

## 라이선스

MIT
