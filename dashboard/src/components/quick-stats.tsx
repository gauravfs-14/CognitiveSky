import {
  BarChart2,
  MessageCircle,
  Heart,
  Globe,
  Hash,
  Smile,
  Layers,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useChartData } from "@/hooks/use-chart-data";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  desc?: string;
  trend?: number;
  trendLabel?: string;
  highlight?: boolean;
}

const StatCard = ({
  title,
  value,
  icon,
  desc,
  trend,
  trendLabel,
  highlight = false,
}: StatCardProps) => (
  <div
    className={cn(
      "p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1",
      highlight ? "bg-primary/5 border border-primary/20" : "bg-white"
    )}
  >
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>

        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center mt-2 text-xs font-medium",
              trend > 0
                ? "text-green-600"
                : trend < 0
                ? "text-red-600"
                : "text-gray-500"
            )}
          >
            {trend > 0 ? (
              <TrendingUp size={14} className="mr-1" />
            ) : trend < 0 ? (
              <TrendingDown size={14} className="mr-1" />
            ) : null}
            <span>
              {trend > 0 ? "+" : ""}
              {trend}% {trendLabel || ""}
            </span>
          </div>
        )}
      </div>
      <div
        className={cn(
          "p-2 rounded-full",
          highlight ? "bg-primary text-white" : "bg-primary/10 text-primary"
        )}
      >
        {icon}
      </div>
    </div>
    {desc && <div className="mt-3 text-xs text-gray-500">{desc}</div>}
  </div>
);

const StatCardSkeleton = () => (
  <div className="bg-white p-5 rounded-lg shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-24 mt-2" />
      </div>
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
    <Skeleton className="h-3 w-full mt-3" />
  </div>
);

export default function QuickStatsCards() {
  const { chartData, loading, error } = useChartData();
  const summary = chartData?.kpis;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600 border border-red-200">
        <h3 className="font-semibold">Error loading data</h3>
        <p className="text-sm mt-1">{error || "Please try again later"}</p>
      </div>
    );
  }

  // Get sentiment distribution from the sentiment overall data
  const sentimentOverall = chartData?.sentimentOverall || [];
  const positiveData = sentimentOverall.find(
    (item) => item.name === "positive"
  );
  const totalSentiment = sentimentOverall.reduce(
    (sum, item) => sum + item.value,
    0
  );
  const positivePercentage =
    positiveData && totalSentiment > 0
      ? ((positiveData.value / totalSentiment) * 100).toFixed(1)
      : "0";

  // Get the top trending hashtag with its count
  const topHashtag = chartData?.hashtagOverall?.[0];
  const topHashtagName = topHashtag?.name || "N/A";
  const topHashtagCount = topHashtag?.value || 0;

  // Get top language with its percentage
  const topLanguage = chartData?.languageOverall?.[0];
  const topLanguageName = topLanguage?.name || "N/A";
  const topLanguageCount = topLanguage?.value || 0;

  // Get top emotion with its percentage
  const emotionOverall = chartData?.emotionOverall || [];
  const totalEmotions = emotionOverall.reduce(
    (sum, item) => sum + item.value,
    0
  );
  const topEmotion = emotionOverall[0];
  const topEmotionPercentage =
    topEmotion && totalEmotions > 0
      ? ((topEmotion.value / totalEmotions) * 100).toFixed(1)
      : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <StatCard
        title="Total Posts"
        value={summary?.total.total_posts.toLocaleString() || "0"}
        icon={<MessageCircle size={20} />}
        desc="All analyzed social media posts"
        // trend={parseFloat(postGrowth)}
        trendLabel="vs last week"
        // highlight={true}
      />
      <StatCard
        title="Sentiment"
        value={`${positivePercentage}%`}
        icon={<Heart size={20} />}
        desc="Positive sentiment ratio"
        highlight={parseFloat(positivePercentage) > 50}
      />
      <StatCard
        title="Top Emotion"
        value={
          topEmotion?.name?.charAt(0).toUpperCase() +
            topEmotion?.name?.slice(1) || "N/A"
        }
        icon={<Smile size={20} />}
        desc={`${topEmotionPercentage}% of all detected emotions`}
        highlight={
          topEmotion?.name === "joy" || topEmotion?.name === "happiness"
        }
      />
      <StatCard
        title="Weekly Posts"
        value={summary?.lastWeek.total_posts.toLocaleString() || "0"}
        icon={<Calendar size={20} />}
        desc="Total posts from last week"
      />
      <StatCard
        title="Top Hashtag"
        value={`${topHashtagName}`}
        icon={<Hash size={20} />}
        desc={`${topHashtagCount.toLocaleString()} mentions`}
      />
      <StatCard
        title="Main Language"
        value={topLanguageName.toUpperCase()}
        icon={<Globe size={20} />}
        desc={`${topLanguageCount} times used`}
      />
      <StatCard
        title="Daily Activity"
        value={summary?.averages.avg_posts_per_day.toFixed(1) || "0"}
        icon={<BarChart2 size={20} />}
        desc="Average posts per day"
      />
      <StatCard
        title="Topics"
        value={summary?.total.total_topics.toLocaleString() || "0"}
        icon={<Layers size={20} />}
        desc={`Most discussed: ${summary?.top?.sentiment || "N/A"}`}
      />
    </div>
  );
}
