"use client";

import { useState, useEffect } from "react";

export interface WeeklyPatternData {
  day: string;
  count: number;
  color?: string;
}

export function useWeeklyPatternData() {
  const [data, setData] = useState<WeeklyPatternData[]>([]);
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

        // Initialize data for each day of the week
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const colors = [
          "#1e40af",
          "#60a5fa",
          "#93c5fd",
          "#60a5fa",
          "#3b82f6",
          "#2563eb",
          "#1d4ed8",
        ];

        // Count posts per day of the week
        const dayCounts: Record<string, number> = {
          Sunday: 0,
          Monday: 0,
          Tuesday: 0,
          Wednesday: 0,
          Thursday: 0,
          Friday: 0,
          Saturday: 0,
        };

        // Process posts to count by day of week
        postsData.forEach((post: any) => {
          if (!post.createdAt) return;

          // Parse createdAt date and get day of week
          const date = new Date(post.createdAt);
          const dayOfWeek = days[date.getDay()]; // getDay() returns 0 for Sunday, 1 for Monday, etc.

          // Increment counter for this day
          dayCounts[dayOfWeek]++;
        });

        // Create the weekly pattern data array
        const weeklyData: WeeklyPatternData[] = days.map((day, index) => ({
          day,
          count: dayCounts[day],
          color: colors[index],
        }));

        // Reorder days to start with Monday
        const mondayFirst = [...weeklyData.slice(1), weeklyData[0]];

        setData(mondayFirst);
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
