"use client";
import {
  Line,
  LineChart,
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
import { useSummaryData } from "@/hooks/use-summary-data";

export default function HashtagEmojiDistribution({
  type = "hashtags",
}: {
  type?: "emojis" | "hashtags";
}) {
  const { jsonData, loading, error } = useSummaryData();

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
  if (!jsonData || !jsonData.hashtags) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No activity data available</p>
      </div>
    );
  }

  const chartData = Object.entries(jsonData.hashtags[type])
    .sort((a, b) => {
      const aPosts = a[1] as number;
      const bPosts = b[1] as number;
      return bPosts - aPosts; // Sort in descending order
    })
    .slice(0, 15)
    .map(([label, posts]) => ({
      label,
      posts,
    }));

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
          <LineChart accessibilityLayer data={chartData}>
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
              domain={[0, "dataMax + 2"]}
              allowDecimals={false}
              tickCount={5}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="posts"
              type="natural"
              fill={type == "hashtags" ? "var(--chart-5)" : "var(--chart-1)"}
              fillOpacity={0.4}
              stroke={type == "hashtags" ? "var(--chart-5)" : "var(--chart-1)"}
            />
          </LineChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
}
