# Jinmugo.com

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
obsidian/             # Obsidian 마크다운 (repo에 통합된 로컬 콘텐츠)
```

## 콘텐츠 워크플로우

Obsidian 마크다운 (`obsidian/`) → `scripts/build-content.js`가 `src/content/`로 동기화 (.md→.mdx 변환) → Astro 정적 사이트 빌드.

영어 번역은 DeepL API를 통해 자동으로 생성됩니다 (`*.en.md`).

## 기술 스택

- **Astro 7** (정적 사이트 생성)
- **React** (인터랙티브 islands)
- **Tailwind CSS v4** + **shadcn/ui**
- **Biome** (린팅/포맷팅)
- **Vitest** (테스트)
- **Lefthook** (pre-commit 훅)

## 개발 환경 설정

### mise로 실행

`mise`가 없다면 macOS에서 `brew install mise`로 설치하세요.

```bash
mise trust
mise install
mise run setup
mise run dev
```

개발 서버는 http://localhost:4322 에서 실행되며, Obsidian 파일 변경을 감시합니다.
중지는 `Ctrl+C`입니다.

사이트맵은 빌드 시 생성됩니다. XML까지 확인하려면 별도 터미널에서 실행하세요:

```bash
mise run preview
```

미리보기는 http://localhost:4323, 사이트맵은 http://localhost:4323/sitemap.xml 입니다.
수정 후 미리보기에 반영하려면 중지하고 다시 실행하세요.

`mise.toml`은 Node 22.23.2와 pnpm 10.13.1을 설치하고 기존 pnpm 스크립트를 실행합니다.
로컬 작업에서는 `.env` 값보다 우선하여 댓글 API를 `http://localhost:3001`로 지정하고,
운영 R2 갤러리 조회와 분석 전송을 끕니다. 댓글 서버는 별도로 실행해야 하며,
실행하지 않아도 블로그와 사이트맵을 확인할 수 있습니다.
콘텐츠는 저장소의 `obsidian/`를 사용합니다.

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

## 운영 도메인

블로그의 공개 URL은 `package.json`의 `homepage` (`https://jinmugo.com`)가 기준입니다. Pages 빌드도 이 URL과 루트 base를 사용합니다. GitHub Pages custom domain과 DNS는 별도로 같은 주소에 연결해야 합니다.

배포용 `PUBLIC_COMMENT_API_URL`은 `https://comment.jinmugo.com`입니다. 댓글 서버의 `BETTER_AUTH_URL`, `FRONTEND_URL`과 GitHub OAuth callback도 함께 맞춰야 합니다. 댓글의 page 키는 기존 slug를 유지하며 도메인 변경 시 DB를 재작성하지 않습니다.

CDN 공개 주소는 `package.json`의 `cdnUrl` (`https://cdn.jinmugo.com`), 연락처는 `email` (`hi@jinmugo.com`)을 사용합니다. 이력서·포트폴리오의 연락처는 `obsidian/app/` frontmatter와 기본값도 함께 유지합니다.

CDN 도메인 전환 시 R2 버킷과 객체 키는 변경하지 않습니다. 갤러리 객체 prefix는 계속 `jinmu.me/`이며, 새 CDN에서도 동일한 경로로 제공해야 합니다. CDN 연결과 이메일 라우팅 검증을 마친 뒤 사이트 변경을 배포합니다.
