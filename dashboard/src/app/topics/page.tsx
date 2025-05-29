"use client";

import { Network } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { useChartData } from "@/hooks/use-chart-data";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function TopicsPage() {
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

  if (!chartData?.topicsOverview) {
    return (
      <>
        <PageTitle
          title="Topic Clusters"
          description="Analysis of key topics in mental health discussions"
          icon={<Network size={28} />}
        />
        <div className="p-8 text-center">
          <p>Loading topic data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle
        title="Topic Clusters"
        description="Analysis of key topics in mental health discussions"
        icon={<Network size={28} />}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 md:gap-6 mt-6"
      >
        {/* Topic Overview Cards */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {chartData.topicsOverview.map((topic) => (
            <Card
              key={topic.topic}
              className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md"
            >
              <CardHeader className="pb-2">
                <CardTitle>Topic: {topic.label.join(", ")}</CardTitle>
                <CardDescription>
                  {topic.count} posts related to this topic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Topic trends over time */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Daily Activity</h4>
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <ChartContainer
                          config={{
                            [topic.topic]: {
                              label: "Posts",
                              color: "#3b82f6",
                            },
                          }}
                          className="h-full w-full"
                        >
                          <AreaChart
                            data={topic.daily}
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                          >
                            <Area
                              type="monotone"
                              dataKey={topic.topic}
                              stroke="#3b82f6"
                              fill="#3b82f6"
                              fillOpacity={0.6}
                            />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="line" />}
                            />
                          </AreaChart>
                        </ChartContainer>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{topic.daily[0]?.date}</span>
                      <span>{topic.daily[topic.daily.length - 1]?.date}</span>
                    </div>
                  </div>

                  {/* Sentiment breakdown */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Sentiment</h4>
                    <div className="space-y-2">
                      {topic.sentiment.map((entry, index) => {
                        const color =
                          entry.name === "positive"
                            ? "bg-green-500"
                            : entry.name === "negative"
                            ? "bg-red-500"
                            : "bg-blue-500";

                        return (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <span className="text-xs font-medium capitalize w-16">
                              {entry.name}
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-4">
                              <div
                                className={`${color} h-4 rounded-full`}
                                style={{
                                  width: `${
                                    (entry.value /
                                      Math.max(
                                        ...topic.sentiment.map((s) => s.value)
                                      )) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">
                              {entry.value} posts
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Emotion breakdown */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Emotions</h4>
                    <div className="space-y-2">
                      {topic.emotion.map((entry, index) => {
                        const color =
                          entry.name === "joy"
                            ? "bg-yellow-500"
                            : entry.name === "sadness"
                            ? "bg-purple-500"
                            : entry.name === "fear"
                            ? "bg-pink-500"
                            : "bg-gray-500";

                        return (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <span className="text-xs font-medium capitalize w-16">
                              {entry.name}
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-4">
                              <div
                                className={`${color} h-4 rounded-full`}
                                style={{
                                  width: `${
                                    (entry.value /
                                      Math.max(
                                        ...topic.emotion.map((e) => e.value)
                                      )) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">
                              {entry.value} posts
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top hashtags and emojis */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Top Hashtags</h4>
                      <div className="flex flex-wrap gap-1">
                        {topic.hashtags.map((hashtag) => (
                          <span
                            key={hashtag}
                            className="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full"
                          >
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Top Emojis</h4>
                      <div className="flex flex-wrap gap-1">
                        {topic.emojis.map((emoji) => (
                          <span key={emoji} className="text-base">
                            {emoji}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Detailed Topic Analysis */}
        <motion.div variants={item} className="col-span-1">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Topic Breakdown Analysis</CardTitle>
              <CardDescription>
                Explore topics in detail with sentiment and emotion distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="topic_0">
                <TabsList className="mb-4">
                  {chartData.topicsOverview.map((topic) => (
                    <TabsTrigger key={topic.topic} value={topic.topic}>
                      {topic.label[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {chartData.topicsOverview.map((topic) => (
                  <TabsContent key={topic.topic} value={topic.topic}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">
                          Key Terms
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          {topic.label.map((term, idx) => (
                            <div
                              key={idx}
                              className="bg-sky-50 p-2 rounded-md border border-sky-100 text-center"
                            >
                              {term}
                            </div>
                          ))}
                        </div>

                        <h3 className="text-lg font-semibold mt-6 mb-3">
                          Activity Timeline
                        </h3>
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <ChartContainer
                              config={{
                                value: {
                                  label: "Posts",
                                },
                              }}
                              className="h-full w-full"
                            >
                              <AreaChart
                                data={topic.daily}
                                margin={{
                                  top: 5,
                                  right: 5,
                                  bottom: 5,
                                  left: 5,
                                }}
                              >
                                <XAxis
                                  dataKey="date"
                                  tick={{ fontSize: 12 }}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis hide />
                                <ChartTooltip
                                  content={
                                    <ChartTooltipContent indicator="line" />
                                  }
                                />
                                <Area
                                  type="monotone"
                                  dataKey={topic.topic}
                                  stroke="#3b82f6"
                                  fill="#3b82f6"
                                  fillOpacity={0.6}
                                />
                              </AreaChart>
                            </ChartContainer>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{topic.daily[0]?.date}</span>
                          <span>
                            {topic.daily[topic.daily.length - 1]?.date}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">
                          Sentiment Analysis
                        </h3>
                        <div className="space-y-2">
                          {topic.sentiment.map((entry, index) => {
                            const color =
                              entry.name === "positive"
                                ? "bg-green-500"
                                : entry.name === "negative"
                                ? "bg-red-500"
                                : "bg-blue-500";

                            return (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <span className="text-xs font-medium capitalize w-16">
                                  {entry.name}
                                </span>
                                <div className="flex-1 bg-gray-200 rounded-full h-4">
                                  <div
                                    className={`${color} h-4 rounded-full`}
                                    style={{
                                      width: `${
                                        (entry.value /
                                          Math.max(
                                            ...topic.sentiment.map(
                                              (s) => s.value
                                            )
                                          )) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium">
                                  {entry.value} posts
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Emotion Analysis */}
                        <div>
                          <h3 className="text-lg font-semibold mt-6 mb-3">
                            Emotion Analysis
                          </h3>
                          <div className="space-y-2">
                            {topic.emotion.map((entry, index) => {
                              const color =
                                entry.name === "joy"
                                  ? "bg-yellow-500"
                                  : entry.name === "sadness"
                                  ? "bg-purple-500"
                                  : entry.name === "fear"
                                  ? "bg-pink-500"
                                  : "bg-gray-500";
                              return (
                                <div
                                  key={index}
                                  className="flex items-center space-x-2"
                                >
                                  <span className="text-xs font-medium capitalize w-16">
                                    {entry.name}
                                  </span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                                    <div
                                      className={`${color} h-4 rounded-full`}
                                      style={{
                                        width: `${
                                          (entry.value /
                                            Math.max(
                                              ...topic.emotion.map(
                                                (e) => e.value
                                              )
                                            )) *
                                          100
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-medium">
                                    {entry.value} posts
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}
