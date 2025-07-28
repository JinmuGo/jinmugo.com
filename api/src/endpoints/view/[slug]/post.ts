import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { getPostBySlug, getPrismaClient } from "../../../lib/db";
import type { AppContext } from "../../../types";

export class IncrementPostView extends OpenAPIRoute {
  schema = {
    tags: ["View"],
    summary: "Increment post view count",
    description: "특정 post의 조회수 증가",
    request: {
      params: z.object({
        slug: Str({ description: "Post slug" }),
      }),
    },
    responses: {
      "200": {
        description: "조회수 증가 성공",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              data: z.object({
                views: z.number().min(0),
              }),
            }),
          },
        },
      },
      "404": {
        description: "Post not found",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              error: Str(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const { slug } = data.params;
    const post = await getPostBySlug(c, slug);
    if (!post) {
      return c.json({ success: false, error: "Post not found" }, 404);
    }
    const prisma = getPrismaClient(c);
    try {
      await prisma.postView.create({
        data: {
          postId: post.id,
          viewedAt: new Date(),
        },
      });
      const viewCount = await prisma.postView.count({ where: { postId: post.id } });
      return c.json({ success: true, data: { views: viewCount } });
    } finally {
      await prisma.$disconnect();
    }
  }
}
