import { FieldValue } from "firebase-admin/firestore";
import PocketBase from "pocketbase";
import { db, FIRESTORE_COLLECTIONS, initializationError } from "../src/lib/firestore";
import { type BlogPost, COLLECTIONS } from "../src/lib/pocketbase";
import type { PostStatsCreate } from "../src/types/firestore";

/**
 * PocketBase → Firestore 일회성 데이터 마이그레이션
 *
 * 실행 방법:
 * pnpm tsx --env-file .env scripts/migrate-to-firestore.ts
 */
async function migrateToFirestore() {
  if (!db) {
    if (initializationError) {
      if (initializationError.message.includes("credentials")) {
      }
    } else {
    }
    process.exit(1);
  }

  // PocketBase 클라이언트 설정
  const pbUrl = process.env.PB_URL || "http://127.0.0.1:8090";

  const pb = new PocketBase(pbUrl);

  pb.autoCancellation(false);
  const _authResult = await pb
    .collection("_superusers")
    .authWithPassword(process.env.SUPERUSER_EMAIL || "", process.env.SUPERUSER_PASS || "", {
      autoRefreshThreshold: 30 * 60,
    });

  try {
    // PocketBase에서 모든 포스트 조회
    const posts = await pb.collection<BlogPost>(COLLECTIONS.POSTS).getFullList({
      sort: "created",
    });

    let _successCount = 0;
    let errorCount = 0;

    for (const post of posts) {
      const { slug } = post;

      try {
        // Views 조회
        const viewsResult = await pb.collection(COLLECTIONS.POST_VIEWS).getList(1, 1, {
          filter: `post_id = "${post.id}"`,
        });
        const totalViews = viewsResult.items[0]?.count || 0;

        // Likes 조회
        const likesResult = await pb.collection(COLLECTIONS.POST_LIKES).getFullList({
          filter: `post_id = "${post.id}"`,
        });

        const likesByIp: { [ip: string]: number } = {};
        let totalLikes = 0;

        for (const like of likesResult) {
          likesByIp[like.ip_address] = like.count || 0;
          totalLikes += like.count || 0;
        }

        // Firestore document 생성
        const firestoreDoc: Omit<PostStatsCreate, "last_synced_to_pb"> = {
          slug,
          total_views: totalViews,
          total_likes: totalLikes,
          likes_by_ip: likesByIp,
        };

        // Firestore에 저장
        await db
          .collection(FIRESTORE_COLLECTIONS.POST_STATS)
          .doc(slug)
          .set({
            ...firestoreDoc,
            created_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp(),
            last_synced_to_pb: FieldValue.serverTimestamp(),
          });
        _successCount++;
      } catch (error: unknown) {
        const err = error as Error & {
          code?: number;
          reason?: string;
          errorInfoMetadata?: { activationUrl?: string };
          details?: string;
          message?: string;
        };

        // Firestore API 비활성화 에러 감지 (code 7 = PERMISSION_DENIED with SERVICE_DISABLED)
        if (err.code === 7 || err.reason === "SERVICE_DISABLED") {
          // 첫 번째 SERVICE_DISABLED 에러 발생 시 전체 마이그레이션 중단
          if (errorCount === 0) {
            process.exit(1);
          }
        }
        // Firestore 데이터베이스 미생성 에러 감지 (code 5 = NOT_FOUND)
        else if (err.code === 5 || err.message?.includes("NOT_FOUND")) {
          const databaseId = process.env.FIRESTORE_DATABASE_ID || "article-metadata";
          if (databaseId !== "(default)") {
          } else {
          }

          // 첫 번째 NOT_FOUND 에러 발생 시 전체 마이그레이션 중단
          if (errorCount === 0) {
            process.exit(1);
          }
        } else {
          if (err.code) {
          }
        }
        errorCount++;
      }
    }

    // 검증: Firestore에 저장된 문서 수 확인
    const firestoreSnapshot = await db.collection(FIRESTORE_COLLECTIONS.POST_STATS).get();

    if (firestoreSnapshot.size === posts.length) {
    } else {
    }

    process.exit(0);
  } catch (error: unknown) {
    const err = error as Error & { code?: number; reason?: string };

    if (err.code === 7 || err.reason === "SERVICE_DISABLED") {
    } else {
    }
    process.exit(1);
  }
}

// 실행
migrateToFirestore();
