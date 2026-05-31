export default function Legend() {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center", margin: "12px 0", fontSize: 13 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 14, height: 14, borderRadius: 3, background: "#1D9E75" }} />
        <span style={{ color: "#555" }}>Pass</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 14, height: 14, borderRadius: 3, background: "#E24B4A" }} />
        <span style={{ color: "#555" }}>Fail</span>
      </div>
      <span style={{ color: "#aaa", fontSize: 12 }}>Scroll to zoom · drag to pan</span>
    </div>
  );
}