"use client";

import { useEffect, useRef, useState } from "react";
import { useNetworkData } from "@/hooks/useNetworkData";
import { Loader2 } from "lucide-react";
import ForceGraph3D from "3d-force-graph";
import SpriteText from "three-spritetext";
import { Button } from "@/components/ui/button";

export function NetworkGraph() {
  const { nodes, links, loading, error } = useNetworkData();
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<any>>(new Set());
  const [centerNode, setCenterNode] = useState<string | null>(null);

  useEffect(() => {
    if (loading || error || !containerRef.current || nodes.length === 0) return;

    try {
      // Initialize the graph with performance optimizations
      if (!graphRef.current) {
        // Create the force graph instance
        graphRef.current = ForceGraph3D()(containerRef.current)
          .backgroundColor("#0f172a") // Dark background for better contrast
          .nodeColor((node: any) => {
            // Color based on community/group
            const colors = [
              "#3b82f6", // blue
              "#ef4444", // red
              "#22c55e", // green
              "#f59e0b", // amber
              "#a855f7", // purple
              "#06b6d4", // cyan
              "#ec4899", // pink
              "#84cc16", // lime
              "#f97316", // orange
              "#8b5cf6", // violet
            ];
            return highlightNodes.has(node.id)
              ? "#ffffff" // White for highlighted nodes
              : colors[node.group % colors.length];
          })
          .nodeLabel((node: any) => `${node.label} (${node.posts} posts)`)
          .nodeRelSize(6)
          // Use node size based on post count for visual importance
          .nodeVal((node: any) => Math.sqrt(1 + node.posts) * 4)
          .linkWidth((link: any) => (highlightLinks.has(link) ? 2 : 0.5))
          .linkOpacity(0.4)
          .linkDirectionalParticles(2)
          .linkDirectionalParticleWidth((link: any) =>
            highlightLinks.has(link) ? 4 : 0
          )
          .linkDirectionalParticleSpeed(0.006)
          .linkCurvature(0.1)
          .nodeThreeObject((node: any) => {
            // Create text sprite for each node
            const sprite = new SpriteText(node.label as string);
            sprite.color = highlightNodes.has(node.id) ? "#ffffff" : "#f8fafc";
            sprite.backgroundColor = highlightNodes.has(node.id)
              ? "#ef4444"
              : node.posts > 10
              ? "#3b82f6"
              : "rgba(0,0,0,0)";
            sprite.padding = 2;
            sprite.textHeight = node.posts > 10 ? 3.5 : 2.5;
            sprite.borderRadius = 2;
            return sprite;
          })
          .onNodeClick((node: any) => {
            // Handle node click for highlighting
            if (highlightNodes.has(node.id)) {
              // Reset highlight on second click
              setHighlightNodes(new Set());
              setHighlightLinks(new Set());
              setCenterNode(null);
            } else {
              // Find connected links and nodes
              const connectedNodes = new Set<string>([node.id]);
              const connectedLinks = new Set<any>();
              links.forEach((link: any) => {
                const sourceId =
                  typeof link.source === "object"
                    ? link.source.id
                    : link.source;
                const targetId =
                  typeof link.target === "object"
                    ? link.target.id
                    : link.target;

                if (sourceId === node.id || targetId === node.id) {
                  connectedNodes.add(sourceId);
                  connectedNodes.add(targetId);
                  connectedLinks.add(link);
                }
              });
              setHighlightNodes(connectedNodes);
              setHighlightLinks(connectedLinks);
              setCenterNode(node.id);

              // Focus camera on the selected node
              graphRef.current.centerAt(node.x, node.y, node.z, 800);
              graphRef.current.zoom(1.5, 800);
            }
          })
          .cooldownTicks(100); // Limit simulation ticks for better performance
      }

      // Update data and render
      graphRef.current
        .graphData({ nodes, links })
        .width(containerRef.current.clientWidth)
        .height(containerRef.current.clientHeight);

      // Start with a slightly zoomed-out view to show the whole graph
      setTimeout(() => {
        if (graphRef.current) {
          graphRef.current.zoomToFit(1000, 100);
        }
      }, 200);
    } catch (err) {
      console.error("Error initializing 3D graph:", err);
    }

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && graphRef.current) {
        graphRef.current
          .width(containerRef.current.clientWidth)
          .height(containerRef.current.clientHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (graphRef.current && containerRef.current) {
        // Clean up
        containerRef.current.innerHTML = "";
        graphRef.current = null;
      }
    };
  }, [nodes, links, loading, error, highlightNodes, highlightLinks]);

  const resetHighlight = () => {
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    setCenterNode(null);
    if (graphRef.current) {
      graphRef.current.zoomToFit(1000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        Error loading network data
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
        <Button
          onClick={resetHighlight}
          variant="outline"
          className="bg-slate-900/50 text-white border-slate-700 hover:bg-slate-800"
        >
          Reset View
        </Button>

        {centerNode && (
          <div className="p-2 bg-slate-900/50 text-white rounded-md text-sm">
            Selected: {nodes.find((n) => n.id === centerNode)?.label}
            <span className="text-sky-300 ml-1">
              ({highlightNodes.size - 1} connections)
            </span>
          </div>
        )}
      </div>

      {/* Info overlay */}
      <div className="absolute top-4 right-4 z-10 p-2 bg-slate-900/50 text-white rounded-md text-sm">
        <div>Total Nodes: {nodes.length}</div>
        <div>Total Connections: {links.length}</div>
      </div>
    </div>
  );
}
