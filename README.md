# JinMu.me

개인 블로그 및 API 서버 프로젝트입니다.

## 프로젝트 구조

- `blog/` - Astro 기반 블로그 프론트엔드
- `api/` - Express + PocketBase 기반 API 서버
- `blog/blog_obsidian/` - Obsidian 마크다운 콘텐츠

## 주요 기능

### 블로그 콘텐츠 마이그레이션

Obsidian 마크다운 파일을 PocketBase DB로 자동 마이그레이션하는 시스템을 제공합니다.

#### Published 콘텐츠 마이그레이션 (권장)

draft가 false인 파일들만 마이그레이션합니다:

```bash
# 로컬에서 실행
make migrate-published

# 또는 API 디렉토리에서 직접 실행
cd api && pnpm run migrate:published
```



### GitHub Actions 워크플로우

#### Published Content Migration (권장)
- `blog/blog_obsidian/` 디렉토리의 `.md` 파일 변경 시 자동 실행
- draft가 false인 파일들만 마이그레이션
- PocketBase DB 자동 업데이트



## 개발 환경 설정

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

#### API 서버 환경 변수

`api/.env` 파일을 생성하고 PocketBase 설정을 추가하세요:

```bash
# PocketBase 설정
PB_URL=http://127.0.0.1:8090

# API 서버 설정  
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:4321
```

#### 블로그 환경 변수

블로그 프로젝트에서 API 서버를 사용하려면 `blog/.env` 파일을 생성하세요:

```bash
# API 서버 설정
PUBLIC_API_URL=http://localhost:3001
PUBLIC_ENV=development
```

### 3. 개발 서버 실행

```bash
# PocketBase 서버 시작 (먼저 실행)
cd api && pnpm run pocketbase:start

# API 서버 실행 (새 터미널에서)
cd api && pnpm run dev

# 블로그 개발 서버 (새 터미널에서)
pnpm dev
```

## 사용 가능한 명령어

| 명령어 | 설명 |
|--------|------|
| `make migrate-published` | Published 콘텐츠만 마이그레이션 (draft=false) |
| `pnpm dev` | 블로그 개발 서버 실행 |
| `pnpm build` | 블로그 빌드 |
| `pnpm lint` | 코드 린팅 |
| `pnpm format` | 코드 포맷팅 |

## 마이그레이션 스크립트

### 로컬 테스트

환경 변수가 설정되지 않은 상태에서도 스크립트를 테스트할 수 있습니다:

```bash
cd api
pnpm run migrate:published  # 시뮬레이션 모드로 실행
```

### 실제 마이그레이션

환경 변수가 설정된 상태에서 실제 DB에 마이그레이션:

```bash
cd api
pnpm run migrate:published  # 실제 DB에 마이그레이션
```

## 라이센스

MIT License 