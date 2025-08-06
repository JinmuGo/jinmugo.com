# 블로그 콘텐츠 마이그레이션 가이드

이 가이드는 `@/blog_obsidian`에 있는 post와 memo들을 `@/api`의 Supabase DB로 마이그레이션하는 방법을 설명합니다.

## 마이그레이션 옵션

### 1. 로컬 Supabase DB (Docker 필요)

### 2. 원격 Supabase DB (추천)

## 원격 Supabase DB 마이그레이션 (추천)

### 1. 환경 변수 설정

`.env` 파일을 생성하고 원격 Supabase 프로젝트의 환경 변수를 설정하세요:

```bash
# 원격 Supabase 설정
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 2. 원격 DB 스키마 적용

Supabase Dashboard에서 다음을 수행하세요:

1. **Supabase Dashboard** 접속
2. **SQL Editor** 메뉴로 이동
3. `api/supabase/apply-schema-remote.sql` 파일의 내용을 복사하여 실행

또는 다음 명령어로 스크립트 내용을 확인:

```bash
cat api/supabase/apply-schema-remote.sql
```

### 3. 원격 DB 마이그레이션 실행

```bash
npm run migrate:remote
```

### 4. 마이그레이션 결과 확인

```bash
npm run test:remote
```

또는 Supabase Dashboard에서 직접 확인:

- **Table Editor > posts**: 마이그레이션된 포스트와 메모 목록
- **SQL Editor**: 다음 쿼리로 데이터 확인

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

## 로컬 Supabase DB 마이그레이션

### 1. 환경 변수 설정

`.env` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```bash
# 로컬 Supabase 설정
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

### 2. Supabase 로컬 개발 환경 시작

```bash
npm run supabase:start
```

### 3. 데이터베이스 스키마 적용

```bash
npm run supabase:db:reset
```

### 4. 마이그레이션 스크립트 실행

```bash
npm run migrate:blog
```

### 5. 마이그레이션 결과 확인

```bash
npm run test:migration
```

## API 엔드포인트

마이그레이션 후 다음과 같은 API 엔드포인트들을 사용할 수 있습니다:

### 1. 포스트 목록 조회

```bash
# 모든 포스트와 메모 조회
curl "http://localhost:54321/functions/v1/get-posts"

# 포스트만 조회
curl "http://localhost:54321/functions/v1/get-posts?type=post"

# 메모만 조회
curl "http://localhost:54321/functions/v1/get-posts?type=memo"

# 특정 카테고리 조회
curl "http://localhost:54321/functions/v1/get-posts?category=develop"

# 특정 태그 조회
curl "http://localhost:54321/functions/v1/get-posts?tag=Network"

# 페이지네이션
curl "http://localhost:54321/functions/v1/get-posts?limit=10&offset=0"

# 콘텐츠 제외 (메타데이터만)
curl "http://localhost:54321/functions/v1/get-posts?includeContent=false"
```

### 2. 특정 포스트 조회

```bash
# slug로 포스트 조회 (콘텐츠 포함)
curl "http://localhost:54321/functions/v1/get-post-by-slug/proxy-no-more-retreat"

# slug로 포스트 조회 (콘텐츠 제외)
curl "http://localhost:54321/functions/v1/get-post-by-slug/proxy-no-more-retreat?includeContent=false"
```

### 3. 태그와 카테고리 조회

```bash
# 모든 태그와 카테고리 조회
curl "http://localhost:54321/functions/v1/get-tags-and-categories"

# 포스트의 태그와 카테고리만 조회
curl "http://localhost:54321/functions/v1/get-tags-and-categories?type=post"

# 메모의 태그와 카테고리만 조회
curl "http://localhost:54321/functions/v1/get-tags-and-categories?type=memo"
```

### 4. 기존 엔드포인트들

기존의 좋아요, 조회수 관련 엔드포인트들도 계속 사용할 수 있습니다:

```bash
# 포스트 좋아요
curl -X POST "http://localhost:54321/functions/v1/like-post-ip/proxy-no-more-retreat" \
  -H "Content-Type: application/json" \
  -d '{"count": 1}'

# 내 좋아요 수 조회
curl "http://localhost:54321/functions/v1/get-my-ip-like/proxy-no-more-retreat"

# 총 좋아요 수 조회
curl "http://localhost:54321/functions/v1/get-total-likes/proxy-no-more-retreat"

# 조회수 증가
curl -X POST "http://localhost:54321/functions/v1/increment-post-view/proxy-no-more-retreat"

# 조회수 조회
curl "http://localhost:54321/functions/v1/get-post-view/proxy-no-more-retreat"
```

## 데이터 구조

### posts 테이블 스키마

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
    "withAI" BOOLEAN DEFAULT false,
    "summary" TEXT,
    "type" TEXT DEFAULT 'post' CHECK (type IN ('post', 'memo')),
    "content" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 지원하는 Frontmatter 필드

- `title`: 포스트 제목
- `date`: 작성일
- `draft`: 초안 여부
- `tags`: 태그 배열
- `lastmod`: 마지막 수정일
- `category`: 카테고리
- `withAI`: AI 협업 여부
- `summary`: 요약

## 문제 해결

### 1. 환경 변수 오류

```
Error: Missing Supabase environment variables
```

`.env` 파일이 올바르게 설정되었는지 확인하세요.

### 2. 파일 경로 오류

```
❌ blog_obsidian 디렉토리를 찾을 수 없습니다.
```

프로젝트 루트에서 스크립트를 실행하고 있는지 확인하세요.

### 3. 원격 DB 연결 오류

```
❌ 원격 DB 연결 실패
```

다음을 확인하세요:
- SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 올바른지
- 원격 Supabase 프로젝트가 활성화되어 있는지
- posts 테이블이 생성되어 있는지

### 4. 로컬 DB 연결 오류

Supabase 로컬 환경이 실행 중인지 확인하세요:

```bash
npm run supabase:status
```

### 5. Edge Function 배포

로컬에서 테스트 후 프로덕션에 배포하려면:

```bash
npm run supabase:functions:deploy
```

## 추가 기능

### 특정 포스트만 마이그레이션

스크립트를 수정하여 특정 포스트만 마이그레이션할 수 있습니다.

### 이미지 파일 처리

현재는 마크다운 콘텐츠만 마이그레이션합니다. 이미지 파일은 별도로 처리해야 합니다.

### 영어 버전 처리

`.en.md` 파일은 현재 제외됩니다. 필요시 스크립트를 수정하여 영어 버전도 처리할 수 있습니다.

### 실시간 동기화

블로그 콘텐츠가 변경될 때마다 자동으로 DB를 업데이트하는 웹훅을 설정할 수 있습니다.

## 원격 vs 로컬 비교

| 기능 | 원격 DB | 로컬 DB |
|------|---------|---------|
| 설정 복잡도 | 간단 | Docker 필요 |
| 데이터 영속성 | 영구 | 임시 |
| API 접근성 | 전 세계 | 로컬만 |
| 비용 | Supabase 요금제 | 무료 |
| 개발 편의성 | 즉시 사용 가능 | 설정 필요 |

**추천**: 원격 Supabase DB 사용을 권장합니다. 