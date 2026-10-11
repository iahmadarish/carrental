import { ImageResponse } from "next/og";

export const alt = "VeloDrive — Car rental and sales across Australia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 64,
          background: "linear-gradient(145deg, #0b0b0d 0%, #1a1410 55%, #3d2214 100%)",
          color: "#f3eee6",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 600, color: "#e8642c", marginBottom: 16 }}>VeloDrive</div>
        <div style={{ fontSize: 56, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05, maxWidth: 900 }}>
          Premium cars. Unlimited kilometres. GST-inclusive pricing.
        </div>
        <div style={{ marginTop: 24, fontSize: 22, color: "#a39d94" }}>
          Rent or buy across Sydney, Melbourne, Brisbane, Perth &amp; more
        </div>
      </div>
    ),
    { ...size },
  );
}
