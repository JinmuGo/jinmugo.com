import PocketBase from "pocketbase";

const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";

// PocketBase 클라이언트 인스턴스 생성
export const pb = new PocketBase(PB_URL);

pb.authStore.save(process.env.PB_TOKEN || "", null);
pb.autoCancellation(false);

// 타입 정의 - 현재 스키마에 맞게 수정
export interface BlogPost {
  id: string;
  slug: string;
  type: "post" | "memo";
  created: string;
  updated: string;
}

export interface PostLike {
  id: string;
  ip_address: string;
  post_id: string;
  count: number;
  created: string;
  updated: string;
}

export interface PostView {
  id: string;
  post_id: string;
  count: number;
  created: string;
  updated: string;
}

// PocketBase 컬렉션 이름 상수
export const COLLECTIONS = {
  POSTS: "posts",
  POST_LIKES: "post_likes",
  POST_VIEWS: "post_views",
} as const;
