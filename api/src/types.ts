import { Context } from "hono";

// Cloudflare Workers Environment Bindings
export interface Env {
  DB: D1Database;  // D1 Database binding
}

export type AppContext = Context<{ Bindings: Env }>;

// Comment Schema
export const CommentSchema = {
  id: String,
  content: String,
  authorId: String,
  postId: Number,
  parentId: String,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date,
};

// Post Schema
export const PostSchema = {
  id: Number,
  slug: String,
};

// PostLike Schema  
export const PostLikeSchema = {
  userId: String,
  postId: Number,
  count: Number,
};

// PostView Schema
export const PostViewSchema = {
  id: Number,
  postId: Number,
  userId: String,
  viewedAt: Date,
};

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}
