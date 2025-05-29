"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useChartData } from "@/hooks/use-chart-data";

const sentimentLabelMap: {
  [key: string]: string;
  label_0: "Negative";
  label_1: "Neutral";
  label_2: "Positive";
} = {
  label_0: "Negative",
  label_1: "Neutral",
  label_2: "Positive",
};

export default function NarrativeDistributionBar({
  type = "language",
  maxItems = 5,
}: {
  type?: "language" | "sentiment" | "emotions" | "emoji" | "hashtags";
  maxItems?: number;
}) {
  const { chartData: jsonData, loading, error } = useChartData();

  // console.log("Chart Data:", jsonData);

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      </>
    );
  }
  if (error) {
    return (
      <>
        <div className="flex items-center justify-center h-full">
          <p>Error loading data</p>
        </div>
      </>
    );
  }
  if (
    !jsonData ||
    !jsonData.languageOverall ||
    !jsonData.sentimentOverall ||
    !jsonData.emotionOverall ||
    !jsonData.emojiOverall ||
    !jsonData.hashtagOverall
  ) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No activity data available</p>
      </div>
    );
  }

  const overall_data = {
    language: jsonData.languageOverall,
    sentiment: jsonData.sentimentOverall,
    emotions: jsonData.emotionOverall,
    emoji: jsonData.emojiOverall,
    hashtags: jsonData.hashtagOverall,
  };

  const colors = {
    language: "var(--chart-1)",
    sentiment: "var(--chart-2)",
    emotions: "var(--chart-3)",
    emoji: "var(--chart-4)",
    hashtags: "var(--chart-5)",
  };

  const chartData = overall_data[type]
    .map((item) => {
      if (type === "sentiment") {
        return {
          label: sentimentLabelMap[item.name] || item.name,
          posts: item.value,
        };
      }
      return {
        label: item.name,
        posts: item.value,
      };
    })
    .sort((a, b) => b.posts - a.posts)
    .slice(0, maxItems);

  // console.log("Chart Data:", chartData);

  const chartConfig = {
    posts: {
      label: "Posts",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={0}
              tickFormatter={(value) => value}
              angle={-45} // Tilt the labels by -45 degrees
              textAnchor="end" // Align the text to the end
              height={60} // Increase height to prevent label cutoff
            />
            <YAxis
              dataKey="posts"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
              domain={[0, "dataMax + 10"]}
              allowDecimals={false}
              tickCount={5}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="posts"
              type="natural"
              fill={colors[type]}
              fillOpacity={0.4}
              stroke={colors[type]}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
}
