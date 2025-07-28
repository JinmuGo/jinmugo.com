import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "../generated/client";

// D1 바인딩을 사용하는 Prisma 클라이언트 생성
const createPrismaClient = (d1: D1Database) => {
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ adapter });
};

// 마이그레이션 실행 함수
export async function migrateToD1(d1: D1Database) {
  const prisma = createPrismaClient(d1);

  try {
    // 스키마 동기화
    await prisma.$executeRaw`PRAGMA foreign_keys = ON`;

    // 테이블 생성 확인
    const _tables = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `;
  } finally {
    await prisma.$disconnect();
  }
}
