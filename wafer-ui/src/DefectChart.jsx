import { useEffect, useRef } from "react";
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DefectChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: data.map(d => d.defectType),
        datasets: [
          {
            label: "Failed dies",
            data: data.map(d => d.failed),
            backgroundColor: "#E24B4A",
            borderRadius: 4,
          },
          {
            label: "Passed dies",
            data: data.map(d => d.total - d.failed),
            backgroundColor: "#1D9E75",
            borderRadius: 4,
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
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, title: { display: true, text: "Die count" } }
        }
      }
    });

    return () => chartRef.current?.destroy();
  }, [data]);

  return <canvas ref={canvasRef} />;
}