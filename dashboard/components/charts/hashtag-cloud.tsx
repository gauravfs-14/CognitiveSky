"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { HashtagData } from "@/hooks/useHashtagData";
import * as d3 from "d3";
import cloud from "d3-cloud";

interface HashtagCloudProps {
  data: HashtagData[];
}

interface CloudWord {
  text: string;
  size: number;
  value: number;
  color?: string;
  x?: number;
  y?: number;
  rotate?: number;
}

export function HashtagCloud({ data }: HashtagCloudProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [words, setWords] = useState<CloudWord[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Function to generate the word cloud - memoized to prevent unnecessary recreations
  const generateCloud = useCallback(() => {
    if (
      !data ||
      data.length === 0 ||
      !containerRef.current ||
      dimensions.width === 0 ||
      dimensions.height === 0
    )
      return;

    const containerWidth = dimensions.width;
    const containerHeight = dimensions.height;

    // Sort data by count (descending)
    const sortedData = [...data].sort(
      (a, b) => (b.count || 0) - (a.count || 0)
    );

    // Find max count for scaling
    const maxCount = Math.max(...sortedData.map((tag) => tag.count || 0));

    // Color palette
    const colors = ["#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af"];
    const getColor = (index: number) => colors[index % colors.length];

    // Scale for font size
    const fontScale = d3.scaleLinear().domain([0, maxCount]).range([12, 36]);

    // Prepare data for d3-cloud
    const cloudWords: CloudWord[] = sortedData.map((tag, index) => ({
      text: tag.hashtag,
      size: fontScale(tag.count || 0),
      value: tag.count || 0,
      color: getColor(index),
    }));

    // Create layout
    const layout = cloud()
      .size([containerWidth, containerHeight])
      .words(cloudWords)
      .padding(5)
      .rotate(() =>
        Math.random() < 0.5 ? 0 : 90 * (Math.random() < 0.5 ? -1 : 1)
      )
      .font("Inter")
      .fontSize((d: CloudWord) => d.size)
      .spiral("archimedean") // Using archimedean spiral for better distribution
      .random(() => 0.5) // Consistent random to keep visualization stable
      .on("end", (generatedWords: CloudWord[]) => {
        // Center the layout around the container's center
        setWords(
          generatedWords.map((word) => ({
            ...word,
            // Add half of container dimensions to position from the center
            x: (word.x || 0) + containerWidth / 2,
            y: (word.y || 0) + containerHeight / 2,
          }))
        );
      });

    layout.start();
  }, [data, dimensions]);

  // Setup ResizeObserver to detect container size changes
  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isMounted]);

  // Generate cloud when dimensions or data change
  useEffect(() => {
    if (isMounted) {
      generateCloud();
    }
  }, [isMounted, generateCloud]);

  // Reset the cloud when window is resized
  useEffect(() => {
    if (!isMounted) return;

    const handleResize = () => {
      if (containerRef.current) {
        // Force regeneration of the cloud
        generateCloud();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMounted, generateCloud]);

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-pulse flex space-x-4">
          <div className="h-12 w-12 bg-sky-200 rounded-full"></div>
          <div className="space-y-4 flex-1">
            <div className="h-4 bg-sky-200 rounded w-3/4"></div>
            <div className="h-4 bg-sky-200 rounded"></div>
            <div className="h-4 bg-sky-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        No hashtag data available
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full p-4 overflow-hidden">
      <div className="relative w-full h-full flex">
        {words.map((word, i) => (
          <div
            key={i}
            className="absolute transition-all duration-200 hover:opacity-80 cursor-pointer hover:scale-110"
            style={{
              fontSize: `${word.size}px`,
              color: word.color,
              textShadow: "0px 1px 1px rgba(0,0,0,0.1)",
              transform: `translate(${word.x}px, ${word.y}px) rotate(${word.rotate}deg)`,
              transformOrigin: "center center",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
            title={`${word.text}: ${word.value}`}
          >
            {word.text}
          </div>
        ))}
      </div>
    </div>
  );
}
