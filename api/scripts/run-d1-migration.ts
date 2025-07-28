/// <reference types="../worker-configuration.d.ts" />

import { migrateToD1 } from "./migrate-to-d1";

interface Env {
  DB: D1Database;
}

// D1 마이그레이션 실행
export default {
  async fetch(_request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    try {
      await migrateToD1(env.DB);
      return new Response("D1 마이그레이션이 성공적으로 완료되었습니다!", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch (error) {
      return new Response(
        `마이그레이션 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
        {
          status: 500,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        },
      );
    }
  },
};
