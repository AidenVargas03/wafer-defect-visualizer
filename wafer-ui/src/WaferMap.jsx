import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function WaferMap({ dies, activeTypes, clusters }) {
  const svgRef = useRef(null);
  const zoomStateRef = useRef(null);
  const initializedRef = useRef(false);

  // Full rebuild only when dies or clusters change
  useEffect(() => {
    if (!dies || dies.length === 0) return;

    const container = svgRef.current.parentElement;
    const width = container.clientWidth || 600;
    const height = width;
    const padding = 40;

    d3.select(svgRef.current).selectAll("*").remove();
    initializedRef.current = false;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const maxX = d3.max(dies, d => d.dieX);
    const maxY = d3.max(dies, d => d.dieY);
    const cellW = (width - padding * 2) / (maxX + 1);
    const cellH = (height - padding * 2) / (maxY + 1);
    const cellSize = Math.min(cellW, cellH);

    const xScale = d3.scaleLinear()
      .domain([0, maxX + 1])
      .range([padding, padding + cellSize * (maxX + 1)]);

    const yScale = d3.scaleLinear()
      .domain([0, maxY + 1])
      .range([padding, padding + cellSize * (maxY + 1)]);

    const g = svg.append("g").attr("class", "main-group");

    const zoom = d3.zoom()
      .scaleExtent([0.5, 10])
      .on("zoom", (event) => {
        zoomStateRef.current = event.transform;
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    if (zoomStateRef.current) {
      svg.call(zoom.transform, zoomStateRef.current);
    }

    const tooltip = d3.select("#wafer-tooltip");

    // Draw dies — give each a class we can target later
    g.selectAll("rect.die")
      .data(dies)
      .join("rect")
      .attr("class", "die")
      .attr("x", d => xScale(d.dieX))
      .attr("y", d => yScale(d.dieY))
      .attr("width", cellSize - 1)
      .attr("height", cellSize - 1)
      .attr("rx", 1)
      .attr("fill", d => d.pass ? "#1D9E75" : "#E24B4A")
      .attr("opacity", 0.85)
      .attr("data-defect", d => d.defectType)
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .html(`
            <div style="font-weight:500;margin-bottom:4px">Die (${d.dieX}, ${d.dieY})</div>
            <div>Status: <span style="color:${d.pass ? "#1D9E75" : "#E24B4A"};font-weight:500">${d.pass ? "Pass" : "Fail"}</span></div>
            <div>Type: ${d.defectType}</div>
            <div>Wafer: ${d.waferId}</div>
            <div>Lot: ${d.lotId}</div>
          `);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.pageX + 14) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });

    // Draw cluster outlines
    if (clusters && clusters.length > 0) {
      clusters.forEach(cluster => {
        const x = xScale(cluster.minX) - 2;
        const y = yScale(cluster.minY) - 2;
        const w = (cluster.maxX - cluster.minX + 1) * cellSize + 2;
        const h = (cluster.maxY - cluster.minY + 1) * cellSize + 2;

        g.append("rect")
          .attr("x", x)
          .attr("y", y)
          .attr("width", w)
          .attr("height", h)
          .attr("fill", "none")
          .attr("stroke", "#BA7517")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4 2")
          .attr("rx", 3)
          .attr("opacity", 0.8);

        g.append("text")
          .attr("x", x + 4)
          .attr("y", y - 4)
          .attr("font-size", 10)
          .attr("fill", "#BA7517")
          .text(`Cluster ${cluster.id} (${cluster.size} dies)`);
      });
    }

    // Wafer outline circle
    const gridW = cellSize * (maxX + 1);
    const gridH = cellSize * (maxY + 1);
    const cx = padding + gridW / 2;
    const cy = padding + gridH / 2;
    const radius = Math.min(gridW, gridH) / 2 + cellSize;

    g.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", "#888")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4 2")
      .attr("opacity", 0.4);

    initializedRef.current = true;

  }, [dies, clusters]); // <-- NO activeTypes here

  // Filter changes only update opacity — no SVG rebuild
  useEffect(() => {
    if (!dies || dies.length === 0) return;
    if (!svgRef.current) return;

    const allTypes = [...new Set(dies.map(d => d.defectType))];
    const allSelected = activeTypes && activeTypes.length === allTypes.length;

    d3.select(svgRef.current)
      .selectAll("rect.die")
      .attr("opacity", d => {
        if (allSelected || !activeTypes || activeTypes.length === 0) return 0.85;
        return activeTypes.includes(d.defectType) ? 0.85 : 0.1;
      });

  }, [activeTypes]); // <-- ONLY runs on filter change

  return (
    <svg
      ref={svgRef}
      style={{ width: "100%", display: "block", cursor: "grab" }}
    />
  );
}