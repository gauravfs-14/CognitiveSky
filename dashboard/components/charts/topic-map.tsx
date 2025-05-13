"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTopicData } from "@/hooks/useTopicData";
import {
  Loader2,
  Info,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

// Dynamically import ForceGraph with no SSR to avoid hydration issues
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export function TopicMap() {
  const { topics, semanticMap, loading, error } = useTopicData();
  const [activePoint, setActivePoint] = useState<any>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [use3D, setUse3D] = useState(false);
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });
  const fgRef = useRef<any>(null);

  // Track node size adjustment
  const [nodeSizeMultiplier, setNodeSizeMultiplier] = useState<number>(1);

  // Toggle highlighted topics
  const [highlightedTopics, setHighlightedTopics] = useState<number[]>([]);

  // Toggle topic highlighting
  const toggleTopicHighlight = useCallback((topicId: number) => {
    setHighlightedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  }, []);

  // Transform semantic map data into nodes and links for force graph
  useEffect(() => {
    if (!loading && !error && topics.length > 0 && semanticMap.length > 0) {
      // Create nodes from semantic map points
      const nodes = semanticMap.map((point) => {
        const isHighlighted =
          highlightedTopics.length === 0 ||
          highlightedTopics.includes(point.topic);

        return {
          id: point.postId,
          text:
            point.text.substring(0, 100) +
            (point.text.length > 100 ? "..." : ""),
          x: point.x * 20, // Scale positions to be more spread out
          y: point.y * 20,
          topic: point.topic,
          color: topics.find((t) => t.id === point.topic)?.color || "#cccccc",
          // Adjust size based on highlighting state
          size: isHighlighted ? 2 * nodeSizeMultiplier : 1 * nodeSizeMultiplier,
          __highlighted: isHighlighted,
        };
      });

      // Create links between points that are close to each other and in the same topic
      const links: { source: string; target: string; strength: number }[] = [];

      // For performance, we'll create links based on proximity within the same topic
      // This avoids creating too many links while still showing topical relationships
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];

        // Skip non-highlighted nodes if we're highlighting
        if (
          highlightedTopics.length > 0 &&
          !highlightedTopics.includes(nodeA.topic)
        ) {
          continue;
        }

        // Find 2-3 closest nodes within the same topic to link to
        const sameTopicNodes = nodes
          .filter((n) => n.topic === nodeA.topic && n.id !== nodeA.id)
          .slice(0, 100); // Take a subset for performance

        for (let j = 0; j < Math.min(3, sameTopicNodes.length); j++) {
          const nodeB = sameTopicNodes[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Only create links if nodes are reasonably close
          if (distance < 40) {
            links.push({
              source: nodeA.id,
              target: nodeB.id,
              strength: 0.05, // Weak links for better layout
            });
          }
        }
      }

      console.log(
        `Created graph with ${nodes.length} nodes and ${links.length} links` +
          (highlightedTopics.length > 0
            ? ` (highlighting ${highlightedTopics.length} topics)`
            : "")
      );
      setGraphData({ nodes, links });
    }
  }, [
    topics,
    semanticMap,
    loading,
    error,
    highlightedTopics,
    nodeSizeMultiplier,
  ]);

  // Handle node clicks
  const handleNodeClick = useCallback((node: any) => {
    // Toggle node selection (deselect if clicking the same node)
    setActivePoint((prev: any) => (prev && prev.id === node.id ? null : node));
  }, []);

  // Node visualization callback with improved visuals
  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const { x, y, color, id, size, topic } = node;
      const topicLabel = topics.find((t) => t.id === topic)?.label;

      // Calculate node size based on zoom level (globalScale)
      const baseSize = size * 1.5;
      const nodeSize = baseSize / Math.sqrt(globalScale);

      // Draw circle for the node
      ctx.beginPath();
      ctx.arc(x, y, nodeSize, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Add a subtle border to all nodes for better visibility
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 0.3;
      ctx.stroke();

      // Highlight active node with a prominent halo and label
      if (activePoint && activePoint.id === id) {
        // Outer glow effect
        ctx.beginPath();
        ctx.arc(x, y, nodeSize * 2, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner highlight
        ctx.beginPath();
        ctx.arc(x, y, nodeSize * 1.3, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Add topic label if zoomed in enough
        if (globalScale < 1.5 && topicLabel) {
          ctx.font = "10px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = "white";

          // Text shadow for better visibility
          ctx.shadowColor = "rgba(0,0,0,0.7)";
          ctx.shadowBlur = 4;
          ctx.fillText(topicLabel, x, y + nodeSize * 1.5);
          ctx.shadowColor = "transparent";
        }
      }
    },
    [activePoint, topics]
  ); // Handle zoom to fit the graph
  const handleZoomToFit = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 50);
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if this component is visible/mounted
      if (e.key === "Escape" && activePoint) {
        setActivePoint(null);
      } else if (e.key === "f" || e.key === "F") {
        handleZoomToFit();
      } else if (e.key === "h" || e.key === "H") {
        setShowInfo(!showInfo);
      } else if (e.key === "3") {
        setUse3D(true);
      } else if (e.key === "2") {
        setUse3D(false);
      } else if (e.key === "c" || e.key === "C") {
        setHighlightedTopics([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleZoomToFit, showInfo, activePoint]);

  // State for collapsed/expanded legend
  const [isLegendCollapsed, setIsLegendCollapsed] = useState(true);

  // Add zoom controls
  const handleZoomIn = useCallback(() => {
    if (fgRef.current) {
      const fg = fgRef.current;
      // Different zoom methods for 2D and 3D
      if (use3D) {
        // For 3D, move camera closer
        const distance = fg.cameraPosition().z;
        fg.cameraPosition({ z: distance * 0.7 });
      } else {
        // For 2D, use the zoom method
        fg.zoom(fg.zoom() * 1.4);
      }
    }
  }, [use3D]);

  const handleZoomOut = useCallback(() => {
    if (fgRef.current) {
      const fg = fgRef.current;
      if (use3D) {
        // For 3D, move camera further
        const distance = fg.cameraPosition().z;
        fg.cameraPosition({ z: distance * 1.3 });
      } else {
        // For 2D, use the zoom method
        fg.zoom(fg.zoom() * 0.7);
      }
    }
  }, [use3D]);

  const handleResetGraph = useCallback(() => {
    // Reset all filters and selections
    setHighlightedTopics([]);
    setActivePoint(null);
    setNodeSizeMultiplier(1);
    handleZoomToFit();
  }, [handleZoomToFit]);

  useEffect(() => {
    // Auto-zoom when data loads
    if (graphData.nodes.length > 0 && fgRef.current) {
      handleZoomToFit();
    }
  }, [graphData.nodes.length, handleZoomToFit]);

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
        Error loading topic data
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Control buttons */}
      <div className="absolute top-0 right-0 z-10 flex gap-2 p-2 bg-white/50 backdrop-blur-sm rounded-bl-lg">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setUse3D(!use3D)}
          className="bg-white/80"
          title={use3D ? "Switch to 2D view (2)" : "Switch to 3D view (3)"}
        >
          {use3D ? (
            <EyeOff className="h-4 w-4 mr-1" />
          ) : (
            <Eye className="h-4 w-4 mr-1" />
          )}
          {use3D ? "2D" : "3D"}
        </Button>

        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="bg-white/80 px-1.5"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomToFit}
            className="bg-white/80"
            title="Zoom to fit all nodes (F)"
          >
            Fit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="bg-white/80 px-1.5"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 px-2">
          <span className="text-xs">Size:</span>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={nodeSizeMultiplier}
            onChange={(e) => setNodeSizeMultiplier(parseFloat(e.target.value))}
            className="w-16 h-4"
            title="Adjust node size"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleResetGraph}
          className="bg-white/80"
          title="Reset view and filters"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Reset
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInfo(!showInfo)}
          className="bg-white/80"
          title={showInfo ? "Hide help (H)" : "Show help (H)"}
        >
          <Info className="h-4 w-4 mr-1" />
          Help
        </Button>
      </div>

      {/* Help info */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-12 right-0 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg text-xs max-w-[200px]"
        >
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-semibold text-xs">Topic Map Help</h4>
            <button
              className="text-gray-400 hover:text-gray-600 text-xs"
              onClick={() => setShowInfo(false)}
            >
              ✕
            </button>
          </div>
          <ul className="list-disc pl-3 space-y-1 text-xs">
            <li>Click nodes to see post details</li>
            <li>Click topic names to filter</li>
            <li>Use size slider to adjust nodes</li>
            <li>2D/3D toggle for different views</li>
            <li>Drag to pan, scroll to zoom</li>
            <li>Use Fit button to see all data</li>
          </ul>
          <div className="mt-1 text-xs text-gray-500 border-t border-gray-200 pt-1">
            Keyboard: [F] Fit, [2/3] Toggle view
          </div>
        </motion.div>
      )}

      {/* Force graph visualization */}
      <div className="h-full w-full">
        {use3D ? (
          <ForceGraph3D
            ref={fgRef}
            graphData={graphData}
            nodeLabel={(node: any) =>
              `${topics.find((t) => t.id === node.topic)?.label}: ${node.text}`
            }
            nodeColor={(node: any) => node.color}
            nodeRelSize={5}
            linkWidth={0.3}
            linkColor={() => "#ffffff66"}
            backgroundColor="#ffffff"
            onNodeClick={handleNodeClick}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={0.5}
            linkDirectionalParticleSpeed={0.01}
            cooldownTime={3000}
            warmupTicks={50}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            controlType="orbit"
            rendererConfig={{ antialias: true, alpha: true }}
          />
        ) : (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeCanvasObject={nodeCanvasObject}
            linkColor={() => "rgba(200, 200, 200, 0.4)"}
            onNodeClick={handleNodeClick}
            cooldownTime={3000}
            linkWidth={0.2}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            autoPauseRedraw={false}
            warmupTicks={50}
            minZoom={0.5}
            maxZoom={8}
          />
        )}
      </div>

      {/* Active node details */}
      {activePoint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-20 left-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg text-xs max-w-xs"
        >
          <div className="flex justify-between items-center">
            <div
              className="font-semibold flex items-center"
              style={{
                color: topics.find((t) => t.id === activePoint.topic)?.color,
              }}
            >
              <div
                className="w-2 h-2 rounded-full mr-1"
                style={{
                  backgroundColor: topics.find(
                    (t) => t.id === activePoint.topic
                  )?.color,
                }}
              />
              {topics.find((t) => t.id === activePoint.topic)?.label}
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 text-xs ml-2"
              onClick={() => setActivePoint(null)}
              title="Close details"
            >
              ✕
            </button>
          </div>
          <div
            className="text-gray-600 mt-1 leading-relaxed border-l-2 pl-2 text-xs max-h-32 overflow-auto"
            style={{
              borderColor:
                topics.find((t) => t.id === activePoint.topic)?.color || "#ccc",
            }}
          >
            {activePoint.text}
          </div>
        </motion.div>
      )}

      {/* Topic Legend */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm">
        <div className="text-xs font-semibold mb-1 flex justify-between items-center">
          <span>Topics</span>
          <div className="flex items-center gap-1">
            {highlightedTopics.length > 0 && (
              <button
                className="text-xs text-blue-500 hover:text-blue-700"
                onClick={() => setHighlightedTopics([])}
                title="Clear all filters"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsLegendCollapsed(!isLegendCollapsed)}
              className="text-xs text-gray-500 hover:text-gray-700 ml-1"
              title={isLegendCollapsed ? "Expand legend" : "Collapse legend"}
            >
              {isLegendCollapsed ? "▼" : "▲"}
              {highlightedTopics.length > 0 && ` (${highlightedTopics.length})`}
            </button>
          </div>
        </div>
        {!isLegendCollapsed && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 max-h-24 overflow-auto pr-1">
            {topics.map((topic) => {
              const isHighlighted = highlightedTopics.includes(topic.id);
              const isActive = highlightedTopics.length === 0 || isHighlighted;

              return (
                <div
                  key={topic.id}
                  className={`flex items-center p-1 rounded hover:bg-gray-100 cursor-pointer transition-colors ${
                    isActive ? "" : "opacity-50"
                  }`}
                  onClick={() => toggleTopicHighlight(topic.id)}
                  title={`${isHighlighted ? "Remove" : "Add"} ${topic.label} ${
                    isHighlighted ? "from" : "to"
                  } filter`}
                >
                  <div
                    className={`w-3 h-3 rounded-full mr-1 ${
                      isHighlighted ? "ring-2 ring-offset-1" : ""
                    }`}
                    style={{
                      backgroundColor: topic.color,
                      ...(isHighlighted
                        ? ({ "--ring-color": topic.color } as any)
                        : {}),
                    }}
                  />
                  <span className="text-xs truncate">{topic.label}</span>
                </div>
              );
            })}
          </div>
        )}
        {isLegendCollapsed && highlightedTopics.length > 0 && (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {highlightedTopics.map((topicId) => {
              const topic = topics.find((t) => t.id === topicId);
              if (!topic) return null;

              return (
                <div
                  key={topic.id}
                  className="flex items-center bg-gray-100 rounded-full px-2 py-0.5 text-xs"
                  title={`Click to remove ${topic.label}`}
                  onClick={() => toggleTopicHighlight(topic.id)}
                >
                  <div
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: topic.color }}
                  />
                  <span className="truncate max-w-[80px]">{topic.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
