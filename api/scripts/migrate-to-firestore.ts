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
    console.error("Firestore is not initialized.");

    if (initializationError) {
      console.error("Initialization error:", initializationError.message);
      if (initializationError.message.includes("credentials")) {
        console.error(
          "\nPlease check your environment variables:",
          "\n  - GOOGLE_APPLICATION_CREDENTIALS (path to service account key file)",
          "\n  - FIREBASE_PROJECT_ID",
          "\n  - USE_FIRESTORE=true",
        );
      }
    } else {
      console.error(
        "Please check your environment variables:",
        "\n  - GOOGLE_APPLICATION_CREDENTIALS (path to service account key file)",
        "\n  - FIREBASE_PROJECT_ID",
        "\n  - USE_FIRESTORE=true",
      );
    }
    process.exit(1);
  }

  // PocketBase 클라이언트 설정
  const pbUrl = process.env.PB_URL || "http://127.0.0.1:8090";

  const pb = new PocketBase(pbUrl);

  pb.autoCancellation(false);
  const authResult = await pb
    .collection("_superusers")
    .authWithPassword(process.env.SUPERUSER_EMAIL || "", process.env.SUPERUSER_PASS || "", {
      autoRefreshThreshold: 30 * 60,
    });
  console.log(authResult);
  console.log("========================================");
  console.log("Starting PocketBase → Firestore migration...");
  console.log("========================================\n");

  try {
    // PocketBase에서 모든 포스트 조회
    const posts = await pb.collection<BlogPost>(COLLECTIONS.POSTS).getFullList({
      sort: "created",
    });

    console.log(`Found ${posts.length} posts to migrate\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const post of posts) {
      const { slug } = post;

      try {
        console.log(`Migrating: ${slug}`);

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
        console.log(firestoreDoc);

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

        console.log(
          `  ✓ Success: ${totalViews} views, ${totalLikes} likes (${Object.keys(likesByIp).length} unique IPs)`,
        );
        successCount++;
      } catch (error: unknown) {
        const err = error as Error & {
          code?: number;
          reason?: string;
          errorInfoMetadata?: { activationUrl?: string };
          details?: string;
          message?: string;
        };

        // 디버깅을 위한 상세 에러 정보 출력
        console.error(`  Debug info:`, {
          code: err.code,
          reason: err.reason,
          message: err.message,
          details: err.details,
        });

        // Firestore API 비활성화 에러 감지 (code 7 = PERMISSION_DENIED with SERVICE_DISABLED)
        if (err.code === 7 || err.reason === "SERVICE_DISABLED") {
          console.error(`  ✗ Error migrating ${slug}:`);
          console.error(
            `    Firestore API is not enabled for project: ${process.env.FIREBASE_PROJECT_ID}`,
          );
          console.error(
            `    Please enable it at: ${err.errorInfoMetadata?.activationUrl || `https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${process.env.FIREBASE_PROJECT_ID}`}`,
          );
          console.error(`    After enabling, wait a few minutes for the change to propagate.`);

          // 첫 번째 SERVICE_DISABLED 에러 발생 시 전체 마이그레이션 중단
          if (errorCount === 0) {
            console.error("\n⚠️  Firestore API is disabled. Stopping migration.");
            console.error("Please enable Firestore API and try again.");
            process.exit(1);
          }
        }
        // Firestore 데이터베이스 미생성 에러 감지 (code 5 = NOT_FOUND)
        else if (err.code === 5 || err.message?.includes("NOT_FOUND")) {
          console.log(err);
          console.error(`  ✗ Error migrating ${slug}:`);
          const databaseId = process.env.FIRESTORE_DATABASE_ID || "article-metadata";
          console.error(
            `    Firestore database not found for project: ${process.env.FIREBASE_PROJECT_ID}`,
          );
          console.error(`    Database ID: ${databaseId}`);
          console.error(
            `    The Firestore API may be enabled, but the database instance has not been created.`,
          );
          console.error(`    Please create a Firestore database:`);
          console.error(
            `    https://console.cloud.google.com/firestore?project=${process.env.FIREBASE_PROJECT_ID}`,
          );
          console.error(`    Steps:`);
          console.error(`    1. Click "데이터베이스 만들기" (Create Database)`);
          console.error(`    2. Select "Native mode" (권장)`);
          console.error(`    3. Choose a location (e.g., asia-northeast3 for Seoul)`);
          if (databaseId !== "(default)") {
            console.error(`    4. Set the database ID to: ${databaseId}`);
            console.error(`    5. Wait a few minutes for the database to be created`);
          } else {
            console.error(`    4. Wait a few minutes for the database to be created`);
          }

          // 첫 번째 NOT_FOUND 에러 발생 시 전체 마이그레이션 중단
          if (errorCount === 0) {
            console.error("\n⚠️  Firestore database not found. Stopping migration.");
            console.error("Please create a Firestore database and try again.");
            process.exit(1);
          }
        } else {
          console.error(`  ✗ Error migrating ${slug}:`, err.message || error);
          if (err.code) {
            console.error(`    Error code: ${err.code}`);
          }
        }
        errorCount++;
      }
    }

    console.log("\n========================================");
    console.log("Migration Summary:");
    console.log(`  Total posts: ${posts.length}`);
    console.log(`  Successful: ${successCount}`);
    console.log(`  Failed: ${errorCount}`);
    console.log("========================================");

    // 검증: Firestore에 저장된 문서 수 확인
    const firestoreSnapshot = await db.collection(FIRESTORE_COLLECTIONS.POST_STATS).get();
    console.log(`\nVerification: ${firestoreSnapshot.size} documents in Firestore`);

    if (firestoreSnapshot.size === posts.length) {
      console.log("✓ Migration completed successfully!");
    } else {
      console.warn(
        `⚠ Warning: Expected ${posts.length} documents, but found ${firestoreSnapshot.size}`,
      );
    }

    process.exit(0);
  } catch (error: unknown) {
    const err = error as Error & { code?: number; reason?: string };

    if (err.code === 7 || err.reason === "SERVICE_DISABLED") {
      console.error("\n✗ Migration failed: Firestore API is not enabled");
      console.error(`\nTo fix this:`);
      console.error(`1. Enable Firestore API:`);
      console.error(
        `   https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${process.env.FIREBASE_PROJECT_ID}`,
      );
      console.error(`2. Create a Firestore database:`);
      console.error(
        `   https://console.cloud.google.com/firestore?project=${process.env.FIREBASE_PROJECT_ID}`,
      );
      console.error(`3. Wait a few minutes for changes to propagate`);
      console.error(`4. Run the migration again`);
    } else {
      console.error("\n✗ Migration failed:", err.message || error);
    }
    process.exit(1);
  }
}

// 실행
migrateToFirestore();
