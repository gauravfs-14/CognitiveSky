"use client";

import { Hash } from "lucide-react";
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
import NarrativeDistributionBar from "@/components/charts/narrative-distribution-bar";
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
import VisxWordCloud from "@/components/charts/visx-wordcloud";

export default function HashtagsEmojiPage() {
  const { chartData } = useChartData();

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

  // Prepare hashtag word cloud data
  const hashtagWordCloudData = chartData?.hashtagOverall
    ? chartData.hashtagOverall.map((item) => ({
        text: item.name,
        value: item.value,
      }))
    : [];

  // Prepare emoji word cloud data
  const emojiWordCloudData = chartData?.emojiOverall
    ? chartData.emojiOverall.map((item) => ({
        text: item.name,
        value: item.value,
      }))
    : [];

  // Prepare network graph data
  const hashtagNetworkData = chartData?.hashtagGraph
    ? {
        nodes: Array.from(
          new Set([
            ...chartData.hashtagGraph.map((link) => link.source),
            ...chartData.hashtagGraph.map((link) => link.target),
          ])
        ).map((hashtag, index) => ({
          id: hashtag as string,
          group: (index % 5) + 1,
          value:
            chartData.hashtagOverall.find((h) => h.name === hashtag)?.value ||
            10,
        })),
        links: chartData.hashtagGraph.map((link) => ({
          source: link.source,
          target: link.target,
          value: link.weight,
        })),
      }
    : { nodes: [], links: [] };

  // Process time series data for hashtags
  const hashtagTimeSeriesData = chartData?.hashtagTimeSeries || [];

  // Get top 5 hashtags
  const topHashtags = chartData?.hashtagOverall
    ? chartData.hashtagOverall.slice(0, 5).map((item) => item.name)
    : [];

  return (
    <>
      <PageTitle
        title="Hashtags & Emojis"
        description="Analysis of hashtags and emojis used in mental health discussions"
        icon={<Hash size={28} />}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mt-6"
      >
        {/* Hashtag and Emoji Overview */}
        <motion.div
          variants={item}
          className="col-span-1 md:col-span-2 xl:col-span-3"
        >
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Hashtags & Emojis Overview</CardTitle>
              <CardDescription>
                Visual analysis of hashtags and emojis in mental health
                conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="hashtags">
                <TabsList className="mb-6">
                  <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
                  <TabsTrigger value="emojis">Emojis</TabsTrigger>
                </TabsList>

                <TabsContent value="hashtags">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Top Hashtags
                      </h3>
                      <div className="h-[400px]">
                        <NarrativeDistributionBar
                          type="hashtags"
                          maxItems={10}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Hashtag Word Cloud
                      </h3>
                      <div className="h-[400px] bg-gray-50 rounded-lg p-4">
                        <div className="h-full w-full">
                          <VisxWordCloud words={hashtagWordCloudData} />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="emojis">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Top Emojis</h3>
                      <div className="h-[400px]">
                        <NarrativeDistributionBar type="emoji" maxItems={10} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Emoji Word Cloud
                      </h3>
                      <div className="h-[400px] bg-gray-50 rounded-lg p-4">
                        <div className="h-full w-full">
                          <VisxWordCloud words={emojiWordCloudData} />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hashtag Network Graph
        <motion.div variants={item} className="col-span-1 md:col-span-3">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Hashtag Relationships</CardTitle>
              <CardDescription>
                Network graph showing relationships between hashtags
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <NetworkGraph
                nodes={hashtagNetworkData.nodes}
                links={hashtagNetworkData.links}
                title=""
                height={480}
              />
            </CardContent>
          </Card>
        </motion.div> */}

        {/* Hashtag Time Series */}
        <motion.div variants={item} className="col-span-1 md:col-span-3">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Hashtag Trends Over Time</CardTitle>
              <CardDescription>
                Timeline showing usage of top hashtags
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full">
                {hashtagTimeSeriesData.length > 0 && (
                  <Tabs defaultValue={topHashtags[0]}>
                    <TabsList className="mb-4">
                      {topHashtags.map((hashtag, index) => (
                        <TabsTrigger key={index} value={hashtag}>
                          {hashtag}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {topHashtags.map((hashtag, index) => (
                      <TabsContent
                        key={index}
                        value={hashtag}
                        className="h-[320px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <ChartContainer
                            config={{
                              [hashtag]: {
                                label: hashtag,
                                color: "#3b82f6",
                              },
                            }}
                            className="h-full w-full"
                          >
                            <AreaChart
                              data={hashtagTimeSeriesData}
                              margin={{
                                top: 10,
                                right: 30,
                                left: 10,
                                bottom: 30,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="date"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis
                                allowDecimals={false}
                                tickLine={false}
                                axisLine={false}
                              />
                              <ChartTooltip
                                cursor={false}
                                content={
                                  <ChartTooltipContent indicator="line" />
                                }
                              />
                              <Area
                                type="monotone"
                                dataKey={hashtag}
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.6}
                              />
                            </AreaChart>
                          </ChartContainer>
                        </ResponsiveContainer>
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emoji Time Series */}
        <motion.div variants={item} className="col-span-1 md:col-span-3">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Emoji Trends Over Time</CardTitle>
              <CardDescription>
                Timeline showing usage of top emojis
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full">
                {chartData?.emojiTimeSeries &&
                  chartData.emojiTimeSeries.length > 0 && (
                    <Tabs defaultValue={chartData.emojiOverall[0]?.name}>
                      <TabsList className="mb-4">
                        {chartData.emojiOverall
                          .slice(0, 5)
                          .map((emoji, index) => (
                            <TabsTrigger key={index} value={emoji.name}>
                              <span className="text-xl mr-1">{emoji.name}</span>
                            </TabsTrigger>
                          ))}
                      </TabsList>

                      {chartData.emojiOverall
                        .slice(0, 5)
                        .map((emoji, index) => (
                          <TabsContent
                            key={index}
                            value={emoji.name}
                            className="h-[320px]"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <ChartContainer
                                config={{
                                  [emoji.name]: {
                                    label: emoji.name,
                                    color: "#f59e0b",
                                  },
                                }}
                                className="h-full w-full"
                              >
                                <AreaChart
                                  data={chartData.emojiTimeSeries}
                                  margin={{
                                    top: 10,
                                    right: 30,
                                    left: 10,
                                    bottom: 30,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                  />
                                  <XAxis
                                    dataKey="date"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    tickLine={false}
                                    axisLine={false}
                                  />
                                  <YAxis
                                    allowDecimals={false}
                                    tickLine={false}
                                    axisLine={false}
                                  />
                                  <ChartTooltip
                                    cursor={false}
                                    content={
                                      <ChartTooltipContent indicator="line" />
                                    }
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey={emoji.name}
                                    stroke="#f59e0b"
                                    fill="#f59e0b"
                                    fillOpacity={0.6}
                                  />
                                </AreaChart>
                              </ChartContainer>
                            </ResponsiveContainer>
                          </TabsContent>
                        ))}
                    </Tabs>
                  )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}
