export type LabelCount = { [label: string]: number };
export type VolumeTimeline = { [date: string]: number };

export interface TopPost {
  uri: string;
  text: string;
  score: number;
  created_at: string;
  did: string;
}

export interface UserStats {
  [did: string]: {
    posts: number;
  };
}

export interface TopPostsGlobal extends Array<TopPost> {}

export interface EngagementData {
  posts: TopPostsGlobal;
  users: UserStats;
}

export interface HashtagCount {
  [hashtag: string]: number;
}

export interface EmojiCount {
  [emoji: string]: number;
}

export interface HashtagEmojiData {
  hashtags: HashtagCount;
  emojis: EmojiCount;
}

export interface NarrativeData {
  narratives: LabelCount;
  emotions: LabelCount;
  languages: LabelCount;
}

export interface TopicKeywordSummary {
  [topic: string]: string[];
}

export interface TopicTimeDistribution {
  [date: string]: {
    [topic: string]: number;
  };
}

export interface SentimentByTopic {
  [topic: string]: {
    [sentiment: string]: number;
  };
}

export interface EmotionByTopic {
  [topic: string]: {
    [emotion: string]: number;
  };
}

export interface TopPostsByTopic {
  [topic: string]: TopPost[];
}

export interface HashtagsByTopic {
  [topic: string]: {
    [hashtag: string]: number;
  };
}

export interface EmojisByTopic {
  [topic: string]: {
    [emoji: string]: number;
  };
}

export interface UsersByTopic {
  [topic: string]: {
    [did: string]: number;
  };
}

export interface TopicData {
  keywords: TopicKeywordSummary;
  distribution_over_time: TopicTimeDistribution;
  sentiment_by_topic: SentimentByTopic;
  emotion_by_topic: EmotionByTopic;
  top_posts: TopPostsByTopic;
  hashtags_by_topic: HashtagsByTopic;
  emojis_by_topic: EmojisByTopic;
  users_by_topic: UsersByTopic;
}

export interface SummaryData {
  activity: VolumeTimeline;
  engagement: EngagementData;
  hashtags: HashtagEmojiData;
  narratives: NarrativeData;
  topics: TopicData;
}
