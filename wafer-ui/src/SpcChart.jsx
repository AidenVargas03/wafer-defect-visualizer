import { useEffect, useRef } from "react";
import {
  Chart, LineController, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler
} from "chart.js";

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

export default function SpcChart({ byRow, mean, ucl, lcl }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!byRow || byRow.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = byRow.map(r => `Row ${r.row}`);
    const yields = byRow.map(r => r.yieldPct);
    const uclLine = byRow.map(() => ucl);
    const lclLine = byRow.map(() => lcl);
    const meanLine = byRow.map(() => mean);

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Row yield %",
            data: yields,
            borderColor: "#378ADD",
            backgroundColor: "rgba(55,138,221,0.08)",
            pointBackgroundColor: yields.map(y => y < lcl ? "#E24B4A" : "#378ADD"),
            pointRadius: 5,
            tension: 0.3,
            fill: false,
          },
          {
            label: "UCL",
            data: uclLine,
            borderColor: "#E24B4A",
            borderDash: [5, 4],
            pointRadius: 0,
            borderWidth: 1.5,
            fill: false,
          },
          {
            label: "Mean",
            data: meanLine,
            borderColor: "#888",
            borderDash: [3, 3],
            pointRadius: 0,
            borderWidth: 1,
            fill: false,
          },
          {
            label: "LCL",
            data: lclLine,
            borderColor: "#E24B4A",
            borderDash: [5, 4],
            pointRadius: 0,
            borderWidth: 1.5,
            fill: false,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 12 } } },
          tooltip: { mode: "index" }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            title: { display: true, text: "Yield %" }
          },
          x: { grid: { display: false } }
        }
      }
    });

    return () => chartRef.current?.destroy();
  }, [byRow, mean, ucl, lcl]);

  return <canvas ref={canvasRef} />;
}