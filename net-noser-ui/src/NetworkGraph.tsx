import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { NodeData } from "./useTelemetry";

interface NetworkGraphProps {
  telemetryRef: React.RefObject<NodeData[]>;
  onNodeClick: (nodeId: string) => void; // Add this line
}

// temp
const generateMockLinks = (nodes: NodeData[]) => {
  const links = [];
  for (let i = 0; i < nodes.length; i++) {
    links.push({
      source: nodes[i].id,
      target: nodes[(i + 1) % nodes.length].id,
    });
    links.push({
      source: nodes[i].id,
      target: nodes[Math.floor(Math.random() * nodes.length)].id,
    });
  }
  return links;
};

export default function NetworkGraph({
  telemetryRef,
  onNodeClick,
}: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const d3NodesRef = useRef<d3.Selection<
    SVGCircleElement,
    any,
    SVGGElement,
    unknown
  > | null>(null);

  useEffect(() => {
    if (!svgRef.current || telemetryRef.current.length === 0) return;

    const width = 640;
    const height = 480;
    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove(); // clear on remount

    const nodes = telemetryRef.current.map((d) => ({ ...d }));
    const links = generateMockLinks(nodes);

    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(60),
      )
      .force("charge", d3.forceManyBody().strength(-150)) // Nodes repel each other
      .force("center", d3.forceCenter(width / 2, height / 2));

    const linkElements = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#444")
      .attr("stroke-width", 1.5);

    const nodeElements = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 8)
      .attr("fill", (d) => (d.status === "healthy" ? "green" : "gray"))
      .attr("stroke", "#222")
      .attr("stroke-width", 2)
      .attr("cursor", "pointer")
      .on("click", (event, d: any) => {
        onNodeClick(d.id);
      });

    d3NodesRef.current = nodeElements as any;

    // if physics engine calculates a new frame, update the SVG coordinates
    simulation.on("tick", () => {
      linkElements
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeElements.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, []);

  useEffect(() => {
    // bypasses React render cycle
    const interval = setInterval(() => {
      if (!d3NodesRef.current || !telemetryRef.current) return;

      const latestData = telemetryRef.current;

      d3NodesRef.current.attr("fill", (d: any) => {
        const liveNode = latestData.find((n) => n.id === d.id);
        return liveNode?.status === "warning" ? "#f87171" : "#4ade80";
      });

      d3NodesRef.current.attr("r", (d: any) => {
        const liveNode = latestData.find((n) => n.id === d.id);
        const cpu = liveNode?.cpu || 0;
        return 6 + cpu / 20; // 0-100 CPU to 6-11px radius
      });
    }, 500);

    return () => clearInterval(interval);
  }, [telemetryRef]);

  return (
    <div
      style={{
        backgroundColor: "#111",
        borderRadius: "8px",
        padding: "1rem",
        marginTop: "1rem",
      }}
    >
      <svg
        ref={svgRef}
        width={640}
        height={480}
        style={{ display: "block", margin: "0 auto" }}
      />
    </div>
  );
}
