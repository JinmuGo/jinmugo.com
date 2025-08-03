# 🚀 빠른 설정 가이드

## 현재 상황
- ✅ Edge Functions 배포 완료
- ❌ 데이터베이스 스키마 미적용
- ❌ 좋아요 기능 작동 안함

## 해결 방법

### 1. Supabase 대시보드에서 스키마 적용

1. [Supabase 대시보드](https://supabase.com/dashboard/project/dqsoxakdmrfocbutnjvm) 접속
2. **Database** → **SQL Editor** 클릭
3. 다음 SQL을 복사해서 붙여넣기:

```sql
-- 기존 테이블들 삭제 (필요한 경우)
DROP TABLE IF EXISTS "post_views" CASCADE;
DROP TABLE IF EXISTS "ip_post_likes" CASCADE;
DROP TABLE IF EXISTS "posts" CASCADE;

-- Post table
CREATE TABLE IF NOT EXISTS "posts" (
    "id" SERIAL PRIMARY KEY,
    "slug" TEXT UNIQUE NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IP-based post likes table (for anonymous users)
CREATE TABLE IF NOT EXISTS "ip_post_likes" (
    "id" SERIAL PRIMARY KEY,
    "ip_address" INET NOT NULL,
    "post_id" INTEGER NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
    "count" INTEGER DEFAULT 1 CHECK (count >= 1 AND count <= 5),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("ip_address", "post_id")
);

-- Post views table
CREATE TABLE IF NOT EXISTS "post_views" (
    "id" SERIAL PRIMARY KEY,
    "post_id" INTEGER NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
    "ip_address" INET,
    "viewed_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_ip_post_likes_post_id" ON "ip_post_likes"("post_id");
CREATE INDEX IF NOT EXISTS "idx_ip_post_likes_ip_address" ON "ip_post_likes"("ip_address");
CREATE INDEX IF NOT EXISTS "idx_post_views_post_id" ON "post_views"("post_id");
CREATE INDEX IF NOT EXISTS "idx_post_views_ip_address" ON "post_views"("ip_address");

-- Enable Row Level Security
ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ip_post_likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "post_views" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Posts are publicly readable" ON "posts" FOR SELECT USING (true);
CREATE POLICY "Anyone can create posts" ON "posts" FOR INSERT WITH CHECK (true);

CREATE POLICY "IP post likes are publicly readable" ON "ip_post_likes" FOR SELECT USING (true);
CREATE POLICY "Anyone can insert IP post likes" ON "ip_post_likes" FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update IP post likes" ON "ip_post_likes" FOR UPDATE USING (true);

CREATE POLICY "Post views are publicly readable" ON "post_views" FOR SELECT USING (true);
CREATE POLICY "Anyone can create post views" ON "post_views" FOR INSERT WITH CHECK (true);

-- Create functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_ip_post_likes_updated_at BEFORE UPDATE ON "ip_post_likes" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 테스트용 포스트 데이터 추가
INSERT INTO "posts" ("slug") VALUES 
('proxy-no-more-retreat'),
('test-post-1'),
('test-post-2')
ON CONFLICT ("slug") DO NOTHING;
```

4. **Run** 버튼 클릭

### 2. 브라우저 캐시 클리어

브라우저에서 강력 새로고침 (Cmd+Shift+R) 실행

### 3. 테스트

1. 블로그 포스트 페이지 방문
2. 좋아요 버튼 클릭
3. 개발자 도구에서 로그 확인

## 예상 결과

스키마 적용 후:
- ✅ 좋아요 클릭 시 데이터베이스 업데이트
- ✅ 총 좋아요 수 증가
- ✅ 꽃잎 애니메이션 작동
- ✅ IP별 최대 5개 제한 작동

## 문제 해결

만약 여전히 문제가 있다면:
1. 브라우저 개발자 도구의 Network 탭 확인
2. Supabase 대시보드의 Edge Functions 로그 확인
3. `/debug-likes` 페이지에서 상세 테스트 