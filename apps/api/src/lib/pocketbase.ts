import PocketBase from "pocketbase";

/**
 * PocketBase 인증을 초기화합니다.
 * superuser로 인증하여 관리자 권한을 획득합니다.
 */
async function initializePocketBase(): Promise<PocketBase> {
  const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";

  // PocketBase 클라이언트 인스턴스 생성
  const pb = new PocketBase(PB_URL);

  if (process.env.NODE_ENV === "test") {
    return pb;
  }

  pb.autoCancellation(false);

  try {
    const _authResult = await pb
      .collection("_superusers")
      .authWithPassword(process.env.SUPERUSER_EMAIL || "", process.env.SUPERUSER_PASS || "", {
        // This will trigger auto refresh or auto reauthentication in case
        // the token has expired or is going to expire in the next 30 minutes.
        autoRefreshThreshold: 30 * 60,
      });
    return pb;
  } catch (error: unknown) {
    const err = error as Error & {
      code?: number;
      reason?: string;
      errorInfoMetadata?: { activationUrl?: string };
      details?: string;
      message?: string;
    };
    throw err;
  }
}

const pb = await initializePocketBase();

export { pb, initializePocketBase };

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
