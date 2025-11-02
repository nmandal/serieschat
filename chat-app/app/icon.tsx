import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
				borderRadius: "6px",
			}}
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9" />
				<path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2.5" />
				<path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2.5" />
			</svg>
		</div>,
		{
			...size,
		},
	);
}

