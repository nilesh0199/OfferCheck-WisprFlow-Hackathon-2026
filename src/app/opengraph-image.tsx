import { ImageResponse } from "next/og";
import { APP_NAME, HERO_HEADLINE } from "@/lib/config";

export const alt = `${APP_NAME} — ${HERO_HEADLINE}`;
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
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              style={{ display: "flex" }}
            >
              <rect x="0" y="0" width="48" height="48" rx="11" fill="#1D5FA8" />
              <path
                d="M15 10h14l8 8v20a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z"
                fill="#FFFFFF"
              />
              <path d="M29 10l8 8h-6a2 2 0 0 1-2-2z" fill="#CFD8E3" />
              <rect x="17" y="22" width="14" height="2.4" rx="1.2" fill="#9DBDE3" />
              <rect x="16" y="27.5" width="17" height="6" rx="1.5" fill="#FFE27A" />
              <rect x="17.5" y="29.4" width="13" height="2.4" rx="1.2" fill="#14202E" />
            </svg>
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
            {HERO_HEADLINE}
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
