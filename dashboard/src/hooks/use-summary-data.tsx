// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  | {
      loading: true;
      error: null;
      data: null;
    }
  | {
      loading: false;
      error: string | null;
      data: SummaryData | null;
    };

export function useSummaryData(): UseSummaryDataResult {
  const [state, setState] = useState<UseSummaryDataResult>({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    const fetchAndValidate = async () => {
      const urlsInOrder = [
        RAW_LINKS.meta,
        RAW_LINKS.activity,
        RAW_LINKS.emojis,
        RAW_LINKS.hashtags,
        RAW_LINKS.emoji_sentiment,
        RAW_LINKS.sentiment_by_topic,
        RAW_LINKS.emotion_by_topic,
        RAW_LINKS.hashtag_graph,
        RAW_LINKS.topics,
      ];
      try {
        const [
          metaRes,
          activityRes,
          emojisRes,
          hashtagsRes,
          emojiSentimentRes,
          sentimentByTopicRes,
          emotionByTopicRes,
          hashtagGraphRes,
          topicsRes,
        ] = await Promise.all(
          urlsInOrder.map((url) =>
            fetch(url).then((res) => {
              if (!res.ok)
                throw new Error(`HTTP error: ${res.status} for ${url}`);
              return res.json();
            })
          )
        );

        console.log("metaRes", metaRes);

        const data: SummaryData = {
          meta: metaSchema.parse(metaRes),
          activity: activitySummarySchema.parse(activityRes),
          emojis: timeSeriesTagsSchema.parse(emojisRes),
          hashtags: timeSeriesTagsSchema.parse(hashtagsRes),
          emoji_sentiment: emojiSentimentSchema.parse(emojiSentimentRes),
          sentiment_by_topic:
            topicSentimentEmotionSchema.parse(sentimentByTopicRes),
          emotion_by_topic:
            topicSentimentEmotionSchema.parse(emotionByTopicRes),
          hashtag_graph: hashtagGraphSchema.parse(hashtagGraphRes),
          topics: topicsSummarySchema.parse(topicsRes),
        };

        setState({ loading: false, error: null, data });
      } catch (err: any) {
        console.error("❌ Data fetch/validation failed", err);
        setState({
          loading: false,
          error: err?.message || "Unknown error",
          data: null,
        });
      }
    };

    fetchAndValidate();
  }, []);

  return state;
}
