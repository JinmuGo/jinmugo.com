# Supabase 에러 해결 가이드

## 문제 상황

### 404 에러
- `GET https://dqsoxakdmrfocbutnjvm.supabase.co/functions/v1/get-my-ip-like/proxy-no-more-retreat 404 (Not Found)`
- `GET https://dqsoxakdmrfocbutnjvm.supabase.co/functions/v1/get-total-likes/proxy-no-more-retreat 404 (Not Found)`

### 500 에러
- `POST https://dqsoxakdmrfocbutnjvm.supabase.co/functions/v1/increment-post-view/proxy-no-more-retreat 500 (Internal Server Error)`
- `GET https://dqsoxakdmrfocbutnjvm.supabase.co/functions/v1/get-total-likes/proxy-no-more-retreat 500 (Internal Server Error)`

## 원인

### 404 에러
데이터베이스 스키마가 제대로 적용되지 않아서 Edge Functions에서 필요한 테이블을 찾을 수 없음

### 500 에러
Edge Functions가 이전 스키마 구조를 참조하고 있어서 새로운 스키마와 호환되지 않음

## 해결 방법

### 1. Supabase 대시보드에서 스키마 적용

1. [Supabase 대시보드](https://supabase.com/dashboard/project/dqsoxakdmrfocbutnjvm)에 접속
2. **Database** → **SQL Editor** 클릭
3. `api/supabase/apply-schema-manually.sql` 파일의 내용을 복사해서 붙여넣기
4. **Run** 버튼 클릭

### 2. Edge Functions 재배포

```bash
cd api/supabase
supabase functions deploy increment-post-view
supabase functions deploy get-post-view
supabase functions deploy get-total-likes
supabase functions deploy like-post-ip
supabase functions deploy get-my-ip-like
supabase functions deploy debug-likes
```

### 3. 스키마 적용 확인

SQL Editor에서 다음 쿼리를 실행하여 테이블이 생성되었는지 확인:

```sql
-- 테이블 목록 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('posts', 'ip_post_likes', 'post_views');

-- posts 테이블 데이터 확인
SELECT * FROM posts LIMIT 5;

-- RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 4. 테스트 데이터 추가

필요한 경우 테스트 포스트를 추가:

```sql
INSERT INTO "posts" ("slug") VALUES 
('proxy-no-more-retreat'),
('test-post-1'),
('test-post-2')
ON CONFLICT ("slug") DO NOTHING;
```

### 5. 브라우저 캐시 클리어

브라우저에서 강력 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)을 실행하여 캐시를 클리어

## 좋아요 기능 테스트

### 1. 디버깅 페이지 사용

브라우저에서 `/debug-likes` 페이지에 접속하여 좋아요 기능을 테스트할 수 있습니다.

### 2. 개발자 도구 활용

1. **Console 탭**: 상세한 로그 확인
   - 좋아요 클릭 시 API 호출 과정
   - 데이터베이스 업데이트 결과
   - 에러 메시지

2. **Network 탭**: API 요청/응답 확인
   - `like-post-ip`: 좋아요 추가 요청
   - `get-my-ip-like`: 내 좋아요 수 조회
   - `get-total-likes`: 총 좋아요 수 조회
   - `debug-likes`: 디버깅 정보

### 3. 확인 사항

- ✅ 좋아요 클릭 시 데이터베이스에 레코드 생성/업데이트
- ✅ 총 좋아요 수 증가
- ✅ IP별 최대 5개 제한 작동
- ✅ 꽃잎 애니메이션 올바르게 표시
- ✅ 로딩 상태 표시
- ✅ 에러 메시지 표시

## 주요 변경사항

### 스키마 변경
- `user_id` → `ip_address` (조회수 테이블)
- 자동 포스트 생성 기능 추가
- IP 기반 좋아요 시스템

### Edge Functions 변경
- `increment-post-view`: IP 주소 사용, 자동 포스트 생성
- `get-post-view`: 존재하지 않는 포스트에 대해 0 반환
- `get-total-likes`: 존재하지 않는 포스트에 대해 0 반환
- `like-post-ip`: IP 기반 좋아요 추가/업데이트
- `get-my-ip-like`: 현재 IP의 좋아요 수 조회
- `debug-likes`: 디버깅 정보 제공

### 프론트엔드 개선
- 상세한 로깅 추가
- 디버깅 기능 추가
- 로딩 상태 표시
- 에러 처리 개선
- 툴팁 메시지 개선

## 예상 결과

스키마와 Edge Functions가 제대로 적용되면:
- 404/500 에러가 사라짐
- 좋아요 기능이 정상 작동
- 조회수 기능이 정상 작동
- 에러 메시지가 더 명확하게 표시됨
- 새로운 포스트가 자동으로 생성됨
- 디버깅 정보를 통해 문제 해결 가능

## 추가 디버깅

만약 여전히 문제가 있다면:

1. **브라우저 개발자 도구**에서 Network 탭을 확인하여 정확한 에러 메시지 확인
2. **Supabase 대시보드**에서 Edge Functions 로그 확인
3. **Database** → **Logs**에서 데이터베이스 에러 확인
4. **Edge Functions** → **Functions**에서 각 함수의 로그 확인
5. **디버깅 페이지**(`/debug-likes`)에서 상세한 로그 확인

## 테스트 방법

1. 블로그 포스트 페이지 방문
2. 조회수가 정상적으로 표시되는지 확인
3. 좋아요 버튼을 클릭하여 정상 작동하는지 확인
4. 개발자 도구에서 네트워크 요청이 성공하는지 확인
5. 디버깅 페이지에서 상세한 테스트 수행 