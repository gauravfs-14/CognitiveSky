"use client";

import { useState, useEffect } from "react";
import rawData from "@/public/data/hashtags.json";

export interface HashtagData {
  hashtag: string;
  count: number;
}

export function useHashtagData() {
  const [data, setData] = useState<HashtagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use static data
        const staticData: HashtagData[] = rawData;

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
