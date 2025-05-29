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

  // Define a rotating list of 10 colors for all categories
  const colorPalette = [
    "#4ade80", // green
    "#60a5fa", // blue
    "#f87171", // red
    "#fbbf24", // yellow
    "#818cf8", // indigo
    "#fb7185", // rose
    "#94a3b8", // slate
    "#a855f7", // purple
    "#14b8a6", // teal
    "#f472b6", // pink
  ];

  // Dynamically prepare sentiment time series keys from data
  const sentimentTimeSeriesKeys = chartData?.sentimentTimeSeries?.length
    ? Array.from(
        new Set(
          chartData.sentimentTimeSeries.flatMap((item) =>
            Object.keys(item).filter(
              (key) => key !== "date" && key !== "timestamp"
            )
          )
        )
      ).map((key, index) => ({
        key,
        color: colorPalette[index % colorPalette.length],
        name: key.charAt(0).toUpperCase() + key.slice(1),
      }))
    : [
        { key: "positive", color: colorPalette[0], name: "Positive" },
        { key: "neutral", color: colorPalette[1], name: "Neutral" },
        { key: "negative", color: colorPalette[2], name: "Negative" },
      ];

  // Dynamically prepare emotion time series keys from data
  const emotionTimeSeriesKeys = chartData?.emotionTimeSeries?.length
    ? Array.from(
        new Set(
          chartData.emotionTimeSeries.flatMap((item) =>
            Object.keys(item).filter(
              (key) => key !== "date" && key !== "timestamp"
            )
          )
        )
      ).map((key, index) => ({
        key,
        color: colorPalette[index % colorPalette.length],
        name: key.charAt(0).toUpperCase() + key.slice(1),
      }))
    : [
        { key: "joy", color: colorPalette[0], name: "Joy" },
        { key: "sadness", color: colorPalette[1], name: "Sadness" },
        { key: "fear", color: colorPalette[2], name: "Fear" },
        { key: "neutral", color: colorPalette[3], name: "Neutral" },
      ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
    >
      <motion.div
        variants={item}
        className="col-span-1 sm:col-span-2 xl:col-span-3 flex flex-wrap gap-3 sm:gap-4"
      >
        <QuickStatsCards />
      </motion.div>

      {/* Post Volume Chart */}
      <motion.div
        variants={item}
        className="col-span-1 sm:col-span-2 xl:col-span-3"
      >
        <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg">
                Post Volume Timeline
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Mental health-related post activity over time
              </CardDescription>
            </div>
            <Link
              href="/timeline"
              className="text-sky-600 hover:text-sky-800 text-xs sm:text-sm flex items-center whitespace-nowrap"
            >
              View details <ArrowRight size={14} className="ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="h-[300px] sm:h-[350px] md:h-[400px] relative p-2 sm:p-4">
            <div className="h-full w-full">
              <TimelinePostVolumeChart />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sentiment Analysis */}
      <motion.div variants={item} className="col-span-1 sm:col-span-2">
        <StackedAreaChart
          data={chartData?.sentimentTimeSeries || []}
          title="Sentiment Trends"
          description="Evolution of sentiment over time"
          keys={sentimentTimeSeriesKeys}
        />
      </motion.div>

      {/* Sentiment Distribution Bar */}
      <motion.div
        variants={item}
        className="col-span-1 sm:col-span-2 xl:col-span-1"
      >
        <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg">
                Sentiment Distribution
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Distribution of positive, neutral, and negative sentiment
              </CardDescription>
            </div>
            <Link
              href="/sentiment"
              className="text-sky-600 hover:text-sky-800 text-xs sm:text-sm flex items-center whitespace-nowrap"
            >
              View details <ArrowRight size={14} className="ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px] md:h-[400px] relative p-2 sm:p-4">
            <div className="h-full w-full flex items-center justify-center text-gray-500">
              <NarrativeDistributionBar type="sentiment" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Emotion Time Series */}
      <motion.div variants={item} className="col-span-1 sm:col-span-2">
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
          <CardHeader className="pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg">
                Emotion Distribution
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Distribution of emotions in mental health posts
              </CardDescription>
            </div>
            <Link
              href="/sentiment"
              className="text-sky-600 hover:text-sky-800 text-xs sm:text-sm flex items-center whitespace-nowrap"
            >
              View details <ArrowRight size={14} className="ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px] md:h-[400px] relative p-2 sm:p-4">
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
            <CardTitle className="text-base sm:text-lg">
              Language Distribution
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Breakdown of languages used in mental health posts
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px] md:h-[400px] relative p-2 sm:p-4">
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
      <motion.div
        variants={item}
        className="col-span-1 sm:col-span-2 xl:col-span-3"
      >
        <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg">
                Topic Clusters Overview
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Key topics identified in mental health discussions
              </CardDescription>
            </div>
            <Link
              href="/topics"
              className="text-sky-600 hover:text-sky-800 text-xs sm:text-sm flex items-center whitespace-nowrap"
            >
              View details <ArrowRight size={14} className="ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {chartData?.topicsOverview?.map((topic) => (
                <div
                  key={topic.topic}
                  className="bg-white/50 p-3 sm:p-4 rounded-lg border border-sky-100"
                >
                  <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-1">
                    {topic.label.join(", ")}
                  </h3>
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">
                    <span className="font-medium">{topic.count}</span> posts
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-3">
                    Top sentiment:{" "}
                    {topic.sentiment.sort((a, b) => b.value - a.value)[0]?.name}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {topic.hashtags.slice(0, 3).map((hashtag) => (
                      <span
                        key={hashtag}
                        className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-full truncate max-w-full"
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
