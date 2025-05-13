"use client";

import { useState, useEffect } from "react";

export interface DailyPatternData {
  hour: string;
  count: number;
}

export function useDailyPatternData() {
  const [data, setData] = useState<DailyPatternData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch real data from clean_posts_full.json
        const response = await fetch("/data/clean_posts_full.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const postsData = await response.json();

        // Initialize hourly buckets (24 hours)
        const hourCounts: number[] = Array(24).fill(0);

        // Process posts to count by hour of day
        postsData.forEach((post: any) => {
          if (!post.createdAt) return;

          // Parse createdAt date and get hour
          const date = new Date(post.createdAt);
          const hour = date.getHours(); // getHours() returns 0-23

          // Increment counter for this hour
          hourCounts[hour]++;
        });

        // Format the data for display
        const hourlyData: DailyPatternData[] = hourCounts.map(
          (count, index) => ({
            hour: index.toString().padStart(2, "0") + ":00",
            count,
          })
        );

        setData(hourlyData);
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
