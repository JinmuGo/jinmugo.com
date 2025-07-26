import { useState } from "react";
import { useAsyncEffect } from "@/utils/useAsyncEffect";
import { Flower } from "./LikeFlower";

const CommentIcon = () => (
	<svg
		width="36"
		height="36"
		viewBox="0 0 800 800"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-label="Comment icon"
	>
		<title>Comment</title>
		<g clipPath="url(#clip0_461_256)">
			<mask
				id="mask0_461_256"
				style={{ maskType: "luminance" }}
				maskUnits="userSpaceOnUse"
				x="0"
				y="0"
				width="800"
				height="800"
			>
				<path d="M0 0H800V800H0V0Z" fill="white" />
			</mask>
			<g mask="url(#mask0_461_256)">
				<path
					d="M133.333 400C133.333 547.277 252.723 666.667 400 666.667C446.877 666.667 490.926 654.573 529.201 633.333C548.911 622.397 650.423 682.05 666.667 666.667C685.301 649.02 618.057 555.693 630.992 533.333C653.681 494.11 666.667 448.57 666.667 400C666.667 252.724 547.276 133.333 400 133.333C252.723 133.333 133.333 252.724 133.333 400Z"
					stroke="currentColor"
					strokeWidth="22.2222"
					strokeLinejoin="round"
				/>
			</g>
		</g>
		<defs>
			<clipPath id="clip0_461_256">
				<rect
					width="800"
					height="800"
					fill="currentColor"
					transform="matrix(-1 0 0 1 800 0)"
				/>
			</clipPath>
		</defs>
	</svg>
);

interface UserSectionHeaderProps {
	readonly slug: string;
	readonly commentVersion?: number;
}

export const UserSectionHeader: React.FC<UserSectionHeaderProps> = ({
	slug,
	commentVersion,
}) => {
	const [likes, setLikesAction] = useState<number>(-1);
	const [comments, setComments] = useState<Array<string> | null>(null);

	async function refresh() {
		try {
			const json = await fetch(`/api/like/${slug}/total`).then((res) =>
				res.json(),
			);

			setLikesAction(json.total);
		} catch {
			// 에러 핸들링
		}
	}

	async function like() {
		try {
			const data = await fetch(`/api/like/${slug}`, {
				method: "POST",
			});
			const json = await data.json();

			setLikesAction(json.you);
			return json.you;
		} catch (_error) {
			alert("로그인 후 이용해주세요.");
			return -1;
		}
	}

	useAsyncEffect(async () => {
		refresh();
		const comments = await fetch(`/api/comments/${slug}`);
		setComments(await comments.json());
	}, [slug, setComments]);

	useAsyncEffect(async () => {
		const comments = await fetch(`/api/comments/${slug}`);
		setComments(await comments.json());
	}, [commentVersion]);

	return (
		<div className="flex gap-2 items-center">
			<div className="flex gap-2 items-center">
				<Flower like={like} slug={slug} />
				<p className="select-none">{likes === -1 ? "..." : likes}</p>
			</div>
			<div className="flex gap-2 items-center">
				<CommentIcon />
				<p className="select-none">{comments?.length ?? "..."}</p>
			</div>
		</div>
	);
};
