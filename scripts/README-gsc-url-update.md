# Google Search Console URL 업데이트 스크립트

URL 구조가 `posts/${category}/${slug}`에서 `posts/${slug}`로 변경되었을 때, Google Search Console에서 기존 URL들을 새로운 URL로 업데이트하는 스크립트들입니다.

## 스크립트 종류

### 1. `update-gsc-urls.js` (정적 매핑)
- 하드코딩된 URL 매핑을 사용
- 가장 안전하고 예측 가능한 방법
- 모든 포스트의 카테고리를 수동으로 확인하여 매핑

### 2. `update-gsc-urls-dynamic.js` (동적 매핑)
- sitemap.xml에서 새로운 URL 구조를 자동으로 감지
- 가능한 모든 카테고리 조합을 시도
- 더 많은 URL을 처리하지만 일부 잘못된 매핑이 포함될 수 있음

### 3. `update-gsc-urls-accurate.js` (정확한 매핑) ⭐ **추천**
- 실제 포스트 파일의 frontmatter에서 카테고리 정보를 추출
- 가장 정확한 URL 매핑 생성
- 한국어/영어 버전 자동 감지

## 사용 방법

### 1. 환경 변수 설정
`.env` 파일에 다음 변수들이 설정되어 있어야 합니다:

```env
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account",...}
GSC_SITE_URL=https://your-domain.com
GSC_PROPERTY_ID=https://your-domain.com
```

### 2. 스크립트 실행

```bash
# 정확한 매핑으로 업데이트 (추천)
node blog/scripts/update-gsc-urls-accurate.js

# 또는 동적 매핑으로 업데이트
node blog/scripts/update-gsc-urls-dynamic.js

# 또는 정적 매핑으로 업데이트
node blog/scripts/update-gsc-urls.js
```

## 스크립트 동작 방식

1. **URL 매핑 생성**: 기존 URL 구조에서 새로운 URL 구조로의 매핑을 생성
2. **새 URL 제출**: Google Indexing API를 통해 새로운 URL을 GSC에 제출
3. **기존 URL 삭제**: 기존 URL을 삭제 요청으로 GSC에 제출
4. **결과 요약**: 성공/실패 통계 출력

## 주의사항

### Google Search Console 제한사항
- GSC는 직접적인 URL 변경 API를 제공하지 않음
- 새로운 URL을 제출하고 기존 URL을 삭제하는 방식으로 처리
- API 호출 제한이 있으므로 요청 간 1초 간격을 둠

### 권한 요구사항
- 서비스 계정이 GSC 사이트에 대한 소유자/전체 사용자 권한이 있어야 함
- Google Indexing API 권한이 필요

### 백업 및 테스트
- 실행 전에 현재 GSC 상태를 백업하는 것을 권장
- 처음에는 소수의 URL로 테스트 후 전체 실행

## 문제 해결

### 권한 오류 (403)
```
❌ 권한 오류: 서비스 계정이 사이트에 대한 권한이 없습니다.
```
**해결 방법:**
1. Google Search Console에서 사이트 속성으로 이동
2. 설정 > 사용자 및 권한으로 이동
3. 서비스 계정 이메일을 소유자 또는 전체 사용자로 추가
4. 서비스 계정 이메일: `{service-account-email}@your-project.iam.gserviceaccount.com`

### URL 소유권 확인 실패
```
⚠️ URL ownership verification failed
```
**해결 방법:**
1. GSC에서 사이트 소유권 확인이 완료되었는지 확인
2. 서비스 계정이 올바른 사이트에 추가되었는지 확인
3. GSC_SITE_URL이 올바른지 확인

## 후속 작업

스크립트 실행 후 다음 작업을 권장합니다:

1. **GSC 확인**: Google Search Console에서 변경사항 확인
2. **성능 모니터링**: 검색 성능 변화 추적
3. **301 리다이렉트 설정**: 기존 URL에서 새 URL로 리다이렉트
4. **내부 링크 업데이트**: 사이트 내부의 기존 URL 링크 수정

## 로그 예시

```
🚀 Starting accurate URL updates in Google Search Console...
📋 Found 20 post directories
📋 Generated 38 accurate URL mappings

📝 URL Mappings:
   12th-9oormthon (experience) [KO]
     https://your-domain.com/posts/experience/12th-9oormthon -> https://your-domain.com/posts/12th-9oormthon
   12th-9oormthon (experience) [EN]
     https://your-domain.com/en/posts/experience/12th-9oormthon -> https://your-domain.com/en/posts/12th-9oormthon
   ...

📝 Processing: 12th-9oormthon (experience) [KO]
🔄 Updating URL in Google Search Console...
   Old: https://your-domain.com/posts/experience/12th-9oormthon
   New: https://your-domain.com/posts/12th-9oormthon
✅ New URL submitted successfully: https://your-domain.com/posts/12th-9oormthon
✅ Old URL deleted successfully: https://your-domain.com/posts/experience/12th-9oormthon

📊 Final Results:
✅ Successfully updated: 38 URLs
❌ Failed updates: 0 URLs
📈 Total attempted: 38

🎉 All URL updates completed successfully!
``` 