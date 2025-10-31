# API 서버

이 프로젝트는 블로그의 백엔드 API를 제공하는 PocketBase 기반 서버입니다.

## 기능

- **블로그 콘텐츠 관리**: Obsidian 마크다운 파일을 PocketBase DB로 마이그레이션
- **좋아요 시스템**: IP 기반 익명 좋아요 기능
- **조회수 추적**: 포스트별 조회수 카운팅
- **RESTful API**: 블로그 콘텐츠 조회 및 관리 API

## 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│  Express API    │───▶│   PocketBase    │
│  (Astro Blog)   │    │    Server       │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

- **Express API Server**: RESTful API 엔드포인트 제공
- **PocketBase**: 데이터베이스 및 실시간 기능 제공
- **마이그레이션 스크립트**: Obsidian → PocketBase 자동 동기화

## 빠른 시작

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음을 설정하세요:

```bash
# PocketBase 설정
PB_URL=http://127.0.0.1:8090

# API 서버 설정
PORT=3001
NODE_ENV=development
CORS_ORIGIN=*

# PocketBase 관리자 설정 (Docker Compose 사용 시)
PB_ADMIN_EMAIL=admin@example.com
PB_ADMIN_PASSWORD=changeme123

# PocketBase 인증 토큰 (필요한 경우)
# PB_TOKEN=your_token_here
```

### 3. PocketBase 시작

```bash
pnpm run pocketbase:start
```

PocketBase 관리자 대시보드가 `http://localhost:8090/_/`에서 실행됩니다.

### 4. 데이터베이스 스키마 설정

PocketBase 관리자 대시보드에서 다음 컬렉션들을 생성하세요:

#### posts 컬렉션
- `slug` (Text, Required, Unique)
- `title` (Text)
- `date` (DateTime)
- `draft` (Bool, Default: false)
- `tags` (JSON)
- `lastmod` (DateTime)
- `category` (Text)
- `summary` (Text)
- `type` (Select: post, memo, Default: post)

#### post_likes 컬렉션
- `ip_address` (Text, Required)
- `post_id` (Relation to posts, Required)
- `count` (Number, Default: 1, Min: 1, Max: 5)

#### post_views 컬렉션
- `post_id` (Relation to posts, Required)
- `ip_address` (Text)
- `viewed_at` (DateTime, Default: NOW)

### 5. API 서버 시작

```bash
pnpm run dev
```

API 서버가 `http://localhost:3001`에서 실행됩니다.

### 6. 블로그 콘텐츠 마이그레이션

```bash
pnpm run migrate:published
```

## Docker 사용법

### 단독 실행 (API 디렉토리에서)

```bash
# Docker 이미지 빌드
pnpm run docker:build

# 컨테이너 실행
pnpm run docker:run
```

### Docker Compose 사용 (권장)

```bash
# 환경 변수 설정
cp env.example .env

# 전체 서비스 시작 (Redis + API + PocketBase)
pnpm run docker:up

# Redis만 시작
pnpm run docker:redis

# API만 시작
pnpm run docker:api

# 서비스 상태 확인
pnpm run docker:status

# 로그 확인
pnpm run docker:logs

# 서비스 재시작
pnpm run docker:restart

# 서비스 중지
pnpm run docker:down

# Docker 정리
pnpm run docker:clean
```

**주의사항**: 
- 이 프로젝트는 pnpm workspace를 사용합니다
- Docker 빌드는 `api/` 디렉토리에서 실행됩니다
- Dockerfile은 standalone 모드로 작동하도록 설정되어 있습니다

## 주요 스크립트

| 스크립트 | 설명 |
|---------|------|
| `pnpm run dev` | 개발 모드로 API 서버 시작 |
| `pnpm run build` | TypeScript 빌드 |
| `pnpm run start` | 프로덕션 모드로 서버 시작 |
| `pnpm run pocketbase:start` | PocketBase 서버 시작 |
| `pnpm run pocketbase:stop` | PocketBase 서버 중지 |
| `pnpm run migrate:published` | Published 콘텐츠만 마이그레이션 (draft=false) |
| `pnpm run migrate:changed` | 변경된 파일만 마이그레이션 (draft=false) |
| `pnpm run docker:build` | Docker 이미지 빌드 |
| `pnpm run docker:up` | Docker Compose로 서비스 시작 |
| `pnpm run docker:down` | Docker Compose 서비스 중지 |
| `pnpm run docker:redis` | Redis만 시작 |
| `pnpm run docker:api` | API만 시작 |
| `pnpm run docker:status` | 서비스 상태 확인 |
| `pnpm run docker:restart` | 서비스 재시작 |

