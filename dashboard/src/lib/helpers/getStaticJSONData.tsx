"use client";

import { useEffect, useState } from "react";
import { SummaryData, SummarySchema } from "@/types/summarySchema";

// Raw GitHub snapshot links
const ACTIVITY_LINK =
  "https://raw.githubusercontent.com/gauravfs-14/CognitiveSky/refs/heads/main/summary/activity.json";
const ENGAGEMENT_LINK =
  "https://raw.githubusercontent.com/gauravfs-14/CognitiveSky/refs/heads/main/summary/engagement.json";
const HASHTAGS_LINK =
  "https://raw.githubusercontent.com/gauravfs-14/CognitiveSky/refs/heads/main/summary/hashtags.json";
const NARRATIVES_LINK =
  "https://raw.githubusercontent.com/gauravfs-14/CognitiveSky/refs/heads/main/summary/narratives.json";
const TOPICS_LINK =
  "https://raw.githubusercontent.com/gauravfs-14/CognitiveSky/refs/heads/main/summary/topics.json";

const extractScope = (snapshot: any, type: string): any => {
  const dates = Object.keys(snapshot);
  for (const date of dates.reverse()) {
    const day = snapshot[date];
    if (day?.[type]?.overall) {
      return day[type].overall;
    }
  }
  return {};
};

// Flatten structure: { date: { type: { scope: value } } } → { scope: value }
const flattenSnapshotFile = (snapshot: any): Record<string, any> => {
  const merged: Record<string, any> = {};
  for (const date of Object.keys(snapshot)) {
    const types = snapshot[date];
    for (const type of Object.keys(types)) {
      for (const scope of Object.keys(types[type])) {
        merged[scope] = types[type][scope];
      }
    }
  }
  return merged;
};

// Combine users across topics into a single DID → post count map
const flattenUsersByTopic = (
  usersByTopic: Record<string, Record<string, number>>
) => {
  const userMap: Record<string, { posts: number }> = {};
  for (const topic of Object.values(usersByTopic)) {
    for (const [did, count] of Object.entries(topic)) {
      if (!userMap[did]) userMap[did] = { posts: 0 };
      userMap[did].posts += count;
    }
  }
  return userMap;
};

export const getStaticJSONData = () => {
  const [data, setData] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all([
          fetch(ACTIVITY_LINK),
          fetch(ENGAGEMENT_LINK),
          fetch(HASHTAGS_LINK),
          fetch(NARRATIVES_LINK),
          fetch(TOPICS_LINK),
        ]);

        if (!responses.every((res) => res.ok)) {
          throw new Error("Failed to fetch one or more resources");
        }

        const [
          activityRaw,
          engagementRaw,
          hashtagsRaw,
          narrativesRaw,
          topicsRaw,
        ] = await Promise.all(responses.map((r) => r.json()));

        const activity = flattenSnapshotFile(activityRaw);
        const engagement = flattenSnapshotFile(engagementRaw);
        const topics = flattenSnapshotFile(topicsRaw);

        const hashtags = extractScope(hashtagsRaw, "hashtags");
        const emojis = extractScope(hashtagsRaw, "emojis");

        const narratives = extractScope(narrativesRaw, "narratives");
        const emotions = extractScope(narrativesRaw, "emotions");
        const languages = extractScope(narrativesRaw, "languages");

        const parsed = {
          activity: activity.timeline ?? {},

          engagement: {
            posts: engagement.top_by_interaction ?? [],
            users: flattenUsersByTopic(topics.users_by_topic ?? {}),
          },

          hashtags: {
            hashtags,
            emojis,
          },

          narratives: {
            narratives,
            emotions,
            languages,
          },

          topics: {
            keywords: topics.keywords ?? {},
            distribution_over_time: topics.distribution_over_time ?? {},
            sentiment_by_topic: topics.sentiment_by_topic ?? {},
            emotion_by_topic: topics.emotion_by_topic ?? {},
            top_posts: topics.top_posts ?? {},
            hashtags_by_topic: topics.hashtags_by_topic ?? {},
            emojis_by_topic: topics.emojis_by_topic ?? {},
            users_by_topic: topics.users_by_topic ?? {},
          },
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
