import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../../types";
import { getPrismaClient, getPostBySlug } from "../../lib/db";

export class LikePost extends OpenAPIRoute {
	schema = {
		tags: ["Like"],
		summary: "Add like to a post",
		description: "Increment like count for a specific post (max 5 per user)",
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
				description: "Like added successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: z.object({
								you: z.number().min(1).max(5),
							}),
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized - User ID required",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							error: Str(),
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

			// Check authentication
			if (!userId) {
				return c.json({
					success: false,
					error: "Unauthorized - User ID required"
				}, 401);
			}

			// Ensure post exists
			const post = await getPostBySlug(c, slug);
			if (!post) {
				return c.json({
					success: false,
					error: "Post not found"
				}, 404);
			}

			const prisma = getPrismaClient(c);

			try {
				// Upsert post like with increment (max 5)
				let postLike = await prisma.postLike.upsert({
					where: {
						userId_postId: { userId, postId: post.id },
					},
					create: {
						userId,
						postId: post.id,
						count: 1,
					},
					update: {
						count: { increment: 1 },
					},
				});

				// Ensure count doesn't exceed 5
				if (postLike.count > 5) {
					postLike = await prisma.postLike.update({
						where: {
							userId_postId: { userId, postId: post.id },
						},
						data: { count: 5 },
					});
				}

				return c.json({
					success: true,
					data: {
						you: postLike.count,
					},
				});

			} finally {
				await prisma.$disconnect();
			}

		} catch (error) {
			console.error("Error adding like:", error);
			return c.json({
				success: false,
				error: "Internal server error"
			}, 500);
		}
	}
} 