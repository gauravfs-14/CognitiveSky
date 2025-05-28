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
import { useSummaryData } from "@/hooks/use-summary-data";

const sentimentLabelMap = {
  label_2: "Positive",
  label_0: "Negative",
  label_1: "Neutral",
} as const;

export default function NarrativeDistributionBar({
  narrative = "narratives",
}: {
  narrative?: "languages" | "emotions" | "narratives";
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
  if (!jsonData || !jsonData.narratives) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No activity data available</p>
      </div>
    );
  }

  const chartData = Object.entries(jsonData.narratives[narrative])
    .sort((a, b) => {
      const aPosts = a[1] as number;
      const bPosts = b[1] as number;
      return bPosts - aPosts; // Sort in descending order
    })
    .slice(0, 7)
    .map(([label, posts]) => ({
      label:
        narrative === "narratives"
          ? sentimentLabelMap[label as keyof typeof sentimentLabelMap]
          : label,
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
              fill={
                narrative == "narratives"
                  ? "var(--chart-2)"
                  : narrative == "emotions"
                  ? "var(--chart-3)"
                  : "var(--chart-4)"
              }
              fillOpacity={0.4}
              stroke={
                narrative == "narratives"
                  ? "var(--chart-2)"
                  : narrative == "emotions"
                  ? "var(--chart-3)"
                  : "var(--chart-4)"
              }
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
}
