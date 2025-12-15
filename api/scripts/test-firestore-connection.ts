import { readFileSync } from "node:fs";
import admin from "firebase-admin";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Firestore 연결 테스트 스크립트
 */
async function testFirestoreConnection() {
  try {
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
    const databaseId = process.env.FIRESTORE_DATABASE_ID || "(default)";
    const db = databaseId !== "(default)" ? getFirestore(app, databaseId) : getFirestore(app);
    const testDoc = {
      test: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: "Connection test",
    };

    await db.collection("_test").doc("connection-test").set(testDoc);
    const _doc = await db.collection("_test").doc("connection-test").get();
    await db.collection("_test").doc("connection-test").delete();
    process.exit(0);
  } catch (error) {
    const _err = error as Error & {
      code?: number;
      details?: string;
      reason?: string;
    };

    process.exit(1);
  }
}

testFirestoreConnection();
