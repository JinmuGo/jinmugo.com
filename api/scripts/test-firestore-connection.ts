import { readFileSync } from "node:fs";
import admin from "firebase-admin";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Firestore 연결 테스트 스크립트
 */
async function testFirestoreConnection() {
  console.log("========================================");
  console.log("Testing Firestore Connection");
  console.log("========================================\n");

  try {
    console.log("1. Initializing Firebase Admin SDK...");

    // Firebase Admin 초기화
    let firebaseConfig: { credential?: ReturnType<typeof cert>; projectId?: string } = {};

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        const serviceAccount = JSON.parse(
          readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8"),
        );
        if (serviceAccount.type === "service_account" && serviceAccount.project_id) {
          firebaseConfig = {
            credential: cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
          };
          console.log(`   Using credentials from: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
        } else {
          firebaseConfig = {
            projectId: process.env.FIREBASE_PROJECT_ID,
          };
        }
      } catch (error) {
        throw new Error(
          `Failed to read GOOGLE_APPLICATION_CREDENTIALS: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    } else {
      throw new Error(
        "Missing credentials: GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to service account key file",
      );
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    console.log(`   ✓ Project: ${app.options.projectId || process.env.FIREBASE_PROJECT_ID}`);
    console.log(`   ✓ App Name: ${app.name}\n`);

    // Firestore 인스턴스 생성
    console.log("2. Getting Firestore instance...");
    const databaseId = process.env.FIRESTORE_DATABASE_ID || "(default)";
    const db = databaseId !== "(default)" ? getFirestore(app, databaseId) : getFirestore(app);
    console.log(`   ✓ Firestore instance created (database: ${databaseId})\n`);

    // 테스트 컬렉션에 문서 작성 시도
    console.log("3. Attempting to write a test document...");
    const testDoc = {
      test: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: "Connection test",
    };

    await db.collection("_test").doc("connection-test").set(testDoc);
    console.log("   ✓ Test document written successfully\n");

    // 문서 읽기 시도
    console.log("4. Attempting to read the test document...");
    const doc = await db.collection("_test").doc("connection-test").get();
    console.log("   ✓ Test document read successfully");
    console.log("   Data:", doc.data());
    console.log();

    // 테스트 문서 삭제
    console.log("5. Cleaning up test document...");
    await db.collection("_test").doc("connection-test").delete();
    console.log("   ✓ Test document deleted\n");

    console.log("========================================");
    console.log("✓ Connection test PASSED");
    console.log("========================================");
    process.exit(0);
  } catch (error) {
    const err = error as Error & {
      code?: number;
      details?: string;
      reason?: string;
    };

    console.error("\n========================================");
    console.error("✗ Connection test FAILED");
    console.error("========================================");
    console.error("\nError details:");
    console.error("  Message:", err.message);
    console.error("  Code:", err.code);
    console.error("  Reason:", err.reason);
    console.error("  Details:", err.details);
    console.error("\nFull error:", error);

    process.exit(1);
  }
}

testFirestoreConnection();
