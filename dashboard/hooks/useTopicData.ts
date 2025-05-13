"use client";

import { useState, useEffect } from "react";
import { useFilters } from "@/contexts/filter-context";

export interface TopicData {
  id: number;
  label: string;
  keywords: string[];
  count: number;
  color: string;
}

export interface SemanticMapPoint {
  postId: string;
  text: string;
  x: number;
  y: number;
  topic: number;
}

export function useTopicData() {
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [semanticMap, setSemanticMap] = useState<SemanticMapPoint[]>([]);
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

        // Load topic labels and semantic map from real data files
        const [topicLabelsResponse, semanticMapResponse, postsResponse] =
          await Promise.all([
            fetch("/data/topic_labels.json"),
            fetch("/data/semantic_map.json"),
            fetch("/data/clean_posts_full.json"),
          ]);

        if (
          !topicLabelsResponse.ok ||
          !semanticMapResponse.ok ||
          !postsResponse.ok
        ) {
          throw new Error("Failed to fetch data");
        }

        const topicLabelsData = await topicLabelsResponse.json();
        const semanticMapData = await semanticMapResponse.json();
        const postsData = await postsResponse.json();

        // Define colors for topics
        const colors = [
          "#60a5fa", // Blue
          "#a78bfa", // Purple
          "#4ade80", // Green
          "#fbbf24", // Yellow
          "#f472b6", // Pink
          "#fb7185", // Rose
          "#34d399", // Emerald
          "#f97316", // Orange
          "#64748b", // Slate
          "#0ea5e9", // Sky
          "#8b5cf6", // Violet
          "#10b981", // Teal
          "#ec4899", // Fuchsia
          "#ef4444", // Red
          "#6366f1", // Indigo
        ];

        // Count posts per topic
        const topicCounts: Record<number, number> = {};
        postsData.forEach((post: any) => {
          if (post.topic !== undefined) {
            topicCounts[post.topic] = (topicCounts[post.topic] || 0) + 1;
          }
        });

        // Convert topic labels to our TopicData format
        const realTopicsData: TopicData[] = Object.entries(topicLabelsData).map(
          ([id, data]: [string, any], index) => ({
            id: parseInt(id),
            label: data.label,
            keywords: data.keywords.slice(0, 10), // Take top 10 keywords
            count: topicCounts[parseInt(id)] || 0,
            color: colors[index % colors.length],
          })
        );

        // Convert semantic map data to our format
        // Limit to a reasonable number for performance
        const maxSemanticPoints = 1000;
        const mappedSemanticData = semanticMapData
          .slice(0, maxSemanticPoints)
          .map((point: any) => ({
            postId: point.postId,
            text: point.text,
            x: point.x,
            y: point.y,
            topic: point.topic,
          }));

        // Apply filters if needed
        let filteredTopics = [...realTopicsData];
        let filteredSemanticMap = [...mappedSemanticData];

        if (isFilterActive) {
          // If specific topics are selected, filter data accordingly
          if (activeTopics.length > 0) {
            filteredTopics = filteredTopics.map((topic) => {
              if (activeTopics.includes(topic.id)) {
                // Highlight selected topics
                return { ...topic };
              } else {
                // Reduce count for non-selected topics to make them less prominent
                return { ...topic, count: Math.floor(topic.count * 0.3) };
              }
            });

            // Filter semantic map to show primarily selected topics
            filteredSemanticMap = filteredSemanticMap.filter(
              (point) =>
                activeTopics.includes(point.topic) || Math.random() < 0.2
            );
          }

          // Apply additional filters
          if (activeEmotions.length > 0 || searchQuery) {
            // Filter posts by emotion or search query
            const filteredPostIds = new Set<string>();

            postsData.forEach((post: any) => {
              let matchesEmotion =
                activeEmotions.length === 0 ||
                (post.emotion && activeEmotions.includes(post.emotion));

              let matchesSearch =
                !searchQuery ||
                (post.text &&
                  post.text.toLowerCase().includes(searchQuery.toLowerCase()));

              if (matchesEmotion && matchesSearch) {
                filteredPostIds.add(post.postId);
              }
            });

            // Filter semantic map based on post IDs
            filteredSemanticMap = filteredSemanticMap.filter((point) =>
              filteredPostIds.has(point.postId)
            );

            // Re-count topics based on filtered posts
            const filteredTopicCounts: Record<number, number> = {};
            filteredSemanticMap.forEach((point) => {
              filteredTopicCounts[point.topic] =
                (filteredTopicCounts[point.topic] || 0) + 1;
            });

            // Update topic counts
            filteredTopics = filteredTopics.map((topic) => ({
              ...topic,
              count: filteredTopicCounts[topic.id] || 0,
            }));
          }
        }

        // Sort topics by count (descending)
        filteredTopics.sort((a, b) => b.count - a.count);

        console.log(
          `Loaded ${filteredTopics.length} topics and ${filteredSemanticMap.length} semantic map points from real data`
        );

        setTopics(filteredTopics);
        setSemanticMap(filteredSemanticMap);
        setLoading(false);
      } catch (err) {
        console.error("Error loading topic data:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setLoading(false);
      }
    };

    fetchData();
  }, [isFilterActive, activeTopics, activeEmotions, dateRange, searchQuery]);

  return { topics, semanticMap, loading, error };
}
