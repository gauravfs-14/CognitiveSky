import { useSummaryData } from "@/hooks/use-summary-data";
import {
  BarChart2,
  MessageCircle,
  Heart,
  Globe,
  Hash,
  Smile,
  Layers,
  Calendar,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  desc?: string;
}

const StatCard = ({ title, value, icon, desc }: StatCardProps) => (
  <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
      </div>
      <div className="p-2 bg-primary/10 rounded-full text-primary">{icon}</div>
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
      </div>
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  </div>
);

export default function QuickStatsCards() {
  const { error, loading, summary, jsonData } = useSummaryData();

  console.log("JSON Data:", jsonData);

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

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
      <StatCard
        title="Total Posts"
        value={summary.totalPosts?.toLocaleString() || "0"}
        icon={<MessageCircle size={20} />}
        desc="Total number of posts analyzed"
      />
      <StatCard
        title="Total Sentiments"
        value={summary.totalSentiments?.toLocaleString() || "0"}
        icon={<Heart size={20} />}
        desc="Total sentiment classifications made"
      />
      <StatCard
        title="Top Emotion"
        value={`${summary.topEmotionKey} (${summary.topEmotionCount})`}
        icon={<BarChart2 size={20} />}
        desc="Most common emotion detected"
      />
      <StatCard
        title="Total Languages"
        value={summary.totalLanguages?.toLocaleString() || "0"}
        icon={<Globe size={20} />}
        desc="Number of unique languages detected"
      />
      <StatCard
        title="Total Hashtags"
        value={summary.totalHashtags?.toLocaleString() || "0"}
        icon={<Hash size={20} />}
        desc="Total number of hashtags found"
      />
      <StatCard
        title="Total Emojis"
        value={summary.totalEmojis?.toLocaleString() || "0"}
        icon={<Smile size={20} />}
        desc="Total number of emojis used"
      />
      <StatCard
        title="Total Topics"
        value={summary.totalTopics?.toLocaleString() || "0"}
        icon={<Layers size={20} />}
        desc="Number of unique topics detected"
      />
      <StatCard
        title="Avg Posts/Day"
        value={summary.avgPostPerDay?.toFixed(2) || "0"}
        icon={<Calendar size={20} />}
        desc="Average posts analyzed per day"
      />
    </div>
  );
}
