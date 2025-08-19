# API 서버

이 프로젝트는 블로그의 백엔드 API를 제공하는 Supabase 기반 서버입니다.

## 기능

- **블로그 콘텐츠 관리**: Obsidian 마크다운 파일을 Supabase DB로 마이그레이션
- **좋아요 시스템**: IP 기반 익명 좋아요 기능
- **조회수 추적**: 포스트별 조회수 카운팅
- **RESTful API**: 블로그 콘텐츠 조회 및 관리 API

## CI/CD 워크플로우

### 자동 마이그레이션

이 프로젝트는 GitHub Actions를 통해 자동 마이그레이션을 지원합니다:

#### Published 콘텐츠 마이그레이션 (권장)
- **워크플로우**: `Published Content Migration`
- **트리거**: `blog/blog_obsidian/` 디렉토리의 `.md` 파일 변경 시
- **동작**: draft가 false인 파일만 감지하여 API DB에 자동 마이그레이션
- **배포**: 마이그레이션 후 Edge Functions 자동 배포



### 수동 실행

GitHub Actions 탭에서 워크플로우를 수동으로 실행할 수 있습니다:

#### Published 콘텐츠 마이그레이션 (권장)
- `Published Content Migration` 워크플로우 선택
- `force_migrate: true`로 설정하면 모든 published 콘텐츠를 강제 마이그레이션



## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음을 설정하세요:

```bash
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 3. 블로그 콘텐츠 마이그레이션

#### 원격 Supabase DB 사용 (권장)

1. **원격 DB 스키마 적용**:
   - Supabase Dashboard > SQL Editor에서 `api/supabase/apply-schema-remote.sql` 실행
   
2. **마이그레이션 실행**:
   ```bash
   npm run migrate:published
   ```

#### 로컬 Supabase DB 사용

1. **로컬 환경 시작**:
   ```bash
   npm run supabase:start
   ```

2. **스키마 적용**:
   ```bash
   npm run supabase:db:reset
   ```

3. **마이그레이션 실행**:
   ```bash
   npm run migrate:published
   ```

### 4. Edge Functions 서빙 (선택사항)

```bash
npm run supabase:functions:serve
```

## 주요 스크립트

| 스크립트 | 설명 |
|---------|------|
| `npm run supabase:start` | Supabase 로컬 환경 시작 |
| `npm run supabase:stop` | Supabase 로컬 환경 중지 |
| `npm run supabase:status` | Supabase 상태 확인 |
| `npm run supabase:db:reset` | 데이터베이스 리셋 |
| `npm run migrate:published` | Published 콘텐츠만 마이그레이션 (draft=false) |
| `npm run migrate:changed` | 변경된 파일만 마이그레이션 (draft=false) |
| `npm run supabase:functions:deploy` | Edge Functions 배포 |

## API 엔드포인트

### 블로그 콘텐츠 API

- `GET /functions/v1/get-posts` - 포스트 목록 조회
- `GET /functions/v1/get-post-by-slug/{slug}` - 특정 포스트 조회
- `GET /functions/v1/get-tags-and-categories` - 태그 및 카테고리 조회

### 상호작용 API

- `POST /functions/v1/like-post-ip/{slug}` - 포스트 좋아요
- `GET /functions/v1/get-my-ip-like/{slug}` - 내 좋아요 수 조회
- `GET /functions/v1/get-total-likes/{slug}` - 총 좋아요 수 조회
- `POST /functions/v1/increment-post-view/{slug}` - 조회수 증가
- `GET /functions/v1/get-post-view/{slug}` - 조회수 조회

## 데이터베이스 스키마

### posts 테이블

```sql
CREATE TABLE "posts" (
    "id" SERIAL PRIMARY KEY,
    "slug" TEXT UNIQUE NOT NULL,
    "title" TEXT,
    "date" TIMESTAMP WITH TIME ZONE,
    "draft" BOOLEAN DEFAULT false,
    "tags" TEXT[],
    "lastmod" TIMESTAMP WITH TIME ZONE,
    "category" TEXT,
    
      "summary" TEXT,
  "type" TEXT DEFAULT 'post' CHECK (type IN ('post', 'memo')),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ip_post_likes 테이블

```sql
CREATE TABLE "ip_post_likes" (
    "id" SERIAL PRIMARY KEY,
    "ip_address" INET NOT NULL,
    "post_id" INTEGER NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
    "count" INTEGER DEFAULT 1 CHECK (count >= 1 AND count <= 5),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("ip_address", "post_id")
);
```

### post_views 테이블

```sql
CREATE TABLE "post_views" (
    "id" SERIAL PRIMARY KEY,
    "post_id" INTEGER NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
    "ip_address" INET,
    "viewed_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 개발 가이드

### 새로운 Edge Function 추가

1. `supabase/functions/` 디렉토리에 새 함수 생성
2. TypeScript로 작성 (Deno 런타임)
3. CORS 헤더 설정
4. 에러 핸들링 추가

### 마이그레이션 스크립트 수정

`scripts/migrate-blog-content.ts`를 수정하여 새로운 필드나 로직을 추가할 수 있습니다.

### 테스트

`scripts/test-migration.ts`를 참고하여 새로운 테스트를 작성할 수 있습니다.

## 배포

### 로컬 테스트

```bash
npm run supabase:functions:serve
```

### 프로덕션 배포

```bash
npm run supabase:functions:deploy
```

## 문제 해결

### 일반적인 문제들

1. **환경 변수 오류**: `.env` 파일이 올바르게 설정되었는지 확인
2. **포트 충돌**: 다른 서비스가 54321-54329 포트를 사용하고 있는지 확인
3. **데이터베이스 연결 오류**: Supabase 로컬 환경이 실행 중인지 확인
4. **원격 DB 연결 오류**: SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 올바른지 확인

### 마이그레이션 확인

Supabase Dashboard에서 직접 확인:

```sql
-- 모든 포스트 조회
SELECT * FROM posts WHERE type = 'post' ORDER BY date DESC;

-- 모든 메모 조회  
SELECT * FROM posts WHERE type = 'memo' ORDER BY date DESC;

-- 태그별 포스트 수 조회
SELECT unnest(tags) as tag, COUNT(*) as count 
FROM posts 
WHERE tags IS NOT NULL 
GROUP BY tag 
ORDER BY count DESC;
```

### 로그 확인

```bash
# Supabase 로그 확인
supabase logs

# 특정 함수 로그 확인
supabase logs --function function-name
```

## 라이센스

MIT License 