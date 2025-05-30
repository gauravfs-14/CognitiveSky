"use client";
import {
  Area,
  AreaChart,
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

export default function TimelinePostVolumeChart() {
  const { chartData: jsonData, error, loading } = useChartData();

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
    !jsonData.volumeTimeSeries ||
    jsonData.volumeTimeSeries.length === 0
  ) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No activity data available</p>
      </div>
    );
  }

  const chartData = jsonData.volumeTimeSeries.map((item) => ({
    date: item.date,
    posts: item.volume,
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
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 10,
              right: 12,
              left: 12,
              bottom: 30, // Increased bottom margin to accommodate tilted labels
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
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
            <Area
              dataKey="posts"
              type="natural"
              fill="var(--chart-1)"
              fillOpacity={0.4}
              stroke="var(--chart-1)"
            />
          </AreaChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
}
