-- Supabase PostgreSQL Schema
-- Generated from Prisma schema

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- User table
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT,
    "email" TEXT UNIQUE NOT NULL,
    "email_verified" TIMESTAMP WITH TIME ZONE,
    "image" TEXT,
    "role" user_role DEFAULT 'user',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post table
CREATE TABLE IF NOT EXISTS "posts" (
    "id" SERIAL PRIMARY KEY,
    "slug" TEXT UNIQUE NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment table
CREATE TABLE IF NOT EXISTS "comments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "author_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "post_id" INTEGER NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
    "parent_id" UUID REFERENCES "comments"("id") ON DELETE NO ACTION,
    "is_deleted" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment likes table
CREATE TABLE IF NOT EXISTS "comment_likes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "comment_id" UUID NOT NULL REFERENCES "comments"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("comment_id", "user_id")
);

-- Post likes table
CREATE TABLE IF NOT EXISTS "post_likes" (
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "post_id" INTEGER NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
    "count" INTEGER DEFAULT 1 CHECK (count >= 1 AND count <= 5),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY ("user_id", "post_id")
);

-- Post views table
CREATE TABLE IF NOT EXISTS "post_views" (
    "id" SERIAL PRIMARY KEY,
    "post_id" INTEGER NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
    "user_id" UUID REFERENCES "users"("id"),
    "viewed_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_comments_post_id" ON "comments"("post_id");
CREATE INDEX IF NOT EXISTS "idx_comments_author_id" ON "comments"("author_id");
CREATE INDEX IF NOT EXISTS "idx_comments_parent_id" ON "comments"("parent_id");
CREATE INDEX IF NOT EXISTS "idx_comment_likes_user_id" ON "comment_likes"("user_id");
CREATE INDEX IF NOT EXISTS "idx_post_likes_post_id" ON "post_likes"("post_id");
CREATE INDEX IF NOT EXISTS "idx_post_views_post_id" ON "post_views"("post_id");
CREATE INDEX IF NOT EXISTS "idx_post_views_user_id" ON "post_views"("user_id");

-- Enable Row Level Security
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comment_likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "post_likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "post_views" ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read all users
CREATE POLICY "Users can read all users" ON "users" FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON "users" FOR UPDATE USING (auth.uid() = id);

-- Posts are publicly readable
CREATE POLICY "Posts are publicly readable" ON "posts" FOR SELECT USING (true);

-- Comments are publicly readable
CREATE POLICY "Comments are publicly readable" ON "comments" FOR SELECT USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" ON "comments" FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON "comments" FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON "comments" FOR DELETE USING (auth.uid() = author_id);

-- Comment likes are publicly readable
CREATE POLICY "Comment likes are publicly readable" ON "comment_likes" FOR SELECT USING (true);

-- Authenticated users can manage their comment likes
CREATE POLICY "Users can manage own comment likes" ON "comment_likes" FOR ALL USING (auth.uid() = user_id);

-- Post likes are publicly readable
CREATE POLICY "Post likes are publicly readable" ON "post_likes" FOR SELECT USING (true);

-- Authenticated users can manage their post likes
CREATE POLICY "Users can manage own post likes" ON "post_likes" FOR ALL USING (auth.uid() = user_id);

-- Post views are publicly readable
CREATE POLICY "Post views are publicly readable" ON "post_views" FOR SELECT USING (true);

-- Anyone can create post views
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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON "comments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_post_likes_updated_at BEFORE UPDATE ON "post_likes" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 