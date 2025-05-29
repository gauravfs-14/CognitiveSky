/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface StackedAreaProps {
  data: Array<{ date: string; [key: string]: any }>;
  title: string;
  description?: string;
  keys: Array<{
    key: string;
    color: string;
    name: string;
  }>;
  height?: number;
}

export const StackedAreaChart = ({
  data,
  title,
  description,
  keys,
  height = 400,
  noCard = false,
}: StackedAreaProps & { noCard?: boolean }) => {
  if (!data || data.length === 0) {
    if (noCard) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          No data available
        </div>
      );
    }
    return (
      <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent style={{ height: `${height}px` }} className="relative">
          <div className="flex items-center justify-center h-full text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart config
  const chartConfig = keys.reduce((acc, { key, color, name }) => {
    acc[key] = {
      label: name,
      color: color,
    };
    return acc;
  }, {} as ChartConfig);

  if (noCard) {
    return (
      <div style={{ height: `${height}px` }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={[0, "dataMax + 10"]}
                allowDecimals={false}
                tickCount={5}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              {keys.map(({ key, color }) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.3}
                  activeDot={{ r: 4 }}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent style={{ height: `${height}px` }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={[0, "dataMax + 10"]}
                allowDecimals={false}
                tickCount={5}
              />
              <ChartTooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={<ChartTooltipContent />}
              />
              <ChartLegend
                content={<ChartLegendContent />}
                verticalAlign="top"
                height={36}
              />
              {keys.map((item) => (
                <Area
                  key={item.key}
                  type="monotone"
                  dataKey={item.key}
                  name={item.name}
                  fill={item.color}
                  stroke={item.color}
                  stackId="1"
                  fillOpacity={0.7}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
