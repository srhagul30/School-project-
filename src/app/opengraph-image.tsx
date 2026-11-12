import { ImageResponse } from "next/og";

export const alt = "NoticeBridge — school circulars parents actually read";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#EEF2F0",
          padding: "72px 80px",
          fontFamily: "serif",
          color: "#17212B",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 600 }}>
          <div style={{ width: 30, height: 38, border: "3px solid #1E4A3C", background: "#fff", display: "flex" }} />
          NoticeBridge
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 68, lineHeight: 1.1, maxWidth: 960, letterSpacing: -1 }}>
            Turn a three-page circular into a message parents will read.
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 26, fontFamily: "sans-serif", color: "#3A4650" }}>
            <span style={{ background: "#FBE38A", padding: "4px 12px" }}>WhatsApp</span>
            <span style={{ background: "#CFE2F7", padding: "4px 12px" }}>13 languages</span>
            <span style={{ background: "#C9EAD6", padding: "4px 12px" }}>Key dates</span>
            <span style={{ background: "#F1D9EA", padding: "4px 12px" }}>Parent checklist</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
