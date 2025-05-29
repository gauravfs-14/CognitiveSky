"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { Wordcloud } from "@visx/wordcloud";
import { scaleSqrt, scaleOrdinal } from "@visx/scale";

interface VisxWordCloudProps {
  words: Array<{ text: string; value: number }>;
  width?: number | string; // optionally override width
  height?: number;
}

export default function VisxWordCloud({
  words,
  width = "100%", // default to full width of parent
  height = 400,
}: VisxWordCloudProps) {
  // Ref for the container
  const containerRef = useRef<HTMLDivElement>(null);
  // State to store measured width (initial default can be 500)
  const [measuredWidth, setMeasuredWidth] = useState<number>(500);

  // Measure container width on mount and on window resize
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setMeasuredWidth(containerRef.current.clientWidth);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate the font size scale based on word frequencies.
  const fontSizeScale = useMemo(
    () =>
      scaleSqrt({
        domain: [
          Math.min(...words.map((w) => w.value)),
          Math.max(...words.map((w) => w.value)),
        ],
        range: [10, 60],
      }),
    [words]
  );

  // Create a color scale for the words.
  const colorScale = useMemo(
    () =>
      scaleOrdinal({
        domain: words.map((w) => w.text),
        range: [
          "#FF4136",
          "#FF851B",
          "#2ECC40",
          "#0074D9",
          "#B10DC9",
          "#FFDC00",
          "#AAAAAA",
        ],
      }),
    [words]
  );

  // Configure options for the Visx WordCloud component.
  const options = useMemo(
    () => ({
      padding: 5,
      rotate: () => (Math.random() > 0.5 ? 90 : 0),
      font: "sans-serif",
      fontSize: (d: { value: number }) => fontSizeScale(d.value) ?? 20,
    }),
    [fontSizeScale]
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height,
      }}
    >
      <Wordcloud
        words={words}
        width={measuredWidth}
        height={height}
        padding={options.padding}
        rotate={options.rotate}
        font={options.font}
        fontSize={options.fontSize}
      >
        {(cloudWords) =>
          cloudWords.map((word, index) => (
            <text
              key={index}
              style={{
                fontSize: word.size,
                fontFamily: word.font,
                fill: colorScale(word.text || "") ?? "#000000",
              }}
              textAnchor="middle"
              transform={`translate(${word.x}, ${word.y}) rotate(${word.rotate})`}
            >
              {word.text}
            </text>
          ))
        }
      </Wordcloud>
    </div>
  );
}
