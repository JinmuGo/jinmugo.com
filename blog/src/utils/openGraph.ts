import type { JSX } from "astro/jsx-runtime";
import satori from "satori";
import sharp from "sharp";

export async function SVG(component: JSX.Element) {
	return await satori(component, {
		width: 1200,
		height: 630,
		fonts: [
			{
				name: "Asta Sans",
				data: await fetch(
					"https://cdn.jsdelivr.net/gh/fonts-archive/AstaSans/AstaSans-Regular.otf",
				).then((res) => res.arrayBuffer()),
				weight: 400,
			},
			{
				name: "Asta Sans",
				data: await fetch(
					"https://cdn.jsdelivr.net/gh/fonts-archive/AstaSans/AstaSans-Bold.otf",
				).then((res) => res.arrayBuffer()),
				weight: 700,
			},
		],
	});
}

export async function PNG(component: JSX.Element) {
	return await sharp(Buffer.from(await SVG(component)))
		.png()
		.toBuffer();
}
