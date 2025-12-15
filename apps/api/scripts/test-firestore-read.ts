import { readFileSync } from "node:fs";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Firestore 읽기 테스트 스크립트
 */
async function testFirestoreRead() {
  try {
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
      }
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    const doc = await db.collection("_test").doc("manual-test").get();

    if (doc.exists) {
    } else {
    }
    await db.collection("_test").doc("sdk-test").set({
      message: "Created by SDK",
      timestamp: new Date().toISOString(),
    });
    const writtenDoc = await db.collection("_test").doc("sdk-test").get();
    if (writtenDoc.exists) {
    }
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

testFirestoreRead();
