import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import { getPrismaClient, getPostBySlug } from "../../lib/db";

export class GetTotalLikes extends OpenAPIRoute {
	schema = {
		tags: ["Like"],
		summary: "Get total likes for a post",
		description: "Retrieve the total like count for a specific post from all users",
		request: {
			params: z.object({
				slug: Str({ description: "Post slug" }),
			}),
		},
		responses: {
			"200": {
				description: "Total likes retrieved successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.object({
								total: z.number().min(0),
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
		try {
			// Get validated data
			const data = await this.getValidatedData<typeof this.schema>();
			const { slug } = data.params;

			// Check if post exists
			const post = await getPostBySlug(c, slug);
			if (!post) {
				return c.json({
					success: false,
					error: "Post not found"
				}, 404);
			}

			const prisma = getPrismaClient(c);

			try {
				// Get total likes for this post
				const result = await prisma.postLike.aggregate({
					where: { postId: post.id },
					_sum: { count: true },
				});

				return c.json({
					success: true,
					data: {
						total: result._sum.count ?? 0,
					},
				});

			} finally {
				await prisma.$disconnect();
			}

		} catch (error) {
			console.error("Error getting total likes:", error);
			return c.json({
				success: false,
				error: "Internal server error"
			}, 500);
		}
	}
} 