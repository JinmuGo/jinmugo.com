import PocketBase from "pocketbase";
import { logger } from "./logger";

const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";

// PocketBase 클라이언트 인스턴스 생성
const pb = new PocketBase(PB_URL);

pb.autoCancellation(false);

// PocketBase 인증 함수 (비동기)
export const authenticatePocketBase = async (): Promise<void> => {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  try {
    await pb
      .collection("_superusers")
      .authWithPassword(process.env.SUPERUSER_EMAIL || "", process.env.SUPERUSER_PASS || "", {
        // This will trigger auto refresh or auto reauthentication in case
        // the token has expired or is going to expire in the next 30 minutes.
        autoRefreshThreshold: 30 * 60,
      });
    logger.info("✅ PocketBase 인증 성공");
  } catch (error) {
    logger.error("❌ PocketBase 인증 실패:", error);
    throw error;
  }
};

export { pb };

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
