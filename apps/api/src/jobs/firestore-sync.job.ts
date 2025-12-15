import { db, FIRESTORE_COLLECTIONS, FIRESTORE_ENABLED } from "../lib/firestore.js";
import { firestoreStatsService } from "../services/firestore-stats.service.js";
import { pocketbaseStatsService } from "../services/pocketbase-stats.service.js";
import type { PostStatsDocument } from "../types/firestore.js";

const SYNC_ENABLED = process.env.SYNC_JOB_ENABLED === "true";

/**
 * 단일 문서 동기화 처리
 */
async function syncDocument(slug: string, data: PostStatsDocument) {
  try {
    // Views 동기화
    await pocketbaseStatsService.syncViewsFromFirestore(slug, data.total_views);

    // Likes 동기화
    await pocketbaseStatsService.syncLikesFromFirestore(slug, data.total_likes, data.likes_by_ip);

    // Last synced timestamp 업데이트 (Firestore에 다시 쓰기를 유발하므로 무한 루프 방지 필요)
    // 현재 구조에서는 last_synced_to_pb 업데이트가 'modified' 이벤트를 또 발생시킬 수 있음.
    // 따라서 여기서는 생략하거나, Firestore Security Rules 또는 필드 비교를 통해 루프를 방지해야 함.
    // 간단한 해결책: last_synced_to_pb 필드 변화는 무시하도록 리스너에서 필터링 가능하지만,
    // 여기서는 일단 업데이트를 수행하되, 리스너 내부에서 변경된 필드를 확인할 수 있다면 좋음.
    // 하지만 Admin SDK의 docChanges()는 필드 레벨 diff를 쉽게 주지 않음.
    // 대안: Firestore 업데이트를 수행하되, 이 업데이트로 인한 이벤트는 무시하는 로직이 필요함.
    // 가장 쉬운 방법: last_synced_to_pb만 변경된 경우는 동기화 로직을 건너뛰는 것.

    // 여기서는 일단 업데이트를 수행합니다. (무한 루프 방지 로직은 아래 리스너에서 처리)
    await firestoreStatsService.updateLastSyncedToPb(slug);
  } catch (_error) {}
}

/**
 * Sync Job 시작 (Real-time Listener)
 */
export function startSyncJob(): void {
  if (!SYNC_ENABLED) {
    return;
  }

  if (!FIRESTORE_ENABLED || !db) {
    return;
  }

  // Real-time Listener 등록
  const query = db.collection(FIRESTORE_COLLECTIONS.POST_STATS);

  const unsubscribe = query.onSnapshot(
    (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const data = change.doc.data() as PostStatsDocument;
        const slug = change.doc.id;

        if (change.type === "added" || change.type === "modified") {
          // 무한 루프 방지:
          // 만약 변경이 우리가 방금 수행한 'last_synced_to_pb' 업데이트 때문이라면 무시해야 함.
          // 이를 판단하기 위해, updated_at과 last_synced_to_pb를 비교하거나,
          // 데이터 내용(views, likes)이 실제 PB와 다른지 확인해야 함.

          // 간단한 휴리스틱:
          // last_synced_to_pb가 updated_at보다 크거나 같으면(최신이면) 동기화 불필요.
          // (Firestore Timestamp 객체 비교)

          const updatedAt = data.updated_at?.toMillis() || 0;
          const lastSynced = data.last_synced_to_pb?.toMillis() || 0;

          // 이미 동기화된 상태라면 스킵 (우리가 방금 업데이트한 경우)
          // 단, 약간의 오차를 허용하기 위해 lastSynced가 updated_at보다 1초 이내로 뒤쳐진 경우도 동기화된 것으로 간주할 수 있으나,
          // 여기서는 엄격하게 lastSynced >= updatedAt 이면 스킵합니다.
          if (lastSynced >= updatedAt) {
            // console.log(`[Sync Listener] Skipping ${slug} (already synced)`);
            return;
          }

          await syncDocument(slug, data);
        }
      });
    },
    (_error) => {},
  );

  // 프로세스 종료 시 리스너 해제 (선택 사항, 보통 서버 종료 시 같이 종료됨)
  process.on("SIGTERM", () => {
    unsubscribe();
  });
}
