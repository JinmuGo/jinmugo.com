import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string | null;
          email: string;
          email_verified: string | null;
          image: string | null;
          role: "user" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          email: string;
          email_verified?: string | null;
          image?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string;
          email_verified?: string | null;
          image?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: number;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          slug?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          content: string;
          author_id: string;
          post_id: number;
          parent_id: string | null;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          author_id: string;
          post_id: number;
          parent_id?: string | null;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          author_id?: string;
          post_id?: number;
          parent_id?: string | null;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      comment_likes: {
        Row: {
          id: string;
          comment_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          comment_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          comment_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      post_likes: {
        Row: {
          user_id: string;
          post_id: number;
          count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          post_id: number;
          count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          post_id?: number;
          count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      post_views: {
        Row: {
          id: number;
          post_id: number;
          user_id: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: number;
          post_id: number;
          user_id?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: number;
          post_id?: number;
          user_id?: string | null;
          viewed_at?: string;
        };
      };
    };
  };
}
