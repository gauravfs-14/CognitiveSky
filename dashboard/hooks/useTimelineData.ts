"use client";

import { useState, useEffect } from "react";
import rawData from "@/public/data/timeline.json";

export interface TimelineData {
  date: string;
  count: number;
}

export function useTimelineData() {
  const [data, setData] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll generate 30 days of data
        const today = new Date();
        const staticData: TimelineData[] = rawData.map((item) => {
          return {
            date: item.date,
            count: item.count,
          };
        });

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
