import { useEffect, useState } from "react";
import {
  MetaSummary,
  metaSchema,
  activitySummarySchema,
  emojiSentimentSchema,
  timeSeriesTagsSchema,
  topicSentimentEmotionSchema,
  hashtagGraphSchema,
  topicsSummarySchema,
  ActivitySummary,
  EmojiSentiment,
  TimeSeriesTags,
  TopicSentimentOrEmotion,
  HashtagGraph,
  TopicsSummary,
} from "@/types/summarySchema";

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

export type SummaryData = {
  meta: MetaSummary;
  activity: ActivitySummary;
  emojis: TimeSeriesTags;
  hashtags: TimeSeriesTags;
  emoji_sentiment: EmojiSentiment;
  sentiment_by_topic: TopicSentimentOrEmotion;
  emotion_by_topic: TopicSentimentOrEmotion;
  hashtag_graph: HashtagGraph;
  topics: TopicsSummary;
};

type UseSummaryDataResult =
  | { loading: true; error: null; data: null }
  | { loading: false; error: string | null; data: SummaryData | null };

export function useSummaryData(): UseSummaryDataResult {
  const [state, setState] = useState<UseSummaryDataResult>({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchJson = async (url: string) => {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.status}`);
      }
      return res.json();
    };

    const fetchAndParseData = async () => {
      try {
        const [
          meta,
          activity,
          emojis,
          hashtags,
          emojiSentiment,
          sentimentByTopic,
          emotionByTopic,
          hashtagGraph,
          topics,
        ] = await Promise.all([
          fetchJson(RAW_LINKS.meta),
          fetchJson(RAW_LINKS.activity),
          fetchJson(RAW_LINKS.emojis),
          fetchJson(RAW_LINKS.hashtags),
          fetchJson(RAW_LINKS.emoji_sentiment),
          fetchJson(RAW_LINKS.sentiment_by_topic),
          fetchJson(RAW_LINKS.emotion_by_topic),
          fetchJson(RAW_LINKS.hashtag_graph),
          fetchJson(RAW_LINKS.topics),
        ]);

        const data: SummaryData = {
          meta: metaSchema.parse(meta),
          activity: activitySummarySchema.parse(activity),
          emojis: timeSeriesTagsSchema.parse(emojis),
          hashtags: timeSeriesTagsSchema.parse(hashtags),
          emoji_sentiment: emojiSentimentSchema.parse(emojiSentiment),
          sentiment_by_topic:
            topicSentimentEmotionSchema.parse(sentimentByTopic),
          emotion_by_topic: topicSentimentEmotionSchema.parse(emotionByTopic),
          hashtag_graph: hashtagGraphSchema.parse(hashtagGraph),
          topics: topicsSummarySchema.parse(topics),
        };

        setState({ loading: false, error: null, data });
      } catch (error: any) {
        if (controller.signal.aborted) return;

        console.error("❌ Fetch or parse error:", error);
        setState({
          loading: false,
          error: error?.message || "Unknown error",
          data: null,
        });
      }
    };

    fetchAndParseData();

    return () => controller.abort();
  }, []);

  return state;
}
