import type { InferGetStaticParamsType } from "astro";
import { OpenGraphImage } from "@/components/og/image";
import { PNG } from "@/utils/openGraph";
import { getEnglishPosts } from "@/content-utils/posts";

const posts = await getEnglishPosts();

type Params = InferGetStaticParamsType<typeof getStaticPaths>;

export async function GET({ params }: { params: Params }) {
	const post = posts.find(
		(post) => post.slug === params.slug,
	);
	if (!post) {
		return new Response("Post not found", { status: 404 });
	}

	const element = OpenGraphImage({
		title: post.data.title,
		summary: post.data.summary,
		category: post.data.category,
	});

	const png = await PNG(element);
	return new Response(png, {
		headers: {
			"Content-Type": "image/png",
		},
	});
}

export async function getStaticPaths() {
	return posts.map((post) => ({
		params: { slug: post.slug },
		props: post.data,
	}));
}
