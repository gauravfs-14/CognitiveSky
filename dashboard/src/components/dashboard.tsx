"use client";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import QuickStatsCards from "./quick-stats";
import TimelinePostVolumeChart from "./charts/timeline-post-volume";
import NarrativeDistributionBar from "./charts/narrative-distribution-bar";
import { MultiLineTimeSeries } from "./charts/multi-line-time-series";
import { StackedAreaChart } from "./charts/stacked-area-chart";
import { WordCloud } from "./charts/word-cloud";
import { useChartData } from "@/hooks/use-chart-data";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Dashboard() {
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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
    >
      <motion.div
        variants={item}
        className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-wrap gap-4"
      >
        <QuickStatsCards />
      </motion.div>

      {/* Post Volume Chart */}
      <motion.div
        variants={item}
        className="col-span-1 md:col-span-2 xl:col-span-3"
      >
        <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Post Volume Timeline</CardTitle>
              <CardDescription>
                Mental health-related post activity over time
              </CardDescription>
            </div>
            <Link
              href="/timeline"
              className="text-sky-600 hover:text-sky-800 text-sm flex items-center"
            >
              View details <ArrowRight size={14} className="ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="h-[400px] relative">
            <div className="h-full w-full">
              <TimelinePostVolumeChart />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sentiment Analysis */}
      <motion.div variants={item} className="col-span-1 md:col-span-2">
        <StackedAreaChart
          data={chartData?.sentimentTimeSeries || []}
          title="Sentiment Trends"
          description="Evolution of sentiment over time"
          keys={sentimentTimeSeriesKeys}
        />
      </motion.div>

      {/* Sentiment Distribution Bar */}
      <motion.div variants={item} className="col-span-1">
        <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sentiment Distribution</CardTitle>
              <CardDescription>
                Distribution of positive, neutral, and negative sentiment
              </CardDescription>
            </div>
            <Link
              href="/sentiment"
              className="text-sky-600 hover:text-sky-800 text-sm flex items-center"
            >
              View details <ArrowRight size={14} className="ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="h-[400px] relative">
            <div className="h-full w-full flex items-center justify-center text-gray-500">
              <NarrativeDistributionBar type="sentiment" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Emotion Time Series */}
      <motion.div variants={item} className="col-span-1 md:col-span-2">
        <MultiLineTimeSeries
          data={chartData?.emotionTimeSeries || []}
          title="Emotion Trends"
          description="Evolution of emotions over time"
          keys={emotionTimeSeriesKeys}
        />
      </motion.div>

      {/* Emotion Distribution */}
      <motion.div variants={item} className="col-span-1">
        <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Emotion Distribution</CardTitle>
              <CardDescription>
                Distribution of emotions in mental health posts
              </CardDescription>
            </div>
            <Link
              href="/sentiment"
              className="text-sky-600 hover:text-sky-800 text-sm flex items-center"
            >
              View details <ArrowRight size={14} className="ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="h-[400px] relative">
            <div className="h-full w-full flex items-center justify-center text-gray-500">
              <NarrativeDistributionBar type="emotions" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Language Distribution */}
      <motion.div variants={item} className="col-span-1">
        <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>Language Distribution</CardTitle>
            <CardDescription>
              Breakdown of languages used in mental health posts
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] relative">
            <div className="h-full w-full flex items-center justify-center text-gray-500">
              <NarrativeDistributionBar type="language" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Hashtag Word Cloud */}
      <motion.div variants={item} className="col-span-1">
        <WordCloud
          words={hashtagWordCloudData}
          title="Popular Hashtags"
          description="Most frequently used hashtags in mental health discussions"
        />
      </motion.div>

      {/* Emoji Word Cloud */}
      <motion.div variants={item} className="col-span-1">
        <WordCloud
          words={emojiWordCloudData}
          title="Popular Emojis"
          description="Most frequently used emojis in mental health discussions"
        />
      </motion.div>

      {/* Topic Distribution */}
      <motion.div variants={item} className="col-span-1 md:col-span-3">
        <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Topic Clusters Overview</CardTitle>
              <CardDescription>
                Key topics identified in mental health discussions
              </CardDescription>
            </div>
            <Link
              href="/topics"
              className="text-sky-600 hover:text-sky-800 text-sm flex items-center"
            >
              View details <ArrowRight size={14} className="ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {chartData?.topicsOverview?.map((topic) => (
                <div
                  key={topic.topic}
                  className="bg-white/50 p-4 rounded-lg border border-sky-100"
                >
                  <h3 className="font-semibold text-lg mb-2">
                    {topic.label.join(", ")}
                  </h3>
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">{topic.count}</span> posts
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Top sentiment:{" "}
                    {topic.sentiment.sort((a, b) => b.value - a.value)[0]?.name}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {topic.hashtags.slice(0, 3).map((hashtag) => (
                      <span
                        key={hashtag}
                        className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-full"
                      >
                        {hashtag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
