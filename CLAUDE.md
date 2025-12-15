# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 필요한 가이드를 제공합니다.

## 프로젝트 개요

jinmu.me의 개인 블로그와 API 서버를 포함하는 모노레포:

### 애플리케이션 (`apps/`)
- **apps/blog/**: Obsidian에서 콘텐츠를 가져오는 Astro 기반 이중언어(한국어/영어) 블로그
- **apps/api/**: 조회수, 좋아요, 게시물 관리를 위한 PocketBase 통합 Express.js API 서버

### 공유 패키지 (`packages/`)
- **@jinmu/types**: 공유 TypeScript 타입 정의 (Category, PostFrontmatter, Firestore 타입 등)
- **@jinmu/utils**: 공유 유틸리티 함수 (마크다운 파싱, slug 생성 등)
- **@jinmu/tsconfig**: 공유 TypeScript 설정 (base, node, astro)

블로그 콘텐츠 워크플로우: Obsidian 마크다운 (`apps/blog/blog_obsidian/`) → Astro 콘텐츠로 변환 (`apps/blog/src/content/`) → 선택적으로 PocketBase 데이터베이스로 마이그레이션.

## 주요 개발 명령어

### 모노레포 (루트)
```bash
# 개발 서버 실행 (블로그와 API 모두 실행)
pnpm dev
# 또는 turbo 직접 사용
turbo dev

# 모든 패키지 빌드
pnpm build
turbo build

# 린팅 및 포맷팅 (Biome 사용)
pnpm lint          # 문제 확인
pnpm lint:fix      # 자동 수정
pnpm format        # 코드 포맷팅
pnpm check         # 포맷 및 수정 (unsafe 모드)

# 의존성 설치
pnpm install

# 모든 node_modules 삭제
make fclean
```

### 블로그 (`apps/blog/`)
```bash
cd apps/blog

# 개발 서버 실행 (prebuild 단계 포함)
pnpm dev

# Prebuild: Obsidian 마크다운을 Astro 콘텐츠로 변환
pnpm prebuild
# - src/content 디렉토리 초기화
# - obsidian-export 바이너리 실행 (scripts/의 OS별 실행 파일)
# - .md → .mdx로 이름 변경

# 프로덕션 빌드
pnpm build

# Post-build: 사이트맵 및 URL을 Google Search Console에 제출
pnpm postbuild

# 번역 (DeepL API 필요)
pnpm translate              # 모든 게시물 번역
pnpm translate:staged       # staged된 파일만 번역

# 린팅/포맷팅
pnpm lint
pnpm lint:fix
pnpm format
pnpm check
```

### API (`apps/api/`)
```bash
cd apps/api

# 개발 서버 실행
pnpm dev

# 테스트
pnpm test              # 테스트 한 번 실행
pnpm test:watch        # Watch 모드
pnpm test:ui           # Vitest UI
pnpm test:coverage     # 커버리지 리포트

# Obsidian에서 PocketBase로 콘텐츠 마이그레이션
pnpm migrate:published    # 발행된 콘텐츠만 마이그레이션 (draft=false)
pnpm migrate:changed      # 변경된 파일만 마이그레이션

# 또는 루트에서 실행
make migrate-published

# 빌드 및 시작
pnpm build
pnpm start

# Docker (필요시)
pnpm docker:up         # docker-compose로 시작
pnpm docker:down       # 컨테이너 중지
pnpm docker:logs       # 로그 확인
```

## 아키텍처

### 모노레포 구조
```
jinmu.me/
├── apps/                   # 애플리케이션
│   ├── blog/              # Astro 블로그
│   └── api/               # Express API 서버
├── packages/              # 공유 패키지
│   ├── types/             # @jinmu/types
│   ├── utils/             # @jinmu/utils
│   └── tsconfig/          # @jinmu/tsconfig
├── pnpm-workspace.yaml
└── turbo.json
```

- **pnpm workspace**: `apps/*`와 `packages/*` 워크스페이스
- **Turborepo**: 빌드 오케스트레이션 및 캐싱
- **Biome**: 린팅 및 포맷팅 (ESLint/Prettier 대체)

### 공유 패키지

#### @jinmu/types
공유 TypeScript 타입 정의 및 상수:

```typescript
// Category 상수 및 타입
import { CATEGORIES } from "@jinmu/types/content";
import type { Category, PostFrontmatter } from "@jinmu/types/content";

// Firestore 타입
import type { PostStatsDocument, ViewIncrementResult } from "@jinmu/types/firestore";
```

주요 exports:
- `CATEGORIES`: 블로그 카테고리 상수 배열
- `Category`: 카테고리 타입
- `PostFrontmatter`, `MemoFrontmatter`: 콘텐츠 메타데이터 인터페이스
- Firestore document 타입

#### @jinmu/utils
공유 유틸리티 함수:

```typescript
// 마크다운 파싱
import { findMarkdownFiles, parseFrontmatter } from "@jinmu/utils/markdown";

// Slug 생성 및 정규화
import { extractSlugFromPath, getPostTypeFromPath } from "@jinmu/utils/slug";
```

주요 함수:
- `findMarkdownFiles(dir)`: 디렉토리에서 .md 파일 재귀 탐색
- `parseFrontmatter<T>(filePath)`: gray-matter로 frontmatter 파싱
- `extractSlugFromPath(filePath)`: 파일 경로에서 slug 추출
- `getPostTypeFromPath(filePath)`: 경로에서 post/memo 타입 판별

#### @jinmu/tsconfig
공유 TypeScript 설정:

```json
// apps/api/tsconfig.json
{
  "extends": "@jinmu/tsconfig/node.json",
  // ...
}

// apps/blog/tsconfig.json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "paths": {
      "@jinmu/types": ["../../packages/types/src"]
    }
  }
}
```

제공 설정:
- `base.json`: 공통 strict 설정
- `node.json`: Node.js 프로젝트용 (API)
- `astro.json`: Astro 프로젝트용 (Blog)

### 블로그 아키텍처

**콘텐츠 플로우:**
1. Obsidian에서 작성 (`apps/blog/blog_obsidian/`)
2. `prebuild.sh`가 `obsidian-export` 실행 → `src/content/` 생성
3. `src/content.config.ts`에 정의된 Astro 컬렉션:
   - `post`: 시리즈, 카테고리, 태그가 있는 블로그 게시물
   - `memo`: 짧은 형식의 콘텐츠
   - `app`: 애플리케이션/프로젝트 쇼케이스
4. `@jinmu/types`에서 CATEGORIES 상수 import하여 카테고리 스키마 생성

**주요 기능:**
- **이중언어**: 한국어 (기본) + 영어 (`/en/*` 라우트)
- **Content Collections**: Zod 스키마를 사용한 posts, memos, apps
- **MDX 지원**: `src/components/mdx/`의 커스텀 컴포넌트
- **Remark/Rehype 플러그인**:
  - `@r4ai/remark-callout`을 통한 커스텀 콜아웃 (패치됨)
  - `remark-embed-card.ts`를 통한 임베드 카드
  - Shiki transformers를 사용한 구문 강조 (diff, highlight)
  - `rehype-slug`를 통한 자동 제목 링크
- **OG 이미지 생성**: `[slug]/og.png.ts` 라우트에서 동적 PNG 생성
- **검색**: `/search-index.json`에 JSON 인덱스 생성
- **RSS 피드**: `/rss.xml` 및 `/en/rss.xml`
- **분석**: Umami, Google Analytics, API를 통한 페이지 뷰 추적

**레이아웃 시스템:**
- 기본: `Layout.astro` → `Container.astro`
- 게시물 레이아웃: `PostBannerX.astro`, `PostBannerY.astro`, `PostDefault.astro`
- 메모 레이아웃: `MemoDefault.astro`

**위젯 (React islands):**
- Header: 로고, 검색, 테마 스위치, 네비게이션 팝오버
- Comments: Giscus 통합, 좋아요 플라워 애니메이션
- Footer: 소셜 링크

### API 아키텍처

**스택:**
- TypeScript와 함께 사용하는 Express.js
- 데이터베이스/백엔드로 PocketBase
- 블로그 origin에 대해 CORS 구성됨

**라우트:**
- `/api/posts`: 게시물 메타데이터 및 통계
- `/api/views`: 페이지 뷰 추적
- `/api/likes`: 좋아요 상호작용

**마이그레이션 스크립트:**
- `@jinmu/utils/markdown`의 `parseFrontmatter`로 Obsidian 마크다운 파싱
- `@jinmu/utils/slug`로 slug 추출 및 타입 판별
- PocketBase 컬렉션에 동기화
- 두 가지 모드: 발행된 것만 또는 변경된 파일만

**테스트:**
- 단위/통합 테스트를 위한 Vitest
- HTTP 테스트를 위한 Supertest
- `src/test/`의 테스트 파일

## 환경 변수

### 블로그 (`apps/blog/.env`)
```bash
PUBLIC_API_URL=http://localhost:3001  # API 서버 URL
PUBLIC_ENV=development                 # 환경
DEEPL_API_KEY=...                      # 번역 스크립트용
# 추가: postbuild를 위한 Google Search Console 자격증명
```

### API (`apps/api/.env`)
```bash
PB_URL=http://127.0.0.1:8090          # PocketBase 인스턴스
PORT=3001                              # API 서버 포트
NODE_ENV=development
CORS_ORIGIN=http://localhost:4321     # 블로그 개발 URL
```

## 콘텐츠 스키마

**Posts** (`apps/blog/src/content/post/`):
- `title`, `date`, `summary`
- `category`: develop, experience, cloud, movie, book, thinking, health, tech, network, linux
  - `@jinmu/types/content`의 `CATEGORIES` 상수에서 정의
- `tags`: string[]
- `draft`: boolean (기본값: false)
- `series`, `seriesOrder`: 다중 파트 게시물용
- `banner`: 히어로 이미지 경로
- `lastmod`: 마지막 수정 날짜

**Memos** (`apps/blog/src/content/memo/`):
- 게시물과 유사하지만 간소화된 스키마
- 시리즈 지원 없음

## 중요 사항

- **Prebuild 필수**: 개발 전에 Obsidian 콘텐츠를 동기화하기 위해 항상 apps/blog/에서 `pnpm prebuild` (또는 이를 포함하는 `pnpm dev`)를 실행해야 함
- **번역 워크플로우**: `pnpm translate:staged`는 DeepL API를 사용하여 staged된 한국어 게시물을 영어로 자동 번역
- **마이그레이션 vs. 익스포트**:
  - `obsidian-export` (prebuild) → Astro 정적 사이트
  - Migration scripts → 동적 기능을 위한 PocketBase 데이터베이스
- **이중언어 라우트**: `/posts/[slug]`의 한국어 게시물, `/en/posts/[slug]`의 영어 게시물
- **CDN**: 정적 자산은 `package.json`의 `pkg.cdnUrl`을 참조
- **공유 패키지 사용**: 타입과 유틸리티는 `@jinmu/types`, `@jinmu/utils`에서 import하여 중복 제거
- **TypeScript Project References**: 점진적 빌드를 위해 packages → apps 의존성 설정됨
