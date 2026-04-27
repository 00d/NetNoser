import { useEffect, useRef, useState } from "react";

export interface NodeData {
  id: string;
  cpu: number;
  memory: number;
  latency: number;
  status: "healthy" | "warning";
}
type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export function useTelemetry() {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [summary, setSummary] = useState({ total: 0, healthy: 0, warning: 0 });

  const latestDataRef = useRef<NodeData[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/telemetry");

    ws.onopen = () => setStatus("connected");

    ws.onmessage = (event) => {
      const data: NodeData[] = JSON.parse(event.data);

      latestDataRef.current = data;

      const healthyCount = data.filter((n) => n.status === "healthy").length;
      setSummary({
        total: data.length,
        healthy: healthyCount,
        warning: data.length - healthyCount,
      });
    };

    ws.onerror = () => setStatus("error");
    ws.onclose = () => setStatus("disconnected");

    return () => ws.close();
  }, []);

  return { status, summary, latestDataRef };
}
