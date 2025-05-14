"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import {
  useTopicCorrelationData,
  TopicCorrelationData,
  TopicCorrelationMatrix,
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
  matrixData: TopicCorrelationMatrix;
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

// ZoomControls component for controlling the zoom level
const ZoomControls = ({
  zoomLevel,
  setZoomLevel,
}: {
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
}) => {
  return (
    <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm p-1 rounded-md shadow-sm">
      <button
        onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
        className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100"
        title="Zoom out"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14" />
        </svg>
      </button>
      <span className="text-xs w-12 text-center">
        {Math.round(zoomLevel * 100)}%
      </span>
      <button
        onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.1))}
        className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100"
        title="Zoom in"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <button
        onClick={() => setZoomLevel(1)}
        className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 ml-1"
        title="Reset zoom"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 12h18M12 3v18" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </button>
    </div>
  );
};

// Modern Heatmap implementation
const Heatmap = ({
  matrixData,
  width,
  height,
  margin = { top: 60, right: 20, bottom: 70, left: 100 },
}: HeatmapProps) => {
  const [hoveredCell, setHoveredCell] = useState<{
    rowTopic: string;
    colTopic: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  // Add zoom and pan state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPanPosition = useRef({ x: 0, y: 0 });
  const contentRef = useRef<SVGGElement>(null);

  // Pan handlers
  const handlePanStart = useCallback((event: React.MouseEvent<SVGElement>) => {
    if (event.buttons === 1) {
      // Left mouse button
      isPanning.current = true;
      lastPanPosition.current = { x: event.clientX, y: event.clientY };
      // Change cursor to indicate dragging
      if (contentRef.current) {
        contentRef.current.style.cursor = "grabbing";
      }
    }
  }, []);

  const handlePanMove = useCallback((event: React.MouseEvent<SVGElement>) => {
    if (!isPanning.current) return;

    const dx = event.clientX - lastPanPosition.current.x;
    const dy = event.clientY - lastPanPosition.current.y;

    setPanOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    lastPanPosition.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handlePanEnd = useCallback(() => {
    isPanning.current = false;
    if (contentRef.current) {
      contentRef.current.style.cursor = "grab";
    }
  }, []);

  // Use refs for D3 axis rendering
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);

  // If there's no data or dimensions are invalid, return early
  if (!matrixData || !matrixData.topics.length || width <= 0 || height <= 0) {
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

  // Destructure the matrix data directly
  const { topics, matrix } = matrixData;

  // Calculate the actual dimensions where cells will be placed
  const innerWidth = Math.max(1, width - margin.left - margin.right);
  const innerHeight = Math.max(1, height - margin.top - margin.bottom);

  // Create scales using d3
  const xScale = useMemo(() => {
    return d3.scaleBand().range([0, innerWidth]).domain(topics).padding(0.05);
  }, [topics, innerWidth]);

  const yScale = useMemo(() => {
    return d3.scaleBand().range([0, innerHeight]).domain(topics).padding(0.05);
  }, [topics, innerHeight]);

  // Create axes
  const xAxis = useMemo(() => {
    return d3.axisBottom(xScale).tickSize(0);
  }, [xScale]);

  const yAxis = useMemo(() => {
    return d3.axisLeft(yScale).tickSize(0);
  }, [yScale]);

  // Effect to render axes with improved styling
  useEffect(() => {
    if (xAxisRef.current) {
      d3.select(xAxisRef.current).call(xAxis);

      // Enhanced styling for x-axis
      d3.select(xAxisRef.current)
        .selectAll("text")
        .attr("dy", "0.5em")
        .style("text-anchor", "start")
        .attr("transform", "rotate(-45)")
        .style("font-size", "8.5px")
        .style("font-weight", "500")
        .each(function (d) {
          // Truncate long topic names
          const topicName = d as string;
          d3.select(this).text(
            topicName.length > 15
              ? topicName.substring(0, 13) + "..."
              : topicName
          );
        })
        .append("title")
        .text((d) => d as string); // Add full name as tooltip

      d3.select(xAxisRef.current).selectAll("line").attr("stroke", "#ddd");
      d3.select(xAxisRef.current).select("path").attr("stroke", "#ddd");
    }

    if (yAxisRef.current) {
      d3.select(yAxisRef.current).call(yAxis);

      // Enhanced styling for y-axis
      d3.select(yAxisRef.current)
        .selectAll("text")
        .style("font-size", "8.5px")
        .style("font-weight", "500")
        .each(function (d) {
          // Truncate long topic names
          const topicName = d as string;
          d3.select(this).text(
            topicName.length > 15
              ? topicName.substring(0, 13) + "..."
              : topicName
          );
        })
        .append("title")
        .text((d) => d as string); // Add full name as tooltip

      d3.select(yAxisRef.current).selectAll("line").attr("stroke", "#ddd");
      d3.select(yAxisRef.current).select("path").attr("stroke", "#ddd");
    }
  }, [xAxis, yAxis, matrix]);

  // Create color scale for heatmap
  const colorScale = useMemo(() => {
    // Find min and max values in the matrix
    let min = 0.1; // Minimum threshold
    let max = 1.0; // Maximum value (self-correlation)

    return d3
      .scaleSequential()
      .interpolator(d3.interpolateBlues)
      .domain([min, max]);
  }, [matrix]);

  // If cells would be too small, don't try to render
  const cellWidth = xScale.bandwidth();
  const cellHeight = yScale.bandwidth();

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
    <div style={{ position: "relative" }} className="heatmap-container">
      <div className="absolute top-2 left-2 z-10">
        <ZoomControls zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      </div>
      <svg
        width={width}
        height={height}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
      >
        <g
          ref={contentRef}
          transform={`translate(${margin.left + panOffset.x}, ${
            margin.top + panOffset.y
          }) scale(${zoomLevel})`}
          style={{ cursor: "grab", transformOrigin: "0 0" }}
        >
          {/* Add grid lines */}
          {topics.map((_, i) => (
            <line
              key={`grid-h-${i}`}
              x1={0}
              y1={(yScale(topics[i]) || 0) + yScale.bandwidth()}
              x2={innerWidth}
              y2={(yScale(topics[i]) || 0) + yScale.bandwidth()}
              stroke="#e5e7eb"
              strokeWidth={0.5}
              strokeOpacity={0.8}
            />
          ))}
          {topics.map((_, i) => (
            <line
              key={`grid-v-${i}`}
              x1={(xScale(topics[i]) || 0) + xScale.bandwidth()}
              y1={0}
              x2={(xScale(topics[i]) || 0) + xScale.bandwidth()}
              y2={innerHeight}
              stroke="#e5e7eb"
              strokeWidth={0.5}
              strokeOpacity={0.8}
            />
          ))}

          {/* Render cells */}
          {topics.map((rowTopic, rowIndex) =>
            topics.map((colTopic, colIndex) => {
              const value = matrix[rowIndex][colIndex];

              // Skip rendering if value is 0 or less than threshold
              if (value < 0.1) return null;

              return (
                <g
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="heatmap-cell"
                >
                  <rect
                    x={xScale(colTopic) || 0}
                    y={yScale(rowTopic) || 0}
                    width={xScale.bandwidth()}
                    height={yScale.bandwidth()}
                    fill={colorScale(value)}
                    stroke={value >= 0.4 ? "#fff" : "#e5e7eb"}
                    strokeWidth={0.5}
                    opacity={value < 0.2 ? 0.8 : 1}
                    rx={1}
                    onMouseEnter={(e) => {
                      setHoveredCell({
                        rowTopic,
                        colTopic,
                        value,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseLeave={() => {
                      setHoveredCell(null);
                    }}
                  />
                  {value >= 0.2 && cellWidth > 20 && cellHeight > 15 && (
                    <text
                      x={(xScale(colTopic) || 0) + xScale.bandwidth() / 2}
                      y={(yScale(rowTopic) || 0) + yScale.bandwidth() / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={value >= 0.4 ? "#ffffff" : "#333333"}
                      fontSize={Math.min(10, cellWidth / 4)}
                      fontWeight={value >= 0.5 ? "bold" : "normal"}
                    >
                      {(value * 100).toFixed(0)}%
                    </text>
                  )}
                  <title>{`${rowTopic} ↔ ${colTopic}: ${(value * 100).toFixed(
                    0
                  )}%`}</title>
                </g>
              );
            })
          )}

          {/* X-axis */}
          <g ref={xAxisRef} transform={`translate(0, ${innerHeight})`} />

          {/* Y-axis */}
          <g ref={yAxisRef} />
        </g>
      </svg>

      {/* Enhanced Interactive Tooltip */}
      {hoveredCell && (
        <div
          style={{
            position: "absolute",
            left: hoveredCell.x,
            top: hoveredCell.y,
            transform: "translate(10px, 10px)",
            backgroundColor: "rgba(255, 255, 255, 0.97)",
            padding: "10px 14px",
            borderRadius: "6px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)",
            fontSize: "12px",
            pointerEvents: "none",
            zIndex: 1000,
            maxWidth: "240px",
            border: "1px solid #f0f0f0",
          }}
        >
          <div className="font-semibold text-sm mb-2 pb-1 border-b border-gray-100">
            Topic Correlation
          </div>
          <div className="flex items-center mb-2">
            <span className="text-xs text-gray-500 w-24">Topics:</span>
            <span className="font-medium flex-1">
              {hoveredCell.rowTopic} ↔ {hoveredCell.colTopic}
            </span>
          </div>
          <div className="flex items-center mb-2">
            <span className="text-xs text-gray-500 w-24">Strength:</span>
            <span
              className="font-bold"
              style={{
                color: hoveredCell.value > 0.5 ? "#0284c7" : "#333",
              }}
            >
              {(hoveredCell.value * 100).toFixed(0)}%
            </span>
          </div>
          <div className="text-xs text-gray-600 italic bg-gray-50 p-1 rounded mt-1">
            These topics frequently appear together in posts
          </div>
        </div>
      )}
    </div>
  );
};

export function TopicCorrelation() {
  const { data, matrixData, loading, error } = useTopicCorrelationData();
  const { topics } = useTopicData();
  const [showInfo, setShowInfo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 280 });
  const [sortByCorrelation, setSortByCorrelation] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Log the data when it changes
  useEffect(() => {
    console.log("TopicCorrelation received data:", {
      dataLength: data?.length || 0,
      matrixDataTopics: matrixData?.topics?.length || 0,
      matrixDataMatrix: matrixData?.matrix?.length || 0,
      loading,
      error: error?.message,
    });
  }, [data, matrixData, loading, error]);

  // Function to sort topics by correlation strength
  const sortTopicsByCorrelation = useCallback(() => {
    if (!matrixData || !matrixData.topics.length) return matrixData;

    const { topics, matrix } = matrixData;

    // Calculate total correlation per topic (sum of all correlations for each topic)
    const topicCorrelationSums = topics.map((_, topicIndex) => {
      return matrix[topicIndex].reduce((sum, value) => sum + value, 0);
    });

    // Create an array of indices sorted by correlation strength
    const sortedIndices = Array.from(Array(topics.length).keys()).sort(
      (a, b) => {
        return topicCorrelationSums[b] - topicCorrelationSums[a];
      }
    );

    // Create new sorted arrays
    const sortedTopics = sortedIndices.map((i) => topics[i]);
    const sortedMatrix = sortedIndices.map((rowIndex) =>
      sortedIndices.map((colIndex) => matrix[rowIndex][colIndex])
    );

    // Return new sorted matrix data
    return {
      topics: sortedTopics,
      matrix: sortedMatrix,
    };
  }, [matrixData]);

  // Apply sorting if needed
  const displayData = useMemo(() => {
    if (sortByCorrelation && matrixData && matrixData.topics.length > 0) {
      return sortTopicsByCorrelation();
    }
    return matrixData;
  }, [matrixData, sortByCorrelation, sortTopicsByCorrelation]);

  // Debug logging for displayData
  useEffect(() => {
    console.log("Display data:", {
      exists: !!displayData,
      topicsLength: displayData?.topics?.length || 0,
      matrixSize: displayData?.matrix?.length || 0,
    });
  }, [displayData]);

  // Create a d3 color scale for the legend
  const colorScale = useMemo(() => {
    return d3
      .scaleSequential()
      .interpolator(d3.interpolateBlues)
      .domain([0.1, 1.0]);
  }, []);

  // Check if there's valid data to display
  useEffect(() => {
    console.log("Checking display data:", {
      exists: !!displayData,
      topics: displayData?.topics,
      topicsLength: displayData?.topics?.length || 0,
      matrixSize: displayData?.matrix?.length || 0,
      firstRow: displayData?.matrix?.[0],
    });
  }, [displayData]);

  // Create a canvas-based color legend
  const ColorLegend = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const width = 120;
    const height = 16;

    useEffect(() => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");

      if (!context) return;

      // Draw the color gradient with smoother transitions
      const gradient = context.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "#e0f2fe"); // lightest blue - 10%
      gradient.addColorStop(0.25, "#bae6fd"); // light blue - 30%
      gradient.addColorStop(0.5, "#7dd3fc"); // medium blue - 50%
      gradient.addColorStop(0.75, "#38bdf8"); // bright blue - 70%
      gradient.addColorStop(1, "#0284c7"); // dark blue - 100%

      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      // Add a subtle border
      context.strokeStyle = "#e5e7eb";
      context.lineWidth = 1;
      context.strokeRect(0, 0, width, height);

      // Add tick marks
      context.strokeStyle = "#94a3b8";
      context.lineWidth = 1;
      [0, 0.25, 0.5, 0.75, 1].forEach((pos) => {
        context.beginPath();
        context.moveTo(pos * width, height);
        context.lineTo(pos * width, height + 3);
        context.stroke();
      });
    }, []);

    return (
      <div className="flex flex-col items-center">
        <span className="text-xs mb-1 text-gray-500">Correlation Strength</span>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{ borderRadius: "2px" }}
          />
          <div className="flex justify-between w-full mt-1 px-0 text-[10px] text-gray-500">
            <span>10%</span>
            <span>30%</span>
            <span>50%</span>
            <span>70%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    );
  };

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
            <li>Drag to pan the view, use controls to zoom</li>
            <li>
              This visualization is based on actual topic co-occurrence in posts
            </li>
          </ul>
        </div>
      )}

      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-sm font-medium">Topic Correlations</h3>
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <label htmlFor="sort-topics" className="text-xs mr-2">
                Sort by strength:
              </label>
              <input
                id="sort-topics"
                type="checkbox"
                checked={sortByCorrelation}
                onChange={() => setSortByCorrelation(!sortByCorrelation)}
                className="h-3 w-3"
              />
            </div>
            <ColorLegend />
          </div>
        </div>
      </div>

      <div
        className="border border-gray-100 rounded-md bg-white shadow-sm overflow-auto"
        style={{ height: "235px" }}
      >
        <div
          style={{
            minWidth: "600px",
            minHeight: "235px",
            position: "relative",
          }}
        >
          {displayData &&
          displayData.topics &&
          displayData.topics.length > 0 &&
          displayData.matrix &&
          displayData.matrix.length > 0 ? (
            <Heatmap
              matrixData={displayData}
              width={dimensions.width}
              height={dimensions.height}
              margin={{ top: 60, right: 20, bottom: 70, left: 100 }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100 max-w-xs">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mx-auto mb-2 text-gray-400"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <p className="mb-2 font-medium">
                  No correlation data available
                </p>
                <p className="text-xs text-gray-400">
                  This could be due to insufficient topic co-occurrences in
                  posts. Try broadening your filter selection.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-2 left-2">
        <ZoomControls zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      </div>

      {/* Enhanced Topic Legend */}
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm p-2.5 rounded-lg shadow-sm max-w-xs max-h-32 overflow-auto border border-gray-100">
        <div className="text-xs font-semibold mb-1.5 flex items-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>
          <span>Top Topics</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {topics.slice(0, 6).map((topic, index) => (
            <div key={index} className="flex items-center group">
              <div
                className="w-2 h-2 rounded-full mr-1.5 flex-shrink-0"
                style={{ backgroundColor: topic.color }}
              />
              <span
                className="text-xs truncate max-w-[90px] group-hover:text-blue-600 transition-colors"
                title={topic.label}
              >
                {topic.label}
              </span>
            </div>
          ))}
          {topics.length > 6 && (
            <div className="text-xs text-gray-500 col-span-2 mt-1 pt-1 border-t border-gray-100">
              +{topics.length - 6} more topics
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
