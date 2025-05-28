import { useMemo } from "react";
import { SummaryData, useSummaryData } from "./use-summary-data";

// Recharts-compatible types
export type TimeSeriesPoint = { date: string; [key: string]: string | number };
export type CategoryBar = { name: string; value: number };
export type TopicBreakdown = {
  topic: string;
  label: string[];
  count: number;
  daily: TimeSeriesPoint[];
  sentiment: CategoryBar[];
  emotion: CategoryBar[];
  hashtags: string[];
  emojis: string[];
};
export type HashtagEdge = { source: string; target: string; weight: number };

export type ChartData = {
  sentimentTimeSeries: TimeSeriesPoint[];
  emotionTimeSeries: TimeSeriesPoint[];
  languageTimeSeries: TimeSeriesPoint[];
  volumeTimeSeries: TimeSeriesPoint[];
  emojiTimeSeries: TimeSeriesPoint[];
  hashtagTimeSeries: TimeSeriesPoint[];
  emojiSentimentBars: Record<string, CategoryBar[]>;
  topicsOverview: TopicBreakdown[];
  sentimentByTopicChart: CategoryBar[];
  emotionByTopicChart: CategoryBar[];
  hashtagGraph: HashtagEdge[];
  kpis: {
    total: SummaryData["meta"]["complete"];
    lastWeek: SummaryData["meta"]["last_week"];
    averages: SummaryData["meta"]["averages"];
    top: SummaryData["meta"]["top"];
  };
  // New Overall Aggregates
  languageOverall: CategoryBar[];
  sentimentOverall: CategoryBar[];
  emotionOverall: CategoryBar[];
  emojiOverall: CategoryBar[];
  hashtagOverall: CategoryBar[];
};

export function useChartData(): {
  loading: boolean;
  error: string | null;
  chartData: ChartData | null;
} {
  const { data, loading, error } = useSummaryData();

  const chartData = useMemo<ChartData | null>(() => {
    if (!data) return null;

    const {
      meta,
      activity,
      emojis,
      hashtags,
      emoji_sentiment,
      sentiment_by_topic,
      emotion_by_topic,
      hashtag_graph,
      topics,
    } = data;

    const sentimentTimeSeries: TimeSeriesPoint[] = [];
    const emotionTimeSeries: TimeSeriesPoint[] = [];
    const languageTimeSeries: TimeSeriesPoint[] = [];
    const volumeTimeSeries: TimeSeriesPoint[] = [];

    const sentimentTotal: Record<string, number> = {};
    const emotionTotal: Record<string, number> = {};
    const languageTotal: Record<string, number> = {};
    const emojiTotal: Record<string, number> = {};
    const hashtagTotal: Record<string, number> = {};

    for (const [date, stats] of Object.entries(activity)) {
      sentimentTimeSeries.push({ date, ...stats.sentiment });
      emotionTimeSeries.push({ date, ...stats.emotion });
      languageTimeSeries.push({ date, ...stats.language });
      volumeTimeSeries.push({ date, volume: stats.volume });

      for (const [k, v] of Object.entries(stats.sentiment)) {
        sentimentTotal[k] = (sentimentTotal[k] || 0) + v;
      }
      for (const [k, v] of Object.entries(stats.emotion)) {
        emotionTotal[k] = (emotionTotal[k] || 0) + v;
      }
      for (const [k, v] of Object.entries(stats.language)) {
        languageTotal[k] = (languageTotal[k] || 0) + v;
      }
    }

    const emojiTimeSeries: TimeSeriesPoint[] = [];
    for (const [date, counts] of Object.entries(emojis)) {
      emojiTimeSeries.push({ date, ...counts });
      for (const [emoji, count] of Object.entries(counts)) {
        emojiTotal[emoji] = (emojiTotal[emoji] || 0) + count;
      }
    }

    const hashtagTimeSeries: TimeSeriesPoint[] = [];
    for (const [date, counts] of Object.entries(hashtags)) {
      hashtagTimeSeries.push({ date, ...counts });
      for (const [hashtag, count] of Object.entries(counts)) {
        hashtagTotal[hashtag] = (hashtagTotal[hashtag] || 0) + count;
      }
    }

    const kpis = {
      total: meta.complete,
      lastWeek: meta.last_week,
      averages: meta.averages,
      top: meta.top,
    };

    const emojiSentimentBars: Record<string, CategoryBar[]> = {};
    for (const [sentiment, emojiMap] of Object.entries(emoji_sentiment)) {
      emojiSentimentBars[sentiment] = Object.entries(emojiMap)
        .map(([emoji, value]) => ({ name: emoji, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    }

    const topicsOverview: TopicBreakdown[] = Object.entries(topics).map(
      ([topic, info]) => ({
        topic,
        label: info.label,
        count: info.count,
        daily: Object.entries(info.daily).map(([date, value]) => ({
          date,
          [topic]: value,
        })),
        sentiment: Object.entries(info.sentiment).map(([k, v]) => ({
          name: k,
          value: v,
        })),
        emotion: Object.entries(info.emotion).map(([k, v]) => ({
          name: k,
          value: v,
        })),
        hashtags: info.hashtags,
        emojis: info.emojis,
      })
    );

    const sentimentByTopicChart: CategoryBar[] = Object.entries(
      sentiment_by_topic
    ).map(([topic, dist]) => ({
      name: topic,
      value: Object.values(dist).reduce((a, b) => a + b, 0),
    }));

    const emotionByTopicChart: CategoryBar[] = Object.entries(
      emotion_by_topic
    ).map(([topic, dist]) => ({
      name: topic,
      value: Object.values(dist).reduce((a, b) => a + b, 0),
    }));

    return {
      sentimentTimeSeries,
      emotionTimeSeries,
      languageTimeSeries,
      volumeTimeSeries,
      emojiTimeSeries,
      hashtagTimeSeries,
      emojiSentimentBars,
      topicsOverview,
      sentimentByTopicChart,
      emotionByTopicChart,
      hashtagGraph: hashtag_graph,
      kpis,
      languageOverall: Object.entries(languageTotal)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      sentimentOverall: Object.entries(sentimentTotal)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      emotionOverall: Object.entries(emotionTotal)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      emojiOverall: Object.entries(emojiTotal)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      hashtagOverall: Object.entries(hashtagTotal)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
    };
  }, [data]);

  return { loading, error, chartData };
}
