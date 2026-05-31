export default function FilterBar({ defectTypes, activeTypes, onToggle }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }}>
      <span style={{ fontSize: 12, color: "#888", alignSelf: "center" }}>Filter:</span>
      <button
        onClick={() => onToggle("all")}
        style={{
          fontSize: 12,
          padding: "4px 12px",
          borderRadius: 20,
          border: "0.5px solid #ccc",
          background: activeTypes.length === defectTypes.length ? "#222" : "white",
          color: activeTypes.length === defectTypes.length ? "white" : "#555",
          cursor: "pointer"
        }}
      >
        All
      </button>
      {defectTypes.map(type => (
        <button
          key={type}
          onClick={() => onToggle(type)}
          style={{
            fontSize: 12,
            padding: "4px 12px",
            borderRadius: 20,
            border: "0.5px solid #ccc",
            background: activeTypes.includes(type) && activeTypes.length !== defectTypes.length ? "#222" : "white",
            color: activeTypes.includes(type) && activeTypes.length !== defectTypes.length ? "white" : "#555",
            cursor: "pointer"
          }}
        >
          {type}
        </button>
      ))}
    </div>
  );
}