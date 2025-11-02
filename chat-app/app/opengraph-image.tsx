import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SeriesChat - AI-Powered TV & Movie Discovery";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%)",
          backgroundSize: "100px 100px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "32px",
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "120px",
              height: "120px",
              borderRadius: "24px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow: "0 20px 60px rgba(99, 102, 241, 0.4)",
            }}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9" />
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" />
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <h1
              style={{
                fontSize: "80px",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #ffffff 0%, #a3a3a3 100%)",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
                padding: 0,
                lineHeight: 1.1,
              }}
            >
              SeriesChat
            </h1>
            <p
              style={{
                fontSize: "32px",
                color: "#a3a3a3",
                margin: 0,
                padding: 0,
                fontWeight: 500,
              }}
            >
              Chat with IMDb. Visualize quality. Discover greatness.
            </p>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "48px",
              marginTop: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "40px",
                  fontWeight: "bold",
                  color: "#6366f1",
                }}
              >
                12M+
              </div>
              <div style={{ fontSize: "20px", color: "#737373" }}>Titles</div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "40px",
                  fontWeight: "bold",
                  color: "#8b5cf6",
                }}
              >
                AI-Powered
              </div>
              <div style={{ fontSize: "20px", color: "#737373" }}>Insights</div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "40px",
                  fontWeight: "bold",
                  color: "#ec4899",
                }}
              >
                Interactive
              </div>
              <div style={{ fontSize: "20px", color: "#737373" }}>Graphs</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
