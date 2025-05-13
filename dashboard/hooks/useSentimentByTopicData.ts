"use client";

import { useState, useEffect } from "react";
import { useTopicData } from "./useTopicData";

export interface SentimentByTopicData {
  topic: string;
  topicId: number;
  positive: number;
  neutral: number;
  negative: number;
  color: string;
}

export function useSentimentByTopicData() {
  const { topics } = useTopicData();
  const [data, setData] = useState<SentimentByTopicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (topics.length === 0) return;

        setLoading(true);

        // Fetch real data from the posts with sentiment and topics
        const response = await fetch("/data/clean_posts_full.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const postsData = await response.json();

        // Create a map of topic IDs to sentiment counts
        const topicSentimentMap: Record<
          number,
          { positive: number; neutral: number; negative: number }
        > = {};

        // Initialize counts for each topic
        topics.forEach((topic) => {
          topicSentimentMap[topic.id] = {
            positive: 0,
            neutral: 0,
            negative: 0,
          };
        });

        // Count sentiments per topic
        postsData.forEach((post: any) => {
          // Skip if post doesn't have topic or sentiment
          if (post.topic === undefined || !post.sentiment) return;

          const topicId = post.topic;

          // Ensure the topic exists in our map (it should because we initialized all topic IDs)
          if (!topicSentimentMap[topicId]) return;

          // Map sentiment labels to our categories
          // We're assuming label_2 is positive, label_1 is neutral, label_0 is negative based on typical sentiment models
          if (post.sentiment === "label_2") {
            topicSentimentMap[topicId].positive += 1;
          } else if (post.sentiment === "label_1") {
            topicSentimentMap[topicId].neutral += 1;
          } else if (post.sentiment === "label_0") {
            topicSentimentMap[topicId].negative += 1;
          }
        });

        // Create the final data array with the real sentiment counts
        const sentimentData: SentimentByTopicData[] = topics.map((topic) => ({
          topic: topic.label,
          topicId: topic.id,
          positive: topicSentimentMap[topic.id].positive,
          neutral: topicSentimentMap[topic.id].neutral,
          negative: topicSentimentMap[topic.id].negative,
          color: topic.color,
        }));

        setData(sentimentData);
        setLoading(false);
      } catch (err) {
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
