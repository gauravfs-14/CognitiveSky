/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { SummaryData, SummarySchema } from "@/types/summarySchema";

const RAW_LINKS = {
  activity:
    "https://raw.githubusercontent.com/gauravfs-14/CognitiveSky/refs/heads/main/summary/activity.json",
  emoji_sentiment:
    "https://raw.githubusercontent.com/gauravfs-14/CognitiveSky/refs/heads/main/summary/emoji_sentiment.json",
  emojis:
    "https://raw.githubusercontent.com/gauravfs-14/CognitiveSky/refs/heads/main/summary/emojis.json",
  emotion_by_topic:
    "https://raw.githubusercontent.com/gauravfs-14/CognitiveSky/refs/heads/main/summary/emotion_by_topic.json",
  hashtag_graph:
    "https://raw.githubusercontent.com/gauravfs-14/CognitiveSky/refs/heads/main/summary/hashtag_graph.json",
  hashtags:
    "https://raw.githubusercontent.com/gauravfs-14/CognitiveSky/refs/heads/main/summary/hashtags.json",
  meta: "https://raw.githubusercontent.com/gauravfs-14/CognitiveSky/refs/heads/main/summary/meta.json",
  sentiment_by_topic:
    "https://raw.githubusercontent.com/gauravfs-14/CognitiveSky/refs/heads/main/summary/sentiment_by_topic.json",
  topics:
    "https://raw.githubusercontent.com/gauravfs-14/CognitiveSky/refs/heads/main/summary/topics.json",
};

// Flatten function for activity, hashtags, emojis (time series)
const flattenTimeSeries = (snapshot: Record<string, any>) => {
  // Your snapshot is { date1: { ...counts }, date2: { ...counts }, ... }
  // Return as is, or normalize keys if needed.
  return snapshot || {};
};

export const useStaticJSONData = () => {
  const [data, setData] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all snapshot files concurrently
        const responses = await Promise.all(
          Object.values(RAW_LINKS).map((url) => fetch(url))
        );

        // Check if all fetches succeeded
        if (!responses.every((res) => res.ok)) {
          throw new Error("Failed to fetch one or more snapshot files.");
        }

        // Parse all JSON data
        const [
          activityRaw,
          emojiSentimentRaw,
          emojisRaw,
          emotionByTopicRaw,
          hashtagGraphRaw,
          hashtagsRaw,
          metaRaw,
          sentimentByTopicRaw,
          topicsRaw,
        ] = await Promise.all(responses.map((r) => r.json()));

        // Flatten or directly use as per expected structure

        // activity.json is a time series: { date: { volume, sentiment, emotion, language } }
        const activity = flattenTimeSeries(activityRaw);

        // hashtags.json and emojis.json are time series too
        const hashtags = flattenTimeSeries(hashtagsRaw);
        const emojis = flattenTimeSeries(emojisRaw);

        // emoji_sentiment.json is { sentiment_label: { emoji: count, ... }, ... }
        const emojiSentiment = emojiSentimentRaw || {};

        // hashtag_graph.json is an array of edges
        const hashtagGraph = hashtagGraphRaw || [];

        // sentiment_by_topic.json and emotion_by_topic.json are objects keyed by topic
        const sentimentByTopic = sentimentByTopicRaw || {};
        const emotionByTopic = emotionByTopicRaw || {};

        // meta.json contains summary info object directly
        const meta = metaRaw || {};

        // topics.json is an object keyed by topic
        const topics = topicsRaw || {};

        // Compose final parsed data shape
        const parsed = {
          meta,
          activity,
          hashtags,
          emojis,
          emoji_sentiment: emojiSentiment,
          hashtag_graph: hashtagGraph,
          sentiment_by_topic: sentimentByTopic,
          emotion_by_topic: emotionByTopic,
          topics,
        };

        console.log("📦 Parsed data:", parsed);

        const result = SummarySchema.safeParse(parsed);
        if (!result.success) {
          console.error("❌ Validation Error:", result.error.flatten());
          console.dir(result.error, { depth: null });
          console.log("📦 Failed payload:", parsed);
          throw new Error("Schema validation failed.");
        }

        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, error, loading };
};
