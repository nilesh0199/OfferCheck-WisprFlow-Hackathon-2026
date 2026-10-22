import { ImageResponse } from "next/og";
import { APP_NAME, TAGLINE } from "@/lib/config";

export const alt = `${APP_NAME} — ${TAGLINE}`;
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
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          backgroundColor: "#F2F5F9",
          fontFamily: "sans-serif",
          color: "#14202E",
        }}
      >
        {/* Top Header / Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            {/* Logo Mark */}
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "8px",
                border: "2.5px solid #10263F",
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#FFE27A",
                  border: "2px solid #10263F",
                  position: "absolute",
                  bottom: "6px",
                  right: "6px",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#14202E",
              }}
            >
              {APP_NAME}
            </span>
          </div>

          <div
            style={{
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: "#EAF0F7",
              border: "1px solid #CFD8E3",
              fontSize: 16,
              fontWeight: 600,
              color: "#4B5B6D",
            }}
          >
            Student & Job Seeker Offer Utility
          </div>
        </div>

        {/* Center Headline & Tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#14202E",
            }}
          >
            {TAGLINE}
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.4,
              color: "#4B5B6D",
            }}
          >
            Paste an internship or job offer to spot upfront deposit requests, urgent
            deadlines, and missing details with quote-linked verification questions.
          </div>
        </div>

        {/* Bottom Feature Strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "24px",
            borderTop: "2px solid #CFD8E3",
          }}
        >
          <div style={{ display: "flex", gap: "28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: 18,
                fontWeight: 600,
                color: "#1D5FA8",
              }}
            >
              <span>•</span>
              <span>Quote-linked observations</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: 18,
                fontWeight: 600,
                color: "#1D5FA8",
              }}
            >
              <span>•</span>
              <span>Missing information checklist</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: 18,
                fontWeight: 600,
                color: "#1D5FA8",
              }}
            >
              <span>•</span>
              <span>Official Indian registries</span>
            </div>
          </div>

          <div
            style={{
              fontSize: 16,
              color: "#4B5B6D",
              fontWeight: 500,
            }}
          >
            Private & in-memory only
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
