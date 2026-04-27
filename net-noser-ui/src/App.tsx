import { useState } from "react";
import { useTelemetry } from "./useTelemetry";
import NetworkGraph from "./NetworkGraph";
import DetailPanel from "./DetailPanel";

function App() {
  const { status, summary, latestDataRef } = useTelemetry();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "black",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <h1>Net Noser Infrastructure</h1>

      <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem" }}>
        <div>
          <strong>Status: </strong>
          <span style={{ color: status === "connected" ? "green" : "red" }}>
            {status.toUpperCase()}
          </span>
        </div>

        {status === "connected" && (
          <div style={{ display: "flex", gap: "1rem" }}>
            <span>Total: {summary.total}</span>
            <span style={{ color: "whitesmoke" }}>
              Healthy: {summary.healthy}
            </span>
            <span style={{ color: "gray" }}>Warnings: {summary.warning}</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        {status === "connected" && summary.total > 0 && (
          <div style={{ flex: 1 }}>
            <NetworkGraph
              telemetryRef={latestDataRef}
              onNodeClick={(id) => setSelectedNode(id)}
            />
          </div>
        )}

        {selectedNode && (
          <div style={{ flexShrink: 0, animation: "slideIn 0.2s ease-out" }}>
            <DetailPanel
              key={selectedNode}
              nodeId={selectedNode}
              telemetryRef={latestDataRef}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
