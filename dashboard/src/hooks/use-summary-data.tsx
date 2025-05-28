import { useStaticJSONData } from "@/lib/helpers/getStaticJSONData";

export function useSummaryData() {
  const { data, error, loading } = useStaticJSONData();

  if (loading || error || !data) {
    return {
      jsonData: data,
      error,
      loading,
      summary: {
        totalPosts: null,
        totalSentiments: null,
        topEmotionKey: "None",
        topEmotionCount: 0,
        totalLanguages: null,
        totalHashtags: null,
        totalEmojis: null,
        totalTopics: null,
        avgPostPerDay: null,
      },
    };
  }

  const totalPosts = Object.values(data.activity).reduce((a, b) => a + b, 0);
  const totalSentiments = Object.values(data.narratives.narratives).reduce(
    (sum, count) => sum + count,
    0
  );

  const [topEmotionKey, topEmotionCount] = Object.entries(
    data.narratives.emotions
  ).sort((a, b) => b[1] - a[1])[0] || ["None", 0];

  const totalLanguages = Object.keys(data.narratives.languages).length;
  const totalHashtags = Object.keys(data.hashtags.hashtags).length;
  const totalEmojis = Object.keys(data.hashtags.emojis).length;
  const totalTopics = Object.keys(data.topics.keywords).length;
  const avgPostPerDay = totalPosts / Object.keys(data.activity).length;

  return {
    jsonData: data,
    error,
    loading,
    summary: {
      totalPosts,
      totalSentiments,
      topEmotionKey,
      topEmotionCount,
      totalLanguages,
      totalHashtags,
      totalEmojis,
      totalTopics,
      avgPostPerDay,
    },
  };
}
