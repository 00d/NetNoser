import { useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import type { NodeData } from "./useTelemetry";

interface DetailPanelProps {
  nodeId: string;
  telemetryRef: React.RefObject<NodeData[]>;
  onClose: () => void;
}

interface DataPoint {
  time: number;
  cpu: number;
  memory: number;
}

export default function DetailPanel({
  nodeId,
  telemetryRef,
  onClose,
}: DetailPanelProps) {
  const [history, setHistory] = useState<DataPoint[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const liveData = telemetryRef.current.find((n) => n.id === nodeId);
      if (liveData) {
        setHistory((prev) => {
          const newDataPoint = {
            time: Date.now(),
            cpu: liveData.cpu,
            memory: liveData.memory,
          };
          const nextHistory = [...prev, newDataPoint];
          // Keep only the last 60 seconds (assuming 2 updates per second = 120 points)
          if (nextHistory.length > 120) nextHistory.shift();
          return nextHistory;
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [nodeId, telemetryRef]);

  const width = 350;
  const height = 150;

  const xScale = useMemo(() => {
    const extent = d3.extent(history, (d) => d.time) as [number, number];
    // if not enough data yet, fake 10-second window
    if (history.length < 2)
      return d3
        .scaleTime()
        .domain([Date.now() - 10000, Date.now()])
        .range([0, width]);
    return d3.scaleTime().domain(extent).range([0, width]);
  }, [history]);

  const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

  const cpuLine = d3
    .line<DataPoint>()
    .x((d) => xScale(d.time))
    .y((d) => yScale(d.cpu))
    .curve(d3.curveMonotoneX);
  const memLine = d3
    .line<DataPoint>()
    .x((d) => xScale(d.time))
    .y((d) => yScale(d.memory))
    .curve(d3.curveMonotoneX);

  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        padding: "1.5rem",
        borderRadius: "8px",
        minWidth: "400px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #333",
          paddingBottom: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0 }}>
          Node: <span style={{ color: "#38bdf8" }}>{nodeId}</span>
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "whitesmoke",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: "0 0.5rem",
          }}
          title="Close panel"
        >
          &times;
        </button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>CPU & Memory History (60s)</h4>

        <svg
          width={width}
          height={height}
          style={{ backgroundColor: "#0f172a", borderRadius: "4px" }}
        >
          <line
            x1={0}
            y1={yScale(50)}
            x2={width}
            y2={yScale(50)}
            stroke="#334155"
            strokeDasharray="4"
          />

          <path
            d={cpuLine(history) || undefined}
            fill="none"
            stroke="#f43f5e"
            strokeWidth={2}
          />
          <path
            d={memLine(history) || undefined}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        </svg>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span style={{ color: "#f43f5e" }}>— CPU</span>
          <span style={{ color: "#3b82f6" }}>— Memory</span>
        </div>
      </div>
    </div>
  );
}
