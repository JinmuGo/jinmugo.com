interface OpengraphImageProps {
	title: string;
	summary?: string;
	category?: string;
}

export const OpenGraphImage = ({
	title,
	summary,
	category,
}: OpengraphImageProps) => {
	const width = 1200;
	const height = 630;

	return (
		<div
			style={{
				display: "flex",
				width: `${width}px`,
				height: `${height}px`,
				backgroundColor: "white",
				position: "relative",
				justifyContent: "flex-start",
				alignItems: "center",
			}}
		>
			{/* 상단 OPEN GRAPH 라벨 */}
			<div
				style={{
					position: "absolute",
					top: 40,
					left: 30,
					display: "flex",
				}}
			>
				{/* biome-ignore lint/a11y/noSvgWithoutTitle: OG 이미지 생성용 SVG */}
				<svg
					width="208"
					height="61"
					viewBox="0 0 208 61"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					aria-label="Blog logo"
				>
					<g clipPath="url(#clip0_366_756)">
						<path
							d="M66.3233 22.8418H59.363V44.1911H66.3233V22.8418Z"
							fill="#c9cdd6"
						/>
						<path
							d="M45.4704 33.3546C45.4704 37.8339 41.8277 41.4765 37.3485 41.4765C32.8693 41.4765 29.2266 37.8339 29.2266 33.3546H22.2663C22.2663 41.6725 29.0306 48.4368 37.3485 48.4368C45.6664 48.4368 52.4307 41.6678 52.4307 33.3546V12.2348H45.4704V33.3546Z"
							fill="#c9cdd6"
						/>
						<path
							d="M62.8431 19.5911C64.7652 19.5911 66.3233 18.033 66.3233 16.111C66.3233 14.189 64.7652 12.6309 62.8431 12.6309C60.9211 12.6309 59.363 14.189 59.363 16.111C59.363 18.033 60.9211 19.5911 62.8431 19.5911Z"
							fill="#c9cdd6"
						/>
						<path
							d="M139.425 19.5911C135.572 19.5911 132.097 21.2499 129.678 23.8887C127.259 21.2499 123.784 19.5911 119.931 19.5911C112.717 19.5911 106.832 25.3993 106.708 32.5843H106.703V44.1863H113.664V32.8137C113.664 29.3575 116.474 26.5466 119.931 26.5466C123.387 26.5466 126.198 29.3575 126.198 32.8137V44.1863H133.158V32.8137C133.158 29.3575 135.969 26.5466 139.425 26.5466C142.881 26.5466 145.692 29.3575 145.692 32.8137V44.1863H152.653V32.5843H152.648C152.523 25.3993 146.644 19.5911 139.425 19.5911Z"
							fill="#c9cdd6"
						/>
						<path
							d="M86.5157 19.5911C79.3021 19.5911 73.4174 25.3993 73.2931 32.5843H73.2883V44.1863H80.2486V32.8137C80.2486 29.3575 83.0595 26.5466 86.5157 26.5466C89.9719 26.5466 92.7828 29.3575 92.7828 32.8137V44.1863H99.743V32.5843H99.7383C99.614 25.3993 93.7341 19.5911 86.5157 19.5911Z"
							fill="#c9cdd6"
						/>
						<path
							d="M178.806 21.2738V31.1023C178.806 34.5586 175.995 37.3694 172.539 37.3694C169.083 37.3694 166.272 34.5586 166.272 31.1023V21.2738H159.312V31.8003H159.331C159.694 38.7701 165.483 44.3249 172.539 44.3249C174.805 44.3249 176.937 43.7513 178.806 42.7426V44.4731H185.766V21.269H178.806V21.2738Z"
							fill="#c9cdd6"
						/>
					</g>

					<defs>
						<clipPath id="clip0_366_756">
							<rect
								width="208"
								height="59.43"
								fill="white"
								transform="translate(0 0.784973)"
							/>
						</clipPath>
					</defs>
				</svg>
			</div>

			{/* --- 기존 그래픽 요소 (변경 없음) --- */}
			{/* biome-ignore lint/a11y/noSvgWithoutTitle: OG 이미지 생성용 SVG */}
			<svg
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				style={{ position: "absolute", top: -20, left: 200 }}
				aria-label="Background decoration"
			>
				<path
					d="M -50,0 C 400,150 450,800 1100,500 L 1200,630 L 1200,0 Z"
					fill="#f3f4f6"
				/>
			</svg>
			{/* biome-ignore lint/a11y/noSvgWithoutTitle: OG 이미지 생성용 SVG */}
			<svg
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				style={{ position: "absolute", top: 192, right: -450, opacity: 0.8 }}
				aria-label="Curved lines decoration"
			>
				<path
					d="M 950,350 C 800,200 650,500 500,350 C 350,200 200,500 50,350"
					fill="none"
					stroke="#9ca3af"
					strokeWidth="1"
				/>
				<path
					d="M 940,340 C 780,210 630,490 480,340 C 330,190 180,490 30,340"
					fill="none"
					stroke="#9ca3af"
					strokeWidth="1"
				/>
				<path
					d="M 930,330 C 770,220 620,480 470,330 C 320,180 170,480 20,330"
					fill="none"
					stroke="#9ca3af"
					strokeWidth="1"
				/>
				<path
					d="M 920,320 C 760,230 610,470 460,320 C 310,170 160,470 10,320"
					fill="none"
					stroke="#9ca3af"
					strokeWidth="1.2"
				/>
				<path
					d="M 910,310 C 750,240 600,460 450,310 C 300,160 150,460 0,310"
					fill="none"
					stroke="#6b7280"
					strokeWidth="1.2"
				/>
				<path
					d="M 900,300 C 740,250 590,450 440,300 C 290,150 140,450 -10,300"
					fill="none"
					stroke="#6b7280"
					strokeWidth="1.5"
				/>
			</svg>

			<div
				style={{
					top: -10,
					left: 100,
					width: "78%", // 텍스트가 너무 길어지지 않도록 너비 제한
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-start", // 텍스트를 오른쪽 정렬
					textAlign: "left",
				}}
			>
				{/* Category (선택적) */}
				{category && (
					<h3
						style={{
							fontSize: "22px",
							color: "#6b7280",
							textTransform: "uppercase",
							letterSpacing: "0.1em",
							marginBottom: "52px",
						}}
					>
						{category}
					</h3>
				)}

				{/* Title (필수) */}
				<h1
					style={{
						fontSize: "56px",
						fontWeight: 700, // Bold
						color: "#1f2937", // Tailwind's gray-800
						margin: 0,
					}}
				>
					{title}
				</h1>

				{/* Summary (선택적) */}
				{summary && (
					<p
						style={{
							fontSize: "32px",
							color: "#4b5563",
							whiteSpace: "pre-wrap", // 줄바꿈을 위해
						}}
					>
						{summary}
					</p>
				)}
			</div>

			{/* --- 기존 명언 (변경 없음) --- */}
			<div
				style={{
					position: "absolute",
					bottom: 40,
					right: 80,
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-end",
				}}
			></div>
		</div>
	);
};
