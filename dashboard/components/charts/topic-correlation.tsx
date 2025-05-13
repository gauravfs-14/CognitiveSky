"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  useTopicCorrelationData,
  TopicCorrelationData,
} from "@/hooks/useTopicCorrelationData";
import { useTopicData } from "@/hooks/useTopicData";
import { Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

// Generate color for heatmap based on value
const getHeatmapColor = (value: number): string => {
  // Color gradient from light blue to dark blue
  if (value < 0.2) return "#e0f2fe"; // lightest blue
  if (value < 0.4) return "#bae6fd";
  if (value < 0.6) return "#7dd3fc";
  if (value < 0.8) return "#38bdf8";
  return "#0284c7"; // darkest blue
};

// Define types for the Heatmap component props
interface HeatmapProps {
  data: TopicCorrelationData[];
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

// Custom heatmap implementation
const Heatmap = ({
  data,
  width,
  height,
  margin = { top: 60, right: 20, bottom: 60, left: 60 },
}: HeatmapProps) => {
  // If there's no data or dimensions are invalid, return early
  if (!data || data.length === 0 || width <= 0 || height <= 0) {
    return (
      <svg width={width} height={height}>
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          fontSize={14}
          fill="#666"
        >
          No correlation data to display
        </text>
      </svg>
    );
  }

  // Calculate the actual dimensions where cells will be placed
  const innerWidth = Math.max(1, width - margin.left - margin.right);
  const innerHeight = Math.max(1, height - margin.top - margin.bottom);

  // Get unique row and column values
  const uniqueSources = [...new Set(data.map((d) => d.source))];
  const uniqueTargets = [...new Set(data.map((d) => d.target))];

  // Calculate cell dimensions with safety checks
  const cellWidth =
    uniqueSources.length > 0 ? innerWidth / uniqueSources.length : 0;
  const cellHeight =
    uniqueTargets.length > 0 ? innerHeight / uniqueTargets.length : 0;

  // If cells would be too small, don't try to render
  if (cellWidth < 1 || cellHeight < 1) {
    return (
      <svg width={width} height={height}>
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          fontSize={14}
          fill="#666"
        >
          Insufficient space to render heatmap
        </text>
      </svg>
    );
  }
  return (
    <svg width={width} height={height}>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Render cells */}
        {data.map((d, i) => {
          const sourceIndex = uniqueSources.indexOf(d.source);
          const targetIndex = uniqueTargets.indexOf(d.target);
          // Skip invalid indices
          if (sourceIndex < 0 || targetIndex < 0) return null;

          const x = sourceIndex * cellWidth;
          const y = targetIndex * cellHeight;

          return (
            <g key={`cell-${i}`} className="heatmap-cell">
              <rect
                x={x}
                y={y}
                width={cellWidth}
                height={cellHeight}
                fill={getHeatmapColor(d.value)}
                stroke="#fff"
                strokeWidth={1}
              />
              {d.value >= 0.2 && cellWidth > 30 && cellHeight > 20 && (
                <text
                  x={x + cellWidth / 2}
                  y={y + cellHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={d.value >= 0.4 ? "#ffffff" : "#333333"}
                  fontSize={Math.min(10, cellWidth / 5)}
                >
                  {(d.value * 100).toFixed(0)}%
                </text>
              )}
              <title>{`${d.source} ↔ ${d.target}: ${(d.value * 100).toFixed(
                0
              )}%`}</title>
            </g>
          );
        })}

        {/* X-axis labels */}
        {uniqueSources.map((source, i) => {
          // Only render labels if they fit
          if (cellWidth < 20) return null;
          return (
            <text
              key={`x-label-${i}`}
              x={i * cellWidth + cellWidth / 2}
              y={-10}
              textAnchor="middle"
              fontSize={Math.min(10, cellWidth / 6)}
              fill="#666"
              transform={`rotate(-45, ${i * cellWidth + cellWidth / 2}, -10)`}
            >
              {source}
            </text>
          );
        })}

        {/* Y-axis labels */}
        {uniqueTargets.map((target, i) => {
          // Only render labels if they fit
          if (cellHeight < 15) return null;
          return (
            <text
              key={`y-label-${i}`}
              x={-10}
              y={i * cellHeight + cellHeight / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={Math.min(10, cellHeight / 3)}
              fill="#666"
            >
              {target}
            </text>
          );
        })}

        {/* Axis titles */}
        <text
          x={innerWidth / 2}
          y={innerHeight + 30}
          textAnchor="middle"
          fontSize={12}
          fill="#333"
        >
          Source Topics
        </text>
        <text
          transform={`translate(-40, ${innerHeight / 2}) rotate(-90)`}
          textAnchor="middle"
          fontSize={12}
          fill="#333"
        >
          Target Topics
        </text>
      </g>
    </svg>
  );
};

export function TopicCorrelation() {
  const { data, loading, error } = useTopicCorrelationData();
  const { topics } = useTopicData();
  const [showInfo, setShowInfo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 280 });

  // Create a legend for the heatmap colors
  const ColorLegend = () => (
    <div className="flex items-center space-x-2 text-xs">
      <span>Correlation:</span>
      <div className="flex items-center">
        <div
          className="w-4 h-4"
          style={{ backgroundColor: getHeatmapColor(0.1) }}
        ></div>
        <span className="ml-1">Low</span>
      </div>
      <div className="flex items-center">
        <div
          className="w-4 h-4"
          style={{ backgroundColor: getHeatmapColor(0.5) }}
        ></div>
        <span className="ml-1">Medium</span>
      </div>
      <div className="flex items-center">
        <div
          className="w-4 h-4"
          style={{ backgroundColor: getHeatmapColor(0.9) }}
        ></div>
        <span className="ml-1">High</span>
      </div>
    </div>
  ); // Process data to ensure we only include each correlation once
  // (either as source→target or target→source, not both)
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // We'll create a map for faster lookups
    const topicMap = new Map();
    const seen = new Set();

    // First pass: only keep unique pairs
    const uniquePairs = data.filter((item) => {
      // Create a unique key for this pair regardless of order
      const pairKey = [item.source, item.target].sort().join("_");
      if (seen.has(pairKey)) return false;
      seen.add(pairKey);
      return true;
    });

    // Limit to maximum rows/columns for better visibility
    // If there are too many pairs, keep only the strongest correlations
    let result = uniquePairs;
    if (uniquePairs.length > 50) {
      result = [...uniquePairs].sort((a, b) => b.value - a.value).slice(0, 50);
    }

    console.log(
      `Processed ${data.length} correlations to ${result.length} unique pairs for visualization`
    );
    return result;
  }, [data]);

  // Update dimensions when the window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(600, width - 20), // Subtract padding
          height: 280, // Adjusted to avoid scrollbars
        });
      }
    };

    // Initial update
    updateDimensions();

    // Update on resize
    window.addEventListener("resize", updateDimensions);

    // Cleanup
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Make sure we update dimensions when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      const updateDimensions = () => {
        if (containerRef.current) {
          const { width } = containerRef.current.getBoundingClientRect();
          setDimensions({
            width: Math.max(600, width - 20),
            height: 280,
          });
        }
      };
      updateDimensions();
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Error loading topic correlation data
      </div>
    );
  }

  return (
    <div className="h-64 relative" ref={containerRef}>
      <Button
        variant="outline"
        size="sm"
        className="absolute top-0 right-0 z-10"
        onClick={() => setShowInfo(!showInfo)}
      >
        <Info className="h-4 w-4 mr-1" />
        Help
      </Button>

      {showInfo && (
        <div className="absolute top-10 right-0 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg text-sm max-w-xs">
          <h4 className="font-semibold mb-1">How to read this heatmap:</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>Each cell shows the correlation between two topics</li>
            <li>Darker blue indicates stronger correlation</li>
            <li>The percentage shows correlation strength</li>
            <li>Topics are shown on both axes</li>
            <li>
              This visualization is based on actual topic co-occurrence in posts
            </li>
          </ul>
        </div>
      )}

      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-sm font-medium">Topic Correlations</h3>
        <ColorLegend />
      </div>

      <div className="h-56 overflow-auto" style={{ height: "235px" }}>
        <div
          style={{
            minWidth: "600px",
            minHeight: "235px",
            position: "relative",
          }}
        >
          {processedData.length > 0 ? (
            <Heatmap
              data={processedData}
              width={dimensions.width}
              height={dimensions.height}
              margin={{ top: 40, right: 20, bottom: 40, left: 100 }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              No correlation data available
            </div>
          )}
        </div>
      </div>

      {/* Topic Legend */}
      <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-sm max-w-xs max-h-32 overflow-auto">
        <div className="text-xs font-semibold mb-1">Topics</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          {topics.slice(0, 6).map((topic, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: topic.color }}
              />
              <span className="text-xs truncate">{topic.label}</span>
            </div>
          ))}
          {topics.length > 6 && (
            <div className="text-xs text-gray-500 col-span-2">
              +{topics.length - 6} more topics
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
