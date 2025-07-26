import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../../types";
import { getPrismaClient, getPostBySlug } from "../../../lib/db";

export class GetPostView extends OpenAPIRoute {
  schema = {
    tags: ["View"],
    summary: "Get post view count",
    description: "특정 post의 조회수 조회",
    request: {
      params: z.object({
        slug: Str({ description: "Post slug" }),
      }),
    },
    responses: {
      "200": {
        description: "조회수 조회 성공",
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
      const viewCount = await prisma.postView.count({ where: { postId: post.id } });
      return c.json({ success: true, data: { views: viewCount } });
    } finally {
      await prisma.$disconnect();
    }
  }
} 