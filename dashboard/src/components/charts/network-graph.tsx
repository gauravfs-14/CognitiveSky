/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { ScatterChart, Scatter, ResponsiveContainer, ZAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface Node {
  id: string;
  group: number;
  value: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string | Node;
  target: string | Node;
  value: number;
}

interface NetworkGraphProps {
  nodes: Node[];
  links: Link[];
  title: string;
  description?: string;
  height?: number;
}

export const NetworkGraph = ({
  nodes,
  links,
  title,
  description,
  height = 400,
}: NetworkGraphProps) => {
  const [isLoading] = useState(false);

  // Colors for different node groups
  const colorScale = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
  ];

  // Create a force-directed-like layout
  // For simplicity, using a circular layout with some randomness
  const processedNodes = nodes.map((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI;
    const radius = 40;

    // Position in circle + randomness
    const xBase = 50 + radius * Math.cos(angle);
    const yBase = 50 + radius * Math.sin(angle);

    // Add some randomness to avoid perfect circle
    const x = xBase + (Math.random() - 0.5) * 10;
    const y = yBase + (Math.random() - 0.5) * 10;

    return {
      ...node,
      x,
      y,
      fill: colorScale[(node.group - 1) % colorScale.length],
      radius: Math.sqrt(node.value) * 1.5 + 3,
    };
  });

  // Process links for rendering
  const linkData = links
    .map((link) => {
      const sourceNode =
        typeof link.source === "string"
          ? processedNodes.find((n) => n.id === link.source)
          : processedNodes.find((n) => n.id === (link.source as Node).id);

      const targetNode =
        typeof link.target === "string"
          ? processedNodes.find((n) => n.id === link.target)
          : processedNodes.find((n) => n.id === (link.target as Node).id);

      if (!sourceNode || !targetNode) return null;

      return {
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        sourceX: sourceNode.x,
        sourceY: sourceNode.y,
        targetX: targetNode.x,
        targetY: targetNode.y,
        value: link.value,
        thickness: Math.sqrt(link.value) * 0.5 + 0.5,
      };
    })
    .filter(Boolean);

  // Chart configuration
  const chartConfig = {
    nodes: {
      label: "Nodes",
      color: "#3b82f6",
    },
    links: {
      label: "Connections",
      color: "#9ca3af",
    },
  } satisfies ChartConfig;

  // Custom scatter shape for nodes
  const NodeShape = (props: any) => {
    const { cx, cy, payload } = props;
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={payload.radius}
          fill={payload.fill}
          stroke="#fff"
          strokeWidth={1.5}
        />
        <text
          x={cx}
          y={cy - payload.radius - 5}
          textAnchor="middle"
          fontSize="10px"
          fontFamily="sans-serif"
          fill="#666"
        >
          {payload.id}
        </text>
      </g>
    );
  };

  // Custom component to render links
  const Links = () => (
    <g>
      {linkData.map((link, index) => (
        <line
          key={`link-${index}`}
          x1={link?.sourceX}
          y1={link?.sourceY}
          x2={link?.targetX}
          y2={link?.targetY}
          stroke="#999"
          strokeOpacity={0.6}
          strokeWidth={link?.thickness}
        />
      ))}
    </g>
  );

  return (
    <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent style={{ height: `${height}px` }} className="relative">
        {isLoading && nodes.length > 0 && links.length > 0 ? (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="h-full w-full rounded-md" />
          </div>
        ) : nodes.length === 0 || links.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No data available
          </div>
        ) : (
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <ZAxis type="number" dataKey="value" range={[0, 100]} />
                  <Links />
                  <Scatter
                    name="Nodes"
                    data={processedNodes}
                    fill="#8884d8"
                    shape={<NodeShape />}
                  />
                </ScatterChart>
              </ChartContainer>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
