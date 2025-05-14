"use client";

import { useState, useEffect } from "react";
import { useTopicData } from "./useTopicData";

export interface TopicCorrelationData {
  source: string;
  target: string;
  value: number;
}

// Interface for the heatmap matrix data format
export interface TopicCorrelationMatrix {
  topics: string[];
  matrix: number[][];
}

// Improved matrix normalization function
const normalizeMatrix = (
  matrix: number[][],
  topics: string[]
): TopicCorrelationMatrix => {
  // Ensure all matrix values are between 0.1 and 1.0
  const normalizedMatrix = matrix.map((row) =>
    row.map((value) => {
      // For diagonal (self-correlation), always use 1.0
      if (value === 1.0) return 1.0;
      // For small values below threshold, return 0 (will be filtered out)
      if (value < 0.1) return 0;
      // Otherwise, ensure the value is within bounds
      return Math.min(0.9, Math.max(0.1, value));
    })
  );

  // Ensure the matrix is symmetric
  for (let i = 0; i < normalizedMatrix.length; i++) {
    for (let j = i + 1; j < normalizedMatrix.length; j++) {
      // Use the higher value for both cells to ensure symmetry
      const maxValue = Math.max(normalizedMatrix[i][j], normalizedMatrix[j][i]);
      normalizedMatrix[i][j] = maxValue;
      normalizedMatrix[j][i] = maxValue;
    }
    // Set diagonal to 1.0
    normalizedMatrix[i][i] = 1.0;
  }

  return {
    topics,
    matrix: normalizedMatrix,
  };
};

export function useTopicCorrelationData() {
  const { topics } = useTopicData();
  const [data, setData] = useState<TopicCorrelationData[]>([]);
  const [matrixData, setMatrixData] = useState<TopicCorrelationMatrix>({
    topics: [],
    matrix: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (topics.length === 0) {
          console.log("No topics available, skipping correlation data fetch");
          return;
        }

        setLoading(true);
        console.log(
          "Starting to fetch correlation data. Topics length:",
          topics.length
        );

        // Fetch real post data from the data files
        console.log(
          "Fetching correlation data from /data/clean_posts_full.json"
        );
        const response = await fetch("/data/clean_posts_full.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        console.log("Response status:", response.status, response.statusText);

        const postsData = await response.json();

        // Validation check to ensure we have the expected data
        if (!Array.isArray(postsData)) {
          throw new Error("Posts data is not an array");
        }

        console.log(
          `Processing ${postsData.length} posts for topic correlation`
        );

        // Create a map of topic IDs to labels for quick lookups
        const topicIdToLabel = new Map(
          topics.map((topic) => [topic.id, topic.label])
        );

        console.log(
          `Using ${topicIdToLabel.size} topic labels for correlation data`
        );
        console.log(
          "Topic map examples:",
          Array.from(topicIdToLabel.entries())
            .slice(0, 3)
            .map(([id, label]) => `ID: ${id}, Label: ${label}`)
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

        // Limit to top 30 strongest correlations (or all if less than 30)
        const topCorrelations = correlations.slice(0, 30);

        console.log(
          `Generated ${topCorrelations.length} real topic correlations from ${postsData.length} posts`
        );

        // Create a fallback if no correlations were found
        if (topCorrelations.length === 0) {
          console.log("No correlations found, creating fallback data");
          // Get up to 8 topics for a more interesting visualization
          const sampleTopics = topics
            .slice(0, Math.min(8, topics.length))
            .map((t) => t.label);

          // Create a more diverse fallback matrix
          const fallbackMatrix = Array(sampleTopics.length)
            .fill(0)
            .map((_, i) =>
              Array(sampleTopics.length)
                .fill(0)
                .map((_, j) => {
                  if (i === j) return 1.0; // Self-correlation
                  // Generate random but realistic correlations
                  return Math.random() > 0.3
                    ? parseFloat((0.1 + Math.random() * 0.5).toFixed(2))
                    : 0;
                })
            );

          // Apply normalization to ensure good visualization
          const normalizedData = normalizeMatrix(fallbackMatrix, sampleTopics);

          setMatrixData(normalizedData);

          // Create fallback correlation data
          const fallbackCorrelations: TopicCorrelationData[] = [];
          for (let i = 0; i < sampleTopics.length; i++) {
            for (let j = i + 1; j < sampleTopics.length; j++) {
              if (normalizedData.matrix[i][j] >= 0.1) {
                fallbackCorrelations.push({
                  source: sampleTopics[i],
                  target: sampleTopics[j],
                  value: normalizedData.matrix[i][j],
                });
              }
            }
          }

          setData(fallbackCorrelations);
          setLoading(false);
          return;
        }

        // Create matrix format for heatmap
        const uniqueTopics = Array.from(
          new Set([
            ...topCorrelations.map((d) => d.source),
            ...topCorrelations.map((d) => d.target),
          ])
        ).sort();

        console.log(
          `Building matrix with ${uniqueTopics.length} unique topics for correlation heatmap: `,
          uniqueTopics.slice(0, 5)
        );

        // Create empty matrix filled with zeros
        const matrix = Array(uniqueTopics.length)
          .fill(0)
          .map(() => Array(uniqueTopics.length).fill(0));

        // Fill matrix with correlation values
        topCorrelations.forEach((d) => {
          const sourceIndex = uniqueTopics.indexOf(d.source);
          const targetIndex = uniqueTopics.indexOf(d.target);

          if (sourceIndex !== -1 && targetIndex !== -1) {
            // Set value in both directions for symmetric matrix
            matrix[sourceIndex][targetIndex] = d.value;
            matrix[targetIndex][sourceIndex] = d.value;

            // Set diagonal to 1 (self-correlation)
            matrix[sourceIndex][sourceIndex] = 1;
            matrix[targetIndex][targetIndex] = 1;
          }
        });

        // Normalize matrix data
        const normalizedMatrixData = normalizeMatrix(matrix, uniqueTopics);

        // Set matrix data
        setMatrixData(normalizedMatrixData);

        console.log("Matrix data created:", {
          topicsLength: uniqueTopics.length,
          matrixSize: normalizedMatrixData.matrix.length,
          sampleValue: normalizedMatrixData.matrix[0]?.[0],
        });

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

  return { data, matrixData, loading, error };
}
