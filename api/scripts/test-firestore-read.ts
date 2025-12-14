import { readFileSync } from "node:fs";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Firestore 읽기 테스트 스크립트
 */
async function testFirestoreRead() {
  console.log("========================================");
  console.log("Testing Firestore READ");
  console.log("========================================\n");

  try {
    console.log("1. Initializing Firebase Admin SDK...");

    let firebaseConfig: { credential?: ReturnType<typeof cert>; projectId?: string } = {};

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const serviceAccount = JSON.parse(
        readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8"),
      );
      if (serviceAccount.type === "service_account" && serviceAccount.project_id) {
        firebaseConfig = {
          credential: cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
        };
        console.log(`   Using credentials from: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
      }
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    console.log(`   ✓ Project: ${app.options.projectId || process.env.FIREBASE_PROJECT_ID}`);
    console.log(`   ✓ App Name: ${app.name}\n`);

    // Firestore 인스턴스 생성
    console.log("2. Getting Firestore instance...");

    // Try different database ID formats
    console.log("   Trying (default)...");
    const db = getFirestore(app);
    console.log(`   ✓ Firestore instance created with default\n`);

    // 수동으로 만든 문서 읽기 시도
    console.log("3. Attempting to read the manually created document...");
    const doc = await db.collection("_test").doc("manual-test").get();

    if (doc.exists) {
      console.log("   ✓ Document read successfully!");
      console.log("   Data:", doc.data());
      console.log();
    } else {
      console.log("   ✗ Document does not exist");
      console.log();
    }

    // 이제 쓰기를 시도
    console.log("4. Attempting to write a new document...");
    await db.collection("_test").doc("sdk-test").set({
      message: "Created by SDK",
      timestamp: new Date().toISOString(),
    });
    console.log("   ✓ Document written successfully!\n");

    // 방금 쓴 문서 읽기
    console.log("5. Reading back the document we just wrote...");
    const writtenDoc = await db.collection("_test").doc("sdk-test").get();
    if (writtenDoc.exists) {
      console.log("   ✓ Document read successfully!");
      console.log("   Data:", writtenDoc.data());
      console.log();
    }

    console.log("========================================");
    console.log("✓ All tests PASSED");
    console.log("========================================");
    process.exit(0);
  } catch (error) {
    const err = error as Error & {
      code?: number;
      details?: string;
      reason?: string;
    };

    console.error("\n========================================");
    console.error("✗ Test FAILED");
    console.error("========================================");
    console.error("\nError details:");
    console.error("  Message:", err.message);
    console.error("  Code:", err.code);
    console.error("  Reason:", err.reason);
    console.error("  Details:", err.details);

    process.exit(1);
  }
}

testFirestoreRead();
