# Supabase 설정

이 디렉토리는 블로그의 좋아요와 조회수 기능을 위한 Supabase 설정을 포함합니다.

## 구조

```
supabase/
├── functions/           # Edge Functions
│   ├── debug-likes/     # 디버깅용 (개발 환경에서만 사용)
│   ├── get-my-ip-like/  # 현재 IP의 좋아요 수 조회
│   ├── get-post-view/   # 포스트 조회수 조회
│   ├── get-total-likes/ # 총 좋아요 수 조회
│   ├── increment-post-view/ # 조회수 증가
│   └── like-post-ip/    # IP 기반 좋아요 추가
├── migrations/          # 데이터베이스 마이그레이션
├── apply-schema-manually.sql # 수동 스키마 적용용
├── schema.sql          # 현재 스키마
├── QUICK_SETUP.md      # 빠른 설정 가이드
└── TROUBLESHOOTING.md  # 문제 해결 가이드
```

## 주요 기능

### 좋아요 시스템
- IP 기반 좋아요 (사용자 인증 불필요)
- IP당 최대 5개 제한
- 실시간 UI 업데이트

### 조회수 시스템
- IP 기반 조회수 추적
- 자동 포스트 생성

## 설정 방법

1. **스키마 적용**: `QUICK_SETUP.md` 참조
2. **Edge Functions 배포**: `supabase functions deploy [function-name]`
3. **프론트엔드 연동**: `useLike`, `useViewCount` 훅 사용

## 데이터베이스 스키마

### posts
- `id`: 기본 키
- `slug`: 포스트 식별자 (고유)
- `created_at`: 생성 시간

### ip_post_likes
- `id`: 기본 키
- `ip_address`: 클라이언트 IP
- `post_id`: 포스트 참조
- `count`: 좋아요 수 (1-5)
- `created_at`, `updated_at`: 타임스탬프

### post_views
- `id`: 기본 키
- `post_id`: 포스트 참조
- `ip_address`: 클라이언트 IP
- `viewed_at`: 조회 시간

## API 엔드포인트

- `POST /functions/v1/like-post-ip/[slug]` - 좋아요 추가
- `GET /functions/v1/get-my-ip-like/[slug]` - 내 좋아요 수 조회
- `GET /functions/v1/get-total-likes/[slug]` - 총 좋아요 수 조회
- `POST /functions/v1/increment-post-view/[slug]` - 조회수 증가
- `GET /functions/v1/get-post-view/[slug]` - 조회수 조회

## 개발 도구

- `debug-likes`: 디버깅용 함수 (개발 환경에서만 사용)
- `TROUBLESHOOTING.md`: 문제 해결 가이드
- `QUICK_SETUP.md`: 빠른 설정 가이드 