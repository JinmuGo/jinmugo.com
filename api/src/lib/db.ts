import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "../../generated";
import type { AppContext } from "../types";

// Prisma Client 인스턴스 반환 (Cloudflare D1 환경)
export function getPrismaClient(c: AppContext) {
  // Cloudflare Workers 환경에서는 항상 D1 어댑터 사용
  // 로컬 개발 시에는 wrangler dev가 로컬 D1 인스턴스를 제공
  const adapter = new PrismaD1(c.env.DB);
  return new PrismaClient({ adapter } as unknown);
}

// slug로 post를 찾는 함수
export async function getPostBySlug(c: AppContext, slug: string) {
  const prisma = getPrismaClient(c);
  try {
    const post = await prisma.post.findFirst({ where: { slug } });
    return post;
  } finally {
    await prisma.$disconnect();
  }
}
