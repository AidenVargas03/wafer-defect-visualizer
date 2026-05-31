import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import WaferMap from "./WaferMap";
import Legend from "./Legend";
import FilterBar from "./FilterBar";
import DefectChart from "./DefectChart";
import SpcChart from "./SpcChart";
import WaferSelector from "./WaferSelector";

export default function App() {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wafers, setWafers] = useState([]);
  const [activeWaferId, setActiveWaferId] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareWaferId, setCompareWaferId] = useState(null);
  const [activeTypes, setActiveTypes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("map");

  const activeWafer = wafers.find(w => w.id === activeWaferId);
  const compareWafer = wafers.find(w => w.id === compareWaferId);
  const result = activeWafer?.result;
  const mapRef = useRef(null);

  async function uploadFile(file) {
    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are accepted.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5130/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const formData2 = new FormData();
      formData2.append("file", file);
      const analyticsRes = await fetch("http://localhost:5130/api/analyze", {
        method: "POST",
        body: formData2,
      });
      const analyticsData = await analyticsRes.json();

      const newWafer = {
        id: `${data.waferId}-${Date.now()}`,
        fileName: file.name,
        result: data,
        analytics: analyticsData,
      };

      setWafers(prev => [...prev, newWafer]);
      setActiveWaferId(newWafer.id);
      setActiveTypes(data.defectTypes);
      setAnalytics(analyticsData);
      setActiveTab("map");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function onFileInput(e) {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  function handleToggle(type) {
    if (!result) return;
    if (type === "all") {
      setActiveTypes(result.defectTypes);
      return;
    }
    setActiveTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }

  

  function handleSelectWafer(id) {
    setActiveWaferId(id);
    const w = wafers.find(w => w.id === id);
    if (w) {
      setActiveTypes(w.result.defectTypes);
      setAnalytics(w.analytics);
    }
  }

  function handleRemoveWafer(id) {
    const updated = wafers.filter(w => w.id !== id);
    setWafers(updated);
    if (activeWaferId === id) {
      const next = updated[0];
      if (next) {
        setActiveWaferId(next.id);
        setActiveTypes(next.result.defectTypes);
        setAnalytics(next.analytics);
      } else {
        setActiveWaferId(null);
        setActiveTypes([]);
        setAnalytics(null);
      }
    }
    if (compareWaferId === id) setCompareWaferId(null);
  }

  function handleToggleCompare() {
    setCompareMode(prev => !prev);
    setCompareWaferId(null);
  }


  // ADD THESE TWO RIGHT HERE
  async function loadDemo() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5130/api/demo");
      if (!res.ok) throw new Error("Demo load failed");
      const { upload, analytics: analyticsData } = await res.json();

      const newWafer = {
        id: `${upload.waferId}-${Date.now()}`,
        fileName: "demo-wafer.csv",
        result: upload,
        analytics: analyticsData,
      };

      setWafers(prev => [...prev, newWafer]);
      setActiveWaferId(newWafer.id);
      setActiveTypes(upload.defectTypes);
      setAnalytics(analyticsData);
      setActiveTab("map");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function exportPng() {
    if (!mapRef.current) return;
    const dataUrl = await toPng(mapRef.current, { backgroundColor: "#fafafa" });
    const link = document.createElement("a");
    link.download = `${result?.waferId ?? "wafer"}-map.png`;
    link.href = dataUrl;
    link.click();
  }

  return (
    <div style={{ maxWidth: compareMode && compareWafer ? 1100 : 700, margin: "0 auto", padding: "2rem 1rem", fontFamily: "system-ui, sans-serif", transition: "max-width .3s" }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>Wafer defect map visualizer</h1>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <p style={{ color: "#666", fontSize: 14, margin: 0 }}>Upload a CSV of wafer defect coordinates</p>
        <button
          onClick={loadDemo}
          style={{
            fontSize: 12,
            padding: "6px 14px",
            borderRadius: 20,
            border: "0.5px solid #ccc",
            background: "white",
            color: "#555",
            cursor: "pointer",
          }}
        >
          ▶ Load demo wafer
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? "#378ADD" : "#ccc"}`,
          borderRadius: 12,
          padding: "2rem 1rem",
          textAlign: "center",
          background: dragging ? "#E6F1FB" : "#fafafa",
          cursor: "pointer",
          transition: "all .15s",
          marginBottom: 20,
        }}
        onClick={() => document.getElementById("file-input").click()}
      >
        <div style={{ fontSize: 28, marginBottom: 6 }}>📂</div>
        <p style={{ margin: 0, fontSize: 13, color: "#555" }}>
          Drag & drop a CSV file here, or click to browse
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "#aaa" }}>
          Upload multiple wafers to compare them
        </p>
        <input id="file-input" type="file" accept=".csv" style={{ display: "none" }} onChange={onFileInput} />
      </div>

      {loading && <p style={{ color: "#666", fontSize: 14 }}>Parsing...</p>}
      {error && <p style={{ color: "#E24B4A", fontSize: 14 }}>Error: {error}</p>}

      {/* Wafer selector */}
      <WaferSelector
        wafers={wafers}
        activeWaferId={activeWaferId}
        compareWaferId={compareWaferId}
        compareMode={compareMode}
        onSelect={handleSelectWafer}
        onRemove={handleRemoveWafer}
        onToggleCompare={handleToggleCompare}
        onSelectCompare={setCompareWaferId}
      />

      {result && (
        <div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Wafer ID", value: result.waferId },
              { label: "Lot ID", value: result.lotId },
              { label: "Total dies", value: result.totalDies },
              { label: "Yield", value: result.yieldPct + "%" },
              { label: "Pass", value: result.passDies },
              { label: "Fail", value: result.failDies },
              { label: "Clusters", value: result.clusters.length },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#f4f4f4", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "0.5px solid #e0e0e0" }}>
            {["map", "analytics"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontSize: 13,
                  padding: "8px 20px",
                  border: "none",
                  borderBottom: activeTab === tab ? "2px solid #222" : "2px solid transparent",
                  background: "transparent",
                  color: activeTab === tab ? "#111" : "#888",
                  cursor: "pointer",
                  fontWeight: activeTab === tab ? 500 : 400,
                  textTransform: "capitalize"
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Map tab */}
          {activeTab === "map" && (
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Legend />
                  <button
                    onClick={exportPng}
                    style={{
                      fontSize: 12,
                      padding: "5px 14px",
                      borderRadius: 20,
                      border: "0.5px solid #ccc",
                      background: "white",
                      color: "#555",
                      cursor: "pointer",
                      marginBottom: 8,
                    }}
                  >
                    ⬇ Export PNG
                  </button>
                </div>
                <FilterBar
                defectTypes={result.defectTypes}
                activeTypes={activeTypes}
                onToggle={handleToggle}
              />

              {/* Single or compare layout */}
              <div style={{ display: "grid", gridTemplateColumns: compareMode && compareWafer ? "1fr 1fr" : "1fr", gap: 16 }}>

                {/* Primary wafer */}
                <div>
                  {compareMode && compareWafer && (
                    <p style={{ fontSize: 12, fontWeight: 500, color: "#378ADD", marginBottom: 6 }}>
                      {result.waferId} — {result.yieldPct}% yield
                    </p>
                  )}
                 <div ref={mapRef} style={{ border: "0.5px solid #e0e0e0", borderRadius: 12, padding: 12, background: "#fafafa" }}>
                    <WaferMap dies={result.dies} activeTypes={activeTypes} clusters={result.clusters} />
                  </div>
                </div>

                {/* Compare wafer */}
                {compareMode && compareWafer && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: "#1D9E75", marginBottom: 6 }}>
                      {compareWafer.result.waferId} — {compareWafer.result.yieldPct}% yield
                    </p>
                    <div style={{ border: "0.5px solid #e0e0e0", borderRadius: 12, padding: 12, background: "#fafafa" }}>
                      <WaferMap dies={compareWafer.result.dies} activeTypes={activeTypes} clusters={compareWafer.result.clusters} />
                    </div>

                    {/* Yield delta badge */}
                    <div style={{ marginTop: 10, padding: "8px 14px", borderRadius: 8, background: "#f4f4f4", fontSize: 13 }}>
                      Yield delta:{" "}
                      <span style={{
                        fontWeight: 500,
                        color: result.yieldPct >= compareWafer.result.yieldPct ? "#1D9E75" : "#E24B4A"
                      }}>
                        {result.yieldPct >= compareWafer.result.yieldPct ? "+" : ""}
                        {Math.round((result.yieldPct - compareWafer.result.yieldPct) * 10) / 10}%
                      </span>
                      {" "}vs {compareWafer.result.waferId}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics tab */}
          {activeTab === "analytics" && analytics && (
            <div>
              <div style={{ background: "#fff", border: "0.5px solid #e0e0e0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 4px" }}>Row yield SPC chart</p>
                <p style={{ fontSize: 12, color: "#888", margin: "0 0 12px" }}>Red points = rows below lower control limit</p>
                <SpcChart byRow={analytics.stats.byRow} mean={analytics.stats.meanRowYield} ucl={analytics.stats.ucl} lcl={analytics.stats.lcl} />
              </div>

              <div style={{ background: "#fff", border: "0.5px solid #e0e0e0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 12px" }}>Defect type breakdown</p>
                <DefectChart data={analytics.stats.byDefectType} />
              </div>

              <div style={{ background: "#fff", border: "0.5px solid #e0e0e0", borderRadius: 12, padding: "1rem 1.25rem" }}>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 12px" }}>Yield impact by defect type</p>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f5f5f5" }}>
                      {["Defect type", "Total dies", "Failed", "Yield impact"].map(h => (
                        <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.stats.byDefectType.map((d, i) => (
                      <tr key={i} style={{ borderBottom: "0.5px solid #eee" }}>
                        <td style={{ padding: "6px 10px" }}>{d.defectType}</td>
                        <td style={{ padding: "6px 10px" }}>{d.total}</td>
                        <td style={{ padding: "6px 10px", color: d.failed > 0 ? "#E24B4A" : "#1D9E75", fontWeight: 500 }}>{d.failed}</td>
                        <td style={{ padding: "6px 10px", color: "#BA7517" }}>{d.yieldImpact}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}