export type MetaSummary = {
  date: string;
  complete: {
    total_posts: number;
    total_sentiments: number;
    total_emotions: number;
    total_languages: number;
    total_topics: number;
    total_hashtags: number;
    total_emojis: number;
  };
  last_week: {
    total_posts: number;
    total_sentiments: number;
    total_emotions: number;
    total_languages: number;
    total_topics: number;
    total_hashtags: number;
    total_emojis: number;
  };
  averages: {
    avg_posts_per_day: number;
    avg_hashtags_per_day: number;
    avg_emojis_per_day: number;
  };
  top: {
    sentiment: string;
    emotion: string;
    language: string;
    hashtag: string;
    emoji: string;
  };
};

export type DailyActivity = {
  volume: number;
  sentiment: Record<string, number>;
  emotion: Record<string, number>;
  language: Record<string, number>;
};

export type ActivitySummary = Record<string, DailyActivity>; // keyed by date

export type DailyTagSummary = Record<string, number>;

export type TimeSeriesTags = Record<string, DailyTagSummary>; // keyed by date

export type EmojiSentiment = Record<string, Record<string, number>>; // sentiment -> emoji -> count

export type HashtagEdge = {
  source: string;
  target: string;
  weight: number;
};

export type HashtagGraph = HashtagEdge[];

export type TopicDistribution = Record<string, number>; // topic -> count

export type TopicSentimentOrEmotion = Record<string, TopicDistribution>;

export type TopicSummary = {
  label: string[];
  count: number;
  daily: Record<string, number>;
  sentiment: Record<string, number>;
  emotion: Record<string, number>;
  hashtags: string[];
  emojis: string[];
};

export type TopicsSummary = Record<string, TopicSummary>; // topic name -> summary