### Redis 관리 스크립트

| 스크립트 | 설명 |
|---------|------|
| `pnpm run redis:migrate` | PocketBase → Redis 마이그레이션 |
| `pnpm run redis:validate` | 마이그레이션 검증 |
| `pnpm run redis:stats` | Redis 통계 조회 |
| `pnpm run redis:backup` | Redis 데이터 백업 |
| `pnpm run redis:restore` | Redis 데이터 복원 |
| `pnpm run redis:cleanup` | 만료된 키 정리 |
| `pnpm run redis:popular` | 인기 포스트 조회 |

## API 엔드포인트

### 블로그 콘텐츠 API

- `GET /api/posts` - 포스트 목록 조회
  - Query params: `type`, `category`, `tag`, `limit`, `offset`, `includeContent`
- `GET /api/posts/:slug` - 특정 포스트 조회
- `GET /api/posts/meta/tags-and-categories` - 태그 및 카테고리 조회

### 상호작용 API

- `POST /api/likes/:slug` - 포스트 좋아요 추가
- `GET /api/likes/:slug/my-likes` - 내 좋아요 수 조회
- `GET /api/likes/:slug/total` - 총 좋아요 수 조회
- `POST /api/views/:slug` - 조회수 증가
- `GET /api/views/:slug` - 조회수 조회

### 헬스체크

- `GET /health` - 서버 상태 확인

## 데이터베이스 구조

### posts 컬렉션

```javascript
{
  "id": "string",
  "slug": "string",
  "title": "string",
  "date": "datetime",
  "draft": "boolean",
  "tags": ["string"],
  "lastmod": "datetime",
  "category": "string",
  "summary": "string",
  "type": "post|memo",
  "created": "datetime",
  "updated": "datetime"
}
```

### post_likes 컬렉션

```javascript
{
  "id": "string",
  "ip_address": "string",
  "post_id": "string",
  "count": "number",
  "created": "datetime",
  "updated": "datetime"
}
```

### post_views 컬렉션

```javascript
{
  "id": "string",
  "post_id": "string",
  "ip_address": "string",
  "viewed_at": "datetime",
  "created": "datetime",
  "updated": "datetime"
}
```

## 개발 가이드

### 새로운 API 엔드포인트 추가

1. `src/routes/` 디렉토리에 새 라우터 파일 생성
2. `src/server.ts`에서 라우터 등록
3. PocketBase 컬렉션 스키마 업데이트 (필요한 경우)

### 마이그레이션 스크립트 수정

`scripts/migrate-published-content.ts`를 수정하여 새로운 필드나 로직을 추가할 수 있습니다.

## 배포

### 로컬 테스트

```bash
pnpm run dev
```

### 프로덕션 빌드 및 시작

```bash
pnpm run build
pnpm start
```

### Docker 배포

```bash
# 프로덕션 환경에서
pnpm run docker:up
```

## 문제 해결

### 일반적인 문제들

1. **환경 변수 오류**: `.env` 파일이 올바르게 설정되었는지 확인
2. **포트 충돌**: 다른 서비스가 3001, 8090 포트를 사용하고 있는지 확인
3. **PocketBase 연결 오류**: PocketBase 서버가 실행 중인지 확인
4. **마이그레이션 오류**: PocketBase 컬렉션 스키마가 올바르게 설정되었는지 확인
5. **pnpm workspace 오류**: 루트 디렉토리에서 `pnpm install` 실행

### 마이그레이션 확인

PocketBase 관리자 대시보드에서 직접 확인:

1. `http://localhost:8090/_/` 접속
2. Collections > posts에서 데이터 확인
3. 필터 기능으로 type별 데이터 조회

### 로그 확인

```bash
# API 서버 로그
pnpm run dev

# Docker 로그
pnpm run docker:logs

# PocketBase 로그는 터미널에서 직접 확인 가능
```

## PocketBase vs Supabase 비교

| 기능 | PocketBase | Supabase |
|-----|-----------|----------|
| 설치 | 단일 바이너리 | Docker/클라우드 |
| 데이터베이스 | SQLite | PostgreSQL |
| 실시간 | 내장 | 내장 |
| 인증 | 내장 | 내장 |
| 파일 저장소 | 내장 | 내장 |
| 확장성 | 중간 | 높음 |
| 복잡성 | 낮음 | 중간 |

## 라이센스

MIT License 