"use client";

import { useState, useEffect } from "react";

export interface SentimentTimelineData {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export function useSentimentTimelineData() {
  const [data, setData] = useState<SentimentTimelineData[]>([]);
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

        // Group posts by date and count sentiments
        const sentimentsByDate = new Map<
          string,
          { positive: number; neutral: number; negative: number }
        >();

        // Process each post and count sentiments per date
        postsData.forEach((post: any) => {
          if (!post.createdAt || !post.sentiment) return;

          // Extract date part (YYYY-MM-DD) from createdAt
          const date = post.createdAt.split("T")[0];

          // Initialize count for date if not exists
          if (!sentimentsByDate.has(date)) {
            sentimentsByDate.set(date, {
              positive: 0,
              neutral: 0,
              negative: 0,
            });
          }

          // Increment appropriate sentiment counter
          const sentiments = sentimentsByDate.get(date)!;
          if (post.sentiment === "label_2") {
            sentiments.positive += 1;
          } else if (post.sentiment === "label_1") {
            sentiments.neutral += 1;
          } else if (post.sentiment === "label_0") {
            sentiments.negative += 1;
          }
        });

        // Convert map to array and sort by date
        const timelineData: SentimentTimelineData[] = Array.from(
          sentimentsByDate,
          ([date, counts]) => ({
            date,
            ...counts,
          })
        ).sort((a, b) => a.date.localeCompare(b.date));

        setData(timelineData);
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
