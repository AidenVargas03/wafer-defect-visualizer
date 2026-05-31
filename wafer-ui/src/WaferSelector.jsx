export default function WaferSelector({ wafers, activeWaferId, compareWaferId, compareMode, onSelect, onRemove, onToggleCompare, onSelectCompare }) {
  if (wafers.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
          {wafers.length} wafer{wafers.length !== 1 ? "s" : ""} uploaded
        </p>
        {wafers.length >= 2 && (
          <button
            onClick={onToggleCompare}
            style={{
              fontSize: 12,
              padding: "4px 12px",
              borderRadius: 20,
              border: "0.5px solid #ccc",
              background: compareMode ? "#222" : "white",
              color: compareMode ? "white" : "#555",
              cursor: "pointer"
            }}
          >
            {compareMode ? "Exit compare" : "Compare two wafers"}
          </button>
        )}
      </div>

      {/* Wafer tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {wafers.map(w => (
          <div
            key={w.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 8,
              border: `0.5px solid ${activeWaferId === w.id ? "#378ADD" : "#ddd"}`,
              background: activeWaferId === w.id ? "#E6F1FB" : "#fafafa",
              cursor: "pointer",
              fontSize: 12,
            }}
            onClick={() => onSelect(w.id)}
          >
            <span style={{ color: activeWaferId === w.id ? "#185FA5" : "#555", fontWeight: activeWaferId === w.id ? 500 : 400 }}>
              {w.result.waferId}
            </span>
            <span style={{ color: "#aaa", fontSize: 11 }}>{w.result.yieldPct}%</span>
            <span
              onClick={(e) => { e.stopPropagation(); onRemove(w.id); }}
              style={{ color: "#bbb", cursor: "pointer", fontSize: 14, lineHeight: 1 }}
            >×</span>
          </div>
        ))}
      </div>

      {/* Compare wafer picker */}
      {compareMode && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#888" }}>Compare with:</span>
          <div style={{ display: "flex", gap: 8 }}>
            {wafers.filter(w => w.id !== activeWaferId).map(w => (
              <div
                key={w.id}
                onClick={() => onSelectCompare(w.id)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 8,
                  border: `0.5px solid ${compareWaferId === w.id ? "#1D9E75" : "#ddd"}`,
                  background: compareWaferId === w.id ? "#E1F5EE" : "#fafafa",
                  cursor: "pointer",
                  fontSize: 12,
                  color: compareWaferId === w.id ? "#085041" : "#555",
                  fontWeight: compareWaferId === w.id ? 500 : 400,
                }}
              >
                {w.result.waferId} — {w.result.yieldPct}%
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}