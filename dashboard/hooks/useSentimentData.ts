"use client";

import { useState, useEffect } from "react";
import { useFilters } from "@/contexts/filter-context";
import rawData from "@/public/data/sentiment_counts.json";

export interface SentimentData {
  label: "Negative" | "Neutral" | "Positive";
  count: number;
  percent: number;
  color?: string;
}

const colors: { [K in "Negative" | "Neutral" | "Positive"]: string } = {
  Negative: "#f87171", // Red for Negative
  Neutral: "#fbbf24", // Yellow for Neutral
  Positive: "#60a5fa", // Blue for Positive
};

// Static data outside the component
const staticSentimentData: SentimentData[] = rawData.map((item) => ({
  label:
    item.label === "label_0"
      ? "Negative"
      : item.label === "label_1"
      ? "Neutral"
      : "Positive",
  count: item.count,
  percent: item.percent,
  color:
    colors[
      item.label === "label_0"
        ? "Negative"
        : item.label === "label_1"
        ? "Neutral"
        : "Positive"
    ], // Assign color based on label
}));

export function useSentimentData() {
  const [data, setData] = useState<SentimentData[]>(staticSentimentData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get filters - wrap in try/catch to handle case where FilterProvider isn't available yet
  // Initialize filter values with defaults
  const defaultTopics: number[] = [];
  const defaultEmotions: string[] = [];
  const defaultDateRange: [Date, Date] = [new Date(), new Date()];
  const defaultSearchQuery: string = "";
  const defaultIsFilterActive: boolean = false;

  // Attempt to get filters from the context, but provide defaults if unavailable
  let filters;
  try {
    filters = useFilters();
  } catch (e) {
    // FilterProvider not available yet, use defaults
    console.warn("FilterProvider not available, using default filters.");
    filters = {
      topics: defaultTopics,
      emotions: defaultEmotions,
      dateRange: defaultDateRange,
      searchQuery: defaultSearchQuery,
      isFilterActive: defaultIsFilterActive,
    };
  }

  const {
    topics: activeTopics,
    emotions: activeEmotions,
    dateRange,
    searchQuery,
    isFilterActive,
  } = filters;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Start with a copy of the static data
        let filteredData = [...staticSentimentData];

        // Simulate filtering by reducing counts based on active filters
        if (isFilterActive) {
          // Apply a random reduction factor for each filter to simulate filtering
          let reductionFactor = 1.0;

          // Each active filter reduces the data by some amount
          if (activeTopics.length > 0) {
            reductionFactor *= 0.7 + Math.random() * 0.2; // 0.7-0.9
          }

          if (activeEmotions.length > 0) {
            reductionFactor *= 0.6 + Math.random() * 0.3; // 0.6-0.9
          }

          if (searchQuery) {
            reductionFactor *= 0.5 + Math.random() * 0.3; // 0.5-0.8
          }

          filteredData = filteredData.map((item) => {
            const newCount = Math.floor(item.count * reductionFactor);
            return {
              ...item,
              count: newCount,
              // Recalculate percentages
              percent: 0, // We'll calculate this after
            };
          });

          // Recalculate percentages
          const total = filteredData.reduce((sum, item) => sum + item.count, 0);
          filteredData = filteredData.map((item) => ({
            ...item,
            percent: Number(((item.count / total) * 100).toFixed(2)),
          }));
        }

        setData(filteredData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setLoading(false);
      }
    };

    fetchData();
  }, [isFilterActive, activeTopics, activeEmotions, dateRange, searchQuery]);

  return { data, loading, error };
}
