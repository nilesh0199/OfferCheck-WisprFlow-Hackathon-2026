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
          backgroundColor: "#F4EFE4",
          fontFamily: "sans-serif",
          color: "#17150F",
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
                border: "2.5px solid #17150F",
                backgroundColor: "#FAF7F0",
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
                  backgroundColor: "#FFD84A",
                  border: "2px solid #17150F",
                  position: "absolute",
                  bottom: "6px",
                  right: "6px",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "32px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#17150F",
              }}
            >
              {APP_NAME}
            </span>
          </div>

          <div
            style={{
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: "#EAE4D5",
              border: "1px solid #DCD5C5",
              fontSize: "16px",
              fontWeight: 600,
              color: "#57534A",
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
              fontSize: "64px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#17150F",
            }}
          >
            {TAGLINE}
          </div>
          <div
            style={{
              fontSize: "26px",
              lineHeight: 1.4,
              color: "#57534A",
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
            borderTop: "2px solid #DCD5C5",
          }}
        >
          <div style={{ display: "flex", gap: "28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "18px",
                fontWeight: 600,
                color: "#1E5C46",
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
                fontSize: "18px",
                fontWeight: 600,
                color: "#1E5C46",
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
                fontSize: "18px",
                fontWeight: 600,
                color: "#1E5C46",
              }}
            >
              <span>•</span>
              <span>Official Indian registries</span>
            </div>
          </div>

          <div
            style={{
              fontSize: "16px",
              color: "#57534A",
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
