"use client";

import { useState, useEffect } from "react";
import { useTopicData } from "./useTopicData";

export interface TopicCorrelationData {
  source: string;
  target: string;
  value: number;
}

export function useTopicCorrelationData() {
  const { topics } = useTopicData();
  const [data, setData] = useState<TopicCorrelationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (topics.length === 0) return;

        setLoading(true);

        // Fetch real post data from the data files
        const response = await fetch("/data/clean_posts_full.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const postsData = await response.json();

        // Create a map of topic IDs to labels for quick lookups
        const topicIdToLabel = new Map(
          topics.map((topic) => [topic.id, topic.label])
        );

        // Count occurrences of topics
        const topicOccurrences: Record<number, number> = {};

        // Count occurrences of topic pairs (for correlation)
        // Use a formatted string key like "1_2" to represent topic pair 1 and 2
        const topicPairOccurrences: Record<string, number> = {};

        // We'll analyze co-occurrences within a time window
        // Group posts by day to find co-occurring topics
        const postsByDay: Record<string, Set<number>> = {};

        // Process each post
        postsData.forEach((post: any) => {
          if (post.topic === undefined) return;

          // Count individual topic occurrences
          const topicId = post.topic;
          topicOccurrences[topicId] = (topicOccurrences[topicId] || 0) + 1;

          // Extract the date for time-based co-occurrence
          const date = post.createdAt.split("T")[0];

          // Initialize set for this day if needed
          if (!postsByDay[date]) {
            postsByDay[date] = new Set();
          }

          // Add this topic to the day's set
          postsByDay[date].add(topicId);
        });

        // Calculate co-occurrences by day
        Object.values(postsByDay).forEach((topicsInDay) => {
          // Convert set to array for easier looping
          const topicsArray = Array.from(topicsInDay);

          // Check all pairs of topics
          for (let i = 0; i < topicsArray.length; i++) {
            for (let j = i + 1; j < topicsArray.length; j++) {
              // Ensure consistent ordering of topic pairs (smaller ID first)
              const [topic1, topic2] = [topicsArray[i], topicsArray[j]].sort(
                (a, b) => a - b
              );

              // Create a key for this topic pair
              const pairKey = `${topic1}_${topic2}`;

              // Increment the co-occurrence count
              topicPairOccurrences[pairKey] =
                (topicPairOccurrences[pairKey] || 0) + 1;
            }
          }
        });

        // Calculate correlation strength using Jaccard similarity:
        // J(A,B) = |A ∩ B| / |A ∪ B| = co-occurrences / (occurrencesA + occurrencesB - co-occurrences)
        const correlations: TopicCorrelationData[] = [];

        Object.entries(topicPairOccurrences).forEach(
          ([pairKey, coOccurrences]) => {
            // Extract topic IDs from the pair key
            const [topic1Id, topic2Id] = pairKey.split("_").map(Number);

            // Get individual topic occurrences
            const occurrencesA = topicOccurrences[topic1Id] || 0;
            const occurrencesB = topicOccurrences[topic2Id] || 0;

            // Only calculate if both topics have at least 5 occurrences
            if (occurrencesA >= 5 && occurrencesB >= 5) {
              // Calculate Jaccard similarity (correlation strength)
              const union = occurrencesA + occurrencesB - coOccurrences;
              const correlation = union > 0 ? coOccurrences / union : 0;

              // Only include correlations with strength > 0.1
              if (correlation > 0.1) {
                // Get topic labels
                const sourceLabel =
                  topicIdToLabel.get(topic1Id) || `Topic ${topic1Id}`;
                const targetLabel =
                  topicIdToLabel.get(topic2Id) || `Topic ${topic2Id}`;

                correlations.push({
                  source: sourceLabel,
                  target: targetLabel,
                  value: parseFloat(correlation.toFixed(2)),
                });
              }
            }
          }
        );

        // Sort correlations by strength (descending)
        correlations.sort((a, b) => b.value - a.value);

        // Limit to top 30 strongest correlations
        const topCorrelations = correlations.slice(0, 30);

        console.log(
          `Generated ${topCorrelations.length} real topic correlations from ${postsData.length} posts`
        );

        setData(topCorrelations);
        setLoading(false);
      } catch (err) {
        console.error("Error generating topic correlations:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setLoading(false);
      }
    };

    if (topics.length > 0) {
      fetchData();
    }
  }, [topics]);

  return { data, loading, error };
}
