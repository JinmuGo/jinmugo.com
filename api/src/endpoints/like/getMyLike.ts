import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import { getPrismaClient, getPostBySlug } from "../../lib/db";

export class GetMyLike extends OpenAPIRoute {
	schema = {
		tags: ["Like"],
		summary: "Get my like status for a post",
		description: "Retrieve the current user's like count for a specific post",
		request: {
			params: z.object({
				slug: Str({ description: "Post slug" }),
			}),
			headers: z.object({
				"x-user-id": Str({ description: "User ID for authentication" }).optional(),
			}),
		},
		responses: {
			"200": {
				description: "Like status retrieved successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.object({
								you: z.number().min(0).max(5),
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
			const userId = data.headers?.["x-user-id"];

			// If no user ID, return 0 (guest user)
			if (!userId) {
				return c.json({
					success: true,
					data: {
						you: 0,
					},
				});
			}

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
				// Get user's like for this post
				const postLike = await prisma.postLike.findUnique({
					where: {
						userId_postId: { userId, postId: post.id },
					},
				});

				return c.json({
					success: true,
					data: {
						you: postLike?.count ?? 0,
					},
				});

			} finally {
				await prisma.$disconnect();
			}

		} catch (error) {
			console.error("Error getting my like:", error);
			return c.json({
				success: false,
				error: "Internal server error"
			}, 500);
		}
	}
} 