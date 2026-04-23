# Jinmu.me

Obsidian에서 콘텐츠를 가져오는 Astro 기반 이중언어(한국어/영어) 개인 블로그.

## 프로젝트 구조

```
src/
├── content/          # Obsidian에서 동기화된 콘텐츠 (.mdx)
├── components/       # React islands + Astro 컴포넌트
├── layouts/          # 페이지 레이아웃 (PostDefault, PostBanner 등)
├── pages/            # Astro 라우트
├── styles/           # 글로벌 CSS, prose 스타일
└── utils/            # 유틸리티 함수
scripts/              # 콘텐츠 빌드, 번역, GSC 제출 스크립트
blog_obsidian/        # Obsidian 마크다운 (git 서브모듈)
```

## 콘텐츠 워크플로우

Obsidian 마크다운 (`blog_obsidian/`) → `scripts/build-content.js`가 `src/content/`로 동기화 (.md→.mdx 변환) → Astro 정적 사이트 빌드.

영어 번역은 DeepL API를 통해 자동으로 생성됩니다 (`*.en.md`).

## 기술 스택

- **Astro 6** (정적 사이트 생성)
- **React** (인터랙티브 islands)
- **Tailwind CSS v4** + **shadcn/ui**
- **Biome** (린팅/포맷팅)
- **Vitest** (테스트)
- **Lefthook** (pre-commit 훅)

## 개발 환경 설정

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하세요:

```bash
PUBLIC_API_URL=http://localhost:3001  # 외부 API 서버 (조회수/좋아요)
PUBLIC_ENV=development
DEEPL_API_KEY=...                     # 번역 스크립트용 (선택)
```

### 3. 개발 서버 실행

```bash
pnpm dev
```

Obsidian 파일 변경 감시 + Astro dev 서버가 동시에 실행됩니다.

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 (Obsidian 감시 + Astro dev) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm prebuild` | Obsidian → src/content/ 동기화 |
| `pnpm lint` | Biome 린팅 |
| `pnpm lint:fix` | Biome 자동 수정 |
| `pnpm format` | 코드 포맷팅 |
| `pnpm check` | lint + format 통합 검사 |
| `pnpm test` | Vitest 실행 |
| `pnpm translate` | 전체 게시물 번역 (DeepL) |
| `pnpm translate:staged` | staged 파일만 번역 |

## 디자인 시스템

`DESIGN.md`에 정의되어 있습니다. 주요 결정:

- **타이포그래피:** Geist (디스플레이) + Pretendard (본문, 한국어)
- **색상:** 따뜻한 Stone 중성색 + 오렌지 액센트 (#D97706)
- **레이아웃:** max-w-max 본문, max-w-5xl (1024px) 컨테이너

## 라이센스

MIT License
