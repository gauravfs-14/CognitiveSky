"use client";

import { useState, useEffect } from "react";
import rawData from "@/public/data/languages.json";

export interface LanguageData {
  lang: string;
  count: number;
  color: string;
}

const colors = {
  1: "#60a5fa",
  2: "#f87171",
  3: "#4ade80",
  4: "#fbbf24",
  5: "#a78bfa",
  6: "#94a3b8",
  7: "#fbbf24",
  8: "#a78bfa",
  9: "#60a5fa",
  10: "#f87171",
  11: "#4ade80",
  12: "#fbbf24",
  13: "#a78bfa",
  14: "#94a3b8",
  15: "#fbbf24",
  16: "#a78bfa",
  17: "#60a5fa",
  18: "#f87171",
  19: "#4ade80",
  20: "#fbbf24",
  21: "#a78bfa",
  22: "#94a3b8",
  23: "#fbbf24",
  24: "#a78bfa",
};

export function useLanguageData() {
  const [data, setData] = useState<LanguageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use static data
        const staticData: LanguageData[] = rawData.map((item, index) => ({
          lang: item.lang,
          count: item.count,
          color: colors[(index + 1) as keyof typeof colors] || "#000000", // Default to black if no color is found
        }));

        setData(staticData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
