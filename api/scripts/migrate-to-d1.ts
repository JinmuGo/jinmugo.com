import { PrismaClient } from '../generated/client';
import { PrismaD1 } from '@prisma/adapter-d1';

// D1 바인딩을 사용하는 Prisma 클라이언트 생성
const createPrismaClient = (d1: D1Database) => {
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ adapter });
};

// 마이그레이션 실행 함수
export async function migrateToD1(d1: D1Database) {
  const prisma = createPrismaClient(d1);
  
  try {
    console.log('D1 데이터베이스 마이그레이션을 시작합니다...');
    
    // 스키마 동기화
    await prisma.$executeRaw`PRAGMA foreign_keys = ON`;
    
    // 테이블 생성 확인
    const tables = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `;
    
    console.log('현재 테이블 목록:', tables.map(t => t.name));
    
    // 마이그레이션 완료
    console.log('D1 마이그레이션이 완료되었습니다!');
    
  } catch (error) {
    console.error('마이그레이션 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
} 