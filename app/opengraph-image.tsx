import { ImageResponse } from "next/og"

export const runtime = "nodejs"

export const alt = "baysaass — Brand Designer | Ulaanbaatar, Mongolia"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

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
          padding: "72px 80px",
          backgroundColor: "#000000",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle grid line accents */}
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 28,
            right: 28,
            bottom: 28,
            border: "1px solid rgba(255, 255, 255, 0.12)",
            pointerEvents: "none",
          }}
        />

        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 14,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255, 255, 255, 0.6)",
              fontWeight: 600,
            }}
          >
            BAYSAASS STUDIO • PORTFOLIO
          </div>
          <div
            style={{
              fontSize: 13,
              letterSpacing: "0.15em",
              color: "rgba(255, 255, 255, 0.4)",
              fontFamily: "monospace",
            }}
          >
            47.9184° N, 106.9177° E
          </div>
        </div>

        {/* Center / Hero text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              color: "#ffffff",
            }}
          >
            baysaass
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.8)",
              letterSpacing: "-0.01em",
              maxWidth: "840px",
              lineHeight: 1.35,
            }}
          >
            Brand Identity, Packaging, Typography & Visual Systems for Ambitious Brands
          </div>
        </div>

        {/* Bottom footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "24px",
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.5)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <span>BRAND IDENTITY</span>
            <span>•</span>
            <span>PACKAGING</span>
            <span>•</span>
            <span>TYPOGRAPHY</span>
          </div>

          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "0.05em",
            }}
          >
            baysaass.space
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
