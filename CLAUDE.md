# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

jinmu.me — Obsidian에서 콘텐츠를 가져오는 Astro 기반 이중언어(한국어/영어) 개인 블로그.

콘텐츠 워크플로우: Obsidian 마크다운 (`obsidian/`) → `scripts/build-content.js`가 `src/content/`로 동기화 (.md→.mdx 변환) → Astro 정적 사이트 빌드.

## 주요 개발 명령어

```bash
# 개발 서버 (Obsidian 파일 변경 감시 + Astro dev 동시 실행)
pnpm dev

# Obsidian → src/content/ 동기화만 실행
pnpm prebuild

# 프로덕션 빌드
pnpm build

# 린팅 및 포맷팅 (Biome)
pnpm lint          # 문제 확인
pnpm lint:fix      # 자동 수정
pnpm format        # 코드 포맷팅
pnpm check         # lint + format 통합 검사

# 테스트 (Vitest)
pnpm test              # 한 번 실행
pnpm test:watch        # Watch 모드
pnpm test:coverage     # 커버리지 리포트

# 번역 (DeepL API 필요)
pnpm translate              # 모든 게시물 번역
pnpm translate:staged       # staged된 파일만 번역

# 의존성
pnpm install
make fclean        # 모든 node_modules 삭제
```

## 아키텍처

### 프로젝트 구조
- **Astro 6** 정적 사이트 (`output: "static"`)
- **React islands**: 인터랙티브 위젯 (Header, Comments, Search 등)
- **Tailwind CSS v4** + **shadcn/ui** (New York 스타일, `components.json` 설정)
- **Biome**: 린팅 및 포맷팅 (ESLint/Prettier 대체)
- **Lefthook**: pre-commit 훅 (Biome check, type-check, 자동 번역)

### 경로 별칭
- `@/*` → `./src/*`
- `~/*` → `./*`

### 콘텐츠 시스템 (`src/content.config.ts`)
- **post**: 블로그 게시물 — `title`, `date`, `category`, `tags`, `draft`, `series`, `seriesOrder`, `banner`, `summary`, `lastmod`
- **app**: 포트폴리오/이력서 데이터 — projects, skills, certifications, opensource 섹션
- **book**: 도서 — `title`, `author`, `originalTitle`, `year`, `language`, `dateRead`, `rating`, `status`, `oneLiner`, `tags`, `quote`, `draft`, `lastmod`
- **movie**: 영화 — `title`, `director`, `originalTitle`, `year`, `language`, `dateWatched`, `rating`, `status`, `oneLiner`, `tags`, `quote`, `draft`, `lastmod`

카테고리: `develop`, `experience`, `cloud`, `thinking`, `health`, `tech`, `network`, `linux`

### 이중언어 라우팅
- 한국어 (기본): `/posts/[slug]`, `/memos/[slug]`, `/library/books/[slug]`, `/library/movies/[slug]`
- 영어: `/en/posts/[slug]`, `/en/memos/[slug]`, `/en/library/books/[slug]`, `/en/library/movies/[slug]`
- 영어 콘텐츠는 `obsidian/`에서 `*.en.md` 파일로 관리

### 레이아웃 시스템 (`src/layouts/`)
- `Layout.astro` → `Container.astro`: 기본 레이아웃
- `PostBannerX.astro`, `PostBannerY.astro`, `PostDefault.astro`: 게시물 레이아웃 (배너 방향/유무)
- `MemoDefault.astro`: 메모 레이아웃
- `layoutSelector.ts`: frontmatter 기반 레이아웃 선택 로직

### Markdown 파이프라인 (`astro.config.mjs`)
- **Remark**: `@r4ai/remark-callout` (패치됨, `pnpm-workspace.yaml` 참조), `remark-embed-card.ts`
- **Rehype**: `rehype-slug` (제목 자동 링크)
- **Shiki**: `one-light`/`one-dark-pro` 테마, diff/highlight transformers
- **MDX 커스텀 컴포넌트**: `src/components/mdx/`

### 주요 컴포넌트 디렉토리
- `src/components/ui/`: shadcn/ui 컴포넌트
- `src/components/content/`: 게시물/메모 렌더링
- `src/components/features/`: 댓글(Giscus), 좋아요, 조회수
- `src/components/search/`: 검색 기능 (`/search-index.json` 인덱스)
- `src/components/og/`: OG 이미지 동적 생성 (Satori + Sharp)
- `src/components/portfolio/`: 포트폴리오 페이지 컴포넌트

### 스크립트 (`scripts/`)
- `build-content.js`: Obsidian → src/content/ 동기화 (OS별 `obsidian-export` 바이너리 실행, diff 기반 sync, .md→.mdx 변환). `obsidian/library/book/*` → `src/content/book/*`, `obsidian/library/movie/*` → `src/content/movie/*`로 리매핑됨
- `watch-obsidian.js`: 개발 시 obsidian 변경 감시 → 자동 rebuild
- `translate.js`: DeepL API로 한국어→영어 자동 번역 (`*.en.md` 생성)
- `add-cover.js`: 표지/포스터 이미지를 `obsidian/library/<kind>/<slug>/<slug>.webp`로 저장해 빌드 시 자동 감지
- `submit-to-gsc.js`, `submit-urls-to-gsc.js`: Google Search Console 사이트맵/URL 제출

### Library 커버 규칙
- 표지는 frontmatter `cover` 필드 없이 `obsidian/library/book/<slug>/<slug>.{webp,png,jpg,jpeg}` 또는 `obsidian/library/movie/<slug>/<slug>.{webp,png,jpg,jpeg}` 경로로 자동 감지
- `pnpm cover <kind> <slug> <url-or-path>`로 표지 추가

### 디자인 토큰
- `design-tokens/tokens.json`: 중앙화된 디자인 토큰
- CSS 커스텀 프로퍼티로 변환하여 사용

## 환경 변수 (`.env`)

```bash
PUBLIC_API_URL=http://localhost:3001  # 외부 API 서버 URL (조회수/좋아요)
PUBLIC_ENV=development
DEEPL_API_KEY=...                     # 번역 스크립트용
```

## 중요 사항

- **Prebuild 필수**: `pnpm dev`가 자동으로 처리하지만, 빌드 전에는 `pnpm prebuild`로 Obsidian 콘텐츠 동기화 필요
- **obsidian은 이 repo에 통합된 로컬 콘텐츠 디렉터리**: 별도 checkout이 필요하지 않음
- **pre-commit 훅**: Lefthook이 Biome check, type-check, 한국어 게시물 자동 번역을 커밋 시 실행
- **CDN**: 정적 자산 URL은 `package.json`의 `cdnUrl` 필드 참조 (`https://cdn.jinmu.me`)
- **`@r4ai/remark-callout` 패치**: `patches/@r4ai__remark-callout.patch`로 패치된 버전 사용
- **테스트 파일 위치**: `src/**/*.{test,spec}.{js,ts,jsx,tsx}` (Vitest)
- **never use 'any' type**: TypeScript에서 `any` 대신 적절한 타입 인터페이스 정의

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
