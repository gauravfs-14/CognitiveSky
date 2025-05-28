// summarySchema.ts
import { z } from "zod";

// === META ===
export const metaSchema = z.object({
  date: z.string(),
  complete: z.object({
    total_posts: z.number(),
    total_sentiments: z.number(),
    total_emotions: z.number(),
    total_languages: z.number(),
    total_topics: z.number(),
    total_hashtags: z.number(),
    total_emojis: z.number(),
  }),
  last_week: z.object({
    total_posts: z.number(),
    total_sentiments: z.number(),
    total_emotions: z.number(),
    total_languages: z.number(),
    total_topics: z.number(),
    total_hashtags: z.number(),
    total_emojis: z.number(),
  }),
  averages: z.object({
    avg_posts_per_day: z.number(),
    avg_hashtags_per_day: z.number(),
    avg_emojis_per_day: z.number(),
  }),
  top: z.object({
    sentiment: z.string(),
    emotion: z.string(),
    language: z.string(),
    hashtag: z.string(),
    emoji: z.string(),
  }),
});
export type MetaSummary = z.infer<typeof metaSchema>;

// === ACTIVITY ===
export const dailyActivitySchema = z.object({
  volume: z.number(),
  sentiment: z.record(z.number()),
  emotion: z.record(z.number()),
  language: z.record(z.number()),
});
export const activitySummarySchema = z.record(dailyActivitySchema);
export type DailyActivity = z.infer<typeof dailyActivitySchema>;
export type ActivitySummary = z.infer<typeof activitySummarySchema>;

// === HASHTAGS / EMOJIS ===
export const dailyTagSummarySchema = z.record(z.number());
export const timeSeriesTagsSchema = z.record(dailyTagSummarySchema);
export type DailyTagSummary = z.infer<typeof dailyTagSummarySchema>;
export type TimeSeriesTags = z.infer<typeof timeSeriesTagsSchema>;

// === EMOJI SENTIMENT ===
export const emojiSentimentSchema = z.record(z.record(z.number()));
export type EmojiSentiment = z.infer<typeof emojiSentimentSchema>;

// === HASHTAG GRAPH ===
export const hashtagEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  weight: z.number(),
});
export const hashtagGraphSchema = z.array(hashtagEdgeSchema);
export type HashtagEdge = z.infer<typeof hashtagEdgeSchema>;
export type HashtagGraph = z.infer<typeof hashtagGraphSchema>;

// === SENTIMENT / EMOTION BY TOPIC ===
export const topicDistributionSchema = z.record(z.number());
export const topicSentimentEmotionSchema = z.record(topicDistributionSchema);
export type TopicDistribution = z.infer<typeof topicDistributionSchema>;
export type TopicSentimentOrEmotion = z.infer<
  typeof topicSentimentEmotionSchema
>;

// === TOPICS ===
export const topicSummarySchema = z.object({
  label: z.array(z.string()),
  count: z.number(),
  daily: z.record(z.number()),
  sentiment: z.record(z.number()),
  emotion: z.record(z.number()),
  hashtags: z.array(z.string()),
  emojis: z.array(z.string()),
});
export const topicsSummarySchema = z.record(topicSummarySchema);
export type TopicSummary = z.infer<typeof topicSummarySchema>;
export type TopicsSummary = z.infer<typeof topicsSummarySchema>;
