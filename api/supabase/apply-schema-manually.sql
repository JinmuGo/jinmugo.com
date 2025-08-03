-- Supabase 대시보드에서 직접 실행할 SQL 스크립트
-- Database > SQL Editor에서 실행하세요

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

-- Posts: Read-only access (posts are created by the system, not users)
CREATE POLICY "Posts are publicly readable" ON "posts" FOR SELECT USING (true);

-- IP post likes: Read and write access (IP-based restrictions handled in functions)
CREATE POLICY "IP post likes are publicly readable" ON "ip_post_likes" FOR SELECT USING (true);
CREATE POLICY "Anyone can insert IP post likes" ON "ip_post_likes" FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update IP post likes" ON "ip_post_likes" FOR UPDATE USING (true);

-- Post views: Read and insert access (no updates needed)
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

-- 테스트용 포스트 데이터 추가 (선택사항)
INSERT INTO "posts" ("slug") VALUES 
('proxy-no-more-retreat'),
('test-post-1'),
('test-post-2')
ON CONFLICT ("slug") DO NOTHING; 