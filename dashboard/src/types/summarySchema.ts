import { z } from "zod";

// Basic label → count mappings
const LabelCount = z.record(z.string(), z.number());
const VolumeTimeline = z.record(z.string(), z.number());

const TopPost = z.object({
  uri: z.string(),
  text: z.string(),
  score: z.number(),
  created_at: z.string(),
  did: z.string(),
});
const TopPostsArray = z.array(TopPost);

const UserStats = z.record(z.string(), z.object({ posts: z.number() }));

const EngagementData = z.object({
  posts: TopPostsArray,
  users: UserStats,
});

const HashtagEmojiData = z.object({
  hashtags: z.record(z.string(), z.number()),
  emojis: z.record(z.string(), z.number()),
});

const NarrativeData = z.object({
  narratives: LabelCount,
  emotions: LabelCount,
  languages: LabelCount,
});

const TopicKeywordSummary = z.record(z.string(), z.array(z.string()));
const TopicTimeDistribution = z.record(
  z.string(),
  z.record(z.string(), z.number())
);
const SentimentByTopic = z.record(z.string(), z.record(z.string(), z.number()));
const EmotionByTopic = z.record(z.string(), z.record(z.string(), z.number()));
const TopPostsByTopic = z.record(z.string(), TopPostsArray);
const HashtagsByTopic = z.record(z.string(), z.record(z.string(), z.number()));
const EmojisByTopic = z.record(z.string(), z.record(z.string(), z.number()));
const UsersByTopic = z.record(z.string(), z.record(z.string(), z.number()));

const TopicData = z.object({
  keywords: TopicKeywordSummary,
  distribution_over_time: TopicTimeDistribution,
  sentiment_by_topic: SentimentByTopic,
  emotion_by_topic: EmotionByTopic,
  top_posts: TopPostsByTopic,
  hashtags_by_topic: HashtagsByTopic,
  emojis_by_topic: EmojisByTopic,
  users_by_topic: UsersByTopic,
});

export const SummarySchema = z.object({
  activity: VolumeTimeline,
  engagement: EngagementData,
  hashtags: HashtagEmojiData,
  narratives: NarrativeData,
  topics: TopicData,
});

export type SummaryData = z.infer<typeof SummarySchema>;
