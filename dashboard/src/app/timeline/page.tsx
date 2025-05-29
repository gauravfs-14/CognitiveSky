"use client";

import { Clock } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { useChartData } from "@/hooks/use-chart-data";
import { motion } from "framer-motion";
import { MultiLineTimeSeries } from "@/components/charts/multi-line-time-series";
import { StackedAreaChart } from "@/components/charts/stacked-area-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimelinePostVolumeChart from "@/components/charts/timeline-post-volume";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function TimelinePage() {
  const { chartData, loading, error } = useChartData();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Prepare sentiment time series data
  const sentimentTimeSeriesKeys = [
    { key: "positive", color: "#4ade80", name: "Positive" },
    { key: "neutral", color: "#60a5fa", name: "Neutral" },
    { key: "negative", color: "#f87171", name: "Negative" },
  ];

  // Prepare emotion time series data
  const emotionTimeSeriesKeys = [
    { key: "joy", color: "#fbbf24", name: "Joy" },
    { key: "sadness", color: "#818cf8", name: "Sadness" },
    { key: "fear", color: "#fb7185", name: "Fear" },
    { key: "neutral", color: "#94a3b8", name: "Neutral" },
  ];

  // Prepare language time series data
  const languageTimeSeriesKeys = [
    { key: "english", color: "#10b981", name: "English" },
    { key: "spanish", color: "#6366f1", name: "Spanish" },
    { key: "french", color: "#f43f5e", name: "French" },
  ];

  // Prepare topic time series data
  const topicTimeSeriesData = chartData?.topicsOverview
    ? chartData.topicsOverview.map((topic) => {
        return {
          label: topic.label.join(", "),
          data: topic.daily.map((day) => ({
            date: day.date,
            [topic.topic]: day[topic.topic],
          })),
          color:
            topic.topic === "topic_0"
              ? "#0ea5e9"
              : topic.topic === "topic_1"
              ? "#8b5cf6"
              : "#ec4899",
        };
      })
    : [];

  return (
    <>
      <PageTitle
        title="Timeline Analysis"
        description="Temporal analysis of mental health discussions"
        icon={<Clock size={28} />}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mt-6"
      >
        {/* Post Volume Chart */}
        <motion.div variants={item} className="col-span-1 md:col-span-3">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Post Volume Timeline</CardTitle>
              <CardDescription>
                Mental health-related post activity over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <TimelinePostVolumeChart />
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeline Selector */}
        <motion.div variants={item} className="col-span-1 md:col-span-3">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Timeline Analysis</CardTitle>
              <CardDescription>
                Analyze different aspects of mental health discussions over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="sentiment">
                <TabsList className="mb-6">
                  <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                  <TabsTrigger value="emotion">Emotion</TabsTrigger>
                  <TabsTrigger value="language">Language</TabsTrigger>
                  <TabsTrigger value="topics">Topics</TabsTrigger>
                </TabsList>

                <TabsContent value="sentiment">
                  <StackedAreaChart
                    data={chartData?.sentimentTimeSeries || []}
                    title=""
                    keys={sentimentTimeSeriesKeys}
                    noCard
                  />
                </TabsContent>

                <TabsContent value="emotion">
                  <MultiLineTimeSeries
                    data={chartData?.emotionTimeSeries || []}
                    title=""
                    keys={emotionTimeSeriesKeys}
                    noCard
                  />
                </TabsContent>

                <TabsContent value="language">
                  <MultiLineTimeSeries
                    data={chartData?.languageTimeSeries || []}
                    title=""
                    keys={languageTimeSeriesKeys}
                    noCard
                  />
                </TabsContent>

                <TabsContent value="topics">
                  <div className="grid grid-cols-1 gap-6">
                    {topicTimeSeriesData.map((topic, index) => (
                      <div key={index} className="mb-6">
                        <h3 className="font-medium mb-2">{topic.label}</h3>
                        <div className="h-[160px] bg-white rounded-lg">
                          <ResponsiveContainer width="100%" height="100%">
                            <ChartContainer
                              config={{
                                [topic.label]: {
                                  label: "Posts",
                                  color: topic.color,
                                },
                              }}
                              className="h-full w-full"
                            >
                              <AreaChart
                                data={topic.data}
                                margin={{
                                  top: 10,
                                  right: 30,
                                  left: 5,
                                  bottom: 0,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  vertical={false}
                                />
                                <XAxis
                                  dataKey="date"
                                  tick={{ fontSize: 10 }}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis
                                  allowDecimals={false}
                                  tickLine={false}
                                  axisLine={false}
                                  tick={{ fontSize: 10 }}
                                />
                                <ChartTooltip
                                  content={
                                    <ChartTooltipContent indicator="line" />
                                  }
                                />
                                <Area
                                  type="monotone"
                                  dataKey={
                                    Object.keys(topic.data[0] || {}).find(
                                      (k) => k !== "date"
                                    ) || ""
                                  }
                                  stroke={topic.color}
                                  fill={topic.color}
                                  fillOpacity={0.6}
                                />
                              </AreaChart>
                            </ChartContainer>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Activity Summary */}
        <motion.div variants={item} className="col-span-1 md:col-span-3">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Daily Activity Summary</CardTitle>
              <CardDescription>
                Day-by-day breakdown of post activity with key metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Volume
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Positive
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Neutral
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Negative
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Top Language
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Top Emotion
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData?.volumeTimeSeries &&
                      chartData.volumeTimeSeries.map((day, index) => {
                        const sentimentData =
                          chartData.sentimentTimeSeries.find(
                            (d) => d.date === day.date
                          );
                        const emotionData = chartData.emotionTimeSeries.find(
                          (d) => d.date === day.date
                        );
                        const languageData = chartData.languageTimeSeries.find(
                          (d) => d.date === day.date
                        );

                        // Calculate top language and emotion
                        let topLanguage = { name: "N/A", value: 0 };
                        let topEmotion = { name: "N/A", value: 0 };

                        if (languageData) {
                          for (const [key, value] of Object.entries(
                            languageData
                          )) {
                            if (
                              key !== "date" &&
                              (value as number) > topLanguage.value
                            ) {
                              topLanguage = {
                                name: key,
                                value: value as number,
                              };
                            }
                          }
                        }

                        if (emotionData) {
                          for (const [key, value] of Object.entries(
                            emotionData
                          )) {
                            if (
                              key !== "date" &&
                              (value as number) > topEmotion.value
                            ) {
                              topEmotion = {
                                name: key,
                                value: value as number,
                              };
                            }
                          }
                        }

                        return (
                          <tr
                            key={index}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-4 py-3">{day.date}</td>
                            <td className="px-4 py-3 text-right font-medium">
                              {day.volume}
                            </td>
                            <td className="px-4 py-3 text-right text-green-600">
                              {sentimentData?.positive || 0}
                            </td>
                            <td className="px-4 py-3 text-right text-blue-600">
                              {sentimentData?.neutral || 0}
                            </td>
                            <td className="px-4 py-3 text-right text-red-600">
                              {sentimentData?.negative || 0}
                            </td>
                            <td className="px-4 py-3 text-right capitalize">
                              {topLanguage.name}
                            </td>
                            <td className="px-4 py-3 text-right capitalize">
                              {topEmotion.name}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}
