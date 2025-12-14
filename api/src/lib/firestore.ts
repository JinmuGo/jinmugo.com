import { readFileSync } from "node:fs";
import admin from "firebase-admin";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const FIRESTORE_ENABLED = process.env.USE_FIRESTORE === "true";

let db: admin.firestore.Firestore | null = null;
let initializationError: Error | null = null;

// Firestore 클라이언트 초기화 (프로덕션/개발 환경만)
if (FIRESTORE_ENABLED && process.env.NODE_ENV !== "test") {
  try {
    if (getApps().length === 0) {
      // Firebase Admin 초기화 (Singleton 패턴)
      // Cloud Run에서는 환경변수 없이도 자동으로 권한을 가져오지만(Default Credentials),
      // 로컬 개발을 위해 서비스 계정 키를 사용합니다.
      let firebaseConfig: { credential?: ReturnType<typeof cert>; projectId?: string } = {};

      // GOOGLE_APPLICATION_CREDENTIALS가 파일 경로인 경우
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        try {
          const serviceAccount = JSON.parse(
            readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8"),
          );
          // 서비스 계정 키 형식인지 확인 (type이 'service_account'이고 project_id가 있어야 함)
          if (serviceAccount.type === "service_account" && serviceAccount.project_id) {
            firebaseConfig = {
              credential: cert(serviceAccount),
              projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
            };
            console.log("[Firestore] Using GOOGLE_APPLICATION_CREDENTIALS");
            console.log(
              `[Firestore] Credentials file: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`,
            );
          } else {
            // OAuth 2.0 형식이거나 서비스 계정 키가 아닌 경우 Default Credentials 사용
            if (process.env.NODE_ENV === "development") {
              console.warn(
                "[Firestore] GOOGLE_APPLICATION_CREDENTIALS is not a service account key, Firestore will use default credentials",
              );
            }
            // firebaseConfig는 빈 객체로 유지하여 Default Credentials 사용
            firebaseConfig = {
              projectId: process.env.FIREBASE_PROJECT_ID,
            };
          }
        } catch (error) {
          // 파일 읽기 실패는 개발 환경에서는 경고, 프로덕션에서는 에러
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `[Firestore] Failed to read GOOGLE_APPLICATION_CREDENTIALS file, Firestore will use default credentials: ${error instanceof Error ? error.message : String(error)}`,
            );
            firebaseConfig = {
              projectId: process.env.FIREBASE_PROJECT_ID,
            };
          } else {
            const err = new Error(
              `Failed to read GOOGLE_APPLICATION_CREDENTIALS file: ${error instanceof Error ? error.message : String(error)}`,
            );
            initializationError = err;
            console.error("[Firestore] Initialization failed:", err.message);
            throw err;
          }
        }
      } else {
        // 환경변수가 없으면 Default Credentials 사용 (Cloud Run 환경용)
        if (!process.env.FIREBASE_PROJECT_ID) {
          const error = new Error(
            "Firestore credentials missing. Required: GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to service account key file, or FIREBASE_PROJECT_ID for default credentials",
          );
          initializationError = error;
          console.error("[Firestore] Initialization failed:", error.message);
        } else {
          firebaseConfig = {
            projectId: process.env.FIREBASE_PROJECT_ID,
          };
          console.log("[Firestore] Using default credentials (Cloud Run environment)");
        }
      }

      // Firebase App 초기화
      if (!initializationError) {
        const app = initializeApp(firebaseConfig);
        console.log(
          `[Firestore] Initialized for project: ${app.options.projectId || process.env.FIREBASE_PROJECT_ID}`,
        );
        console.log(`[Firestore] App name: ${app.name}`);
      }
    }

    // 초기화가 성공했거나 이미 초기화된 경우에만 Firestore 인스턴스 생성
    if (getApps().length > 0 && !initializationError) {
      const app = getApp();
      const databaseId = process.env.FIRESTORE_DATABASE_ID || "(default)";

      // Firestore 인스턴스 생성 - 데이터베이스 ID를 직접 전달
      // "(default)"는 기본 데이터베이스를 의미하며, getFirestore의 두 번째 인자로 전달하지 않으면 기본값 사용
      db = databaseId !== "(default)" ? getFirestore(app, databaseId) : getFirestore(app);

      console.log("[Firestore] Firestore instance created successfully");
      console.log(
        `[Firestore] Using database: ${databaseId} in project: ${app.options.projectId || process.env.FIREBASE_PROJECT_ID}`,
      );
    }
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error(String(error));
    console.error("[Firestore] Initialization error:", initializationError.message);
    db = null;
  }
}

// 컬렉션 이름 상수
export const FIRESTORE_COLLECTIONS = {
  POST_STATS: "post_stats",
} as const;

export { db, FIRESTORE_ENABLED, admin, initializationError };
