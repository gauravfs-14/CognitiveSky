"use client";

import { BarChart2 } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { useChartData } from "@/hooks/use-chart-data";
import { MultiLineTimeSeries } from "@/components/charts/multi-line-time-series";
import { StackedAreaChart } from "@/components/charts/stacked-area-chart";
import NarrativeDistributionBar from "@/components/charts/narrative-distribution-bar";
import { WordCloud } from "@/components/charts/word-cloud";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SentimentPage() {
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

  // Prepare emoji sentiment data
  const emojiSentimentData = chartData?.emojiSentimentBars
    ? Object.fromEntries(
        Object.entries(chartData.emojiSentimentBars).map(([key, items]) => [
          key,
          items?.map((item) => ({
            text: item.name,
            value: item.value,
          })) || [],
        ])
      )
    : { positive: [], negative: [], neutral: [] };

  // Prepare data for topic sentiment
  const topicSentimentData =
    chartData?.topicsOverview?.map((topic) => ({
      name: topic.label.join(", "),
      positive: topic.sentiment.find((s) => s.name === "positive")?.value || 0,
      neutral: topic.sentiment.find((s) => s.name === "neutral")?.value || 0,
      negative: topic.sentiment.find((s) => s.name === "negative")?.value || 0,
    })) || [];

  return (
    <>
      <PageTitle
        title="Sentiment Analysis"
        description="Detailed sentiment analysis of mental health discussions"
        icon={<BarChart2 size={28} />}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
      >
        {/* Sentiment Over Time */}
        <motion.div
          variants={item}
          className="col-span-1 sm:col-span-2 xl:col-span-3"
        >
          <StackedAreaChart
            data={chartData?.sentimentTimeSeries || []}
            title="Sentiment Evolution"
            description="How sentiment has changed over time"
            keys={sentimentTimeSeriesKeys}
            height={400}
          />
        </motion.div>

        {/* Sentiment Distribution */}
        <motion.div
          variants={item}
          className="col-span-1 sm:col-span-2 xl:col-span-1"
        >
          <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Overall Sentiment Distribution</CardTitle>
              <CardDescription>
                Distribution of sentiment in mental health discussions
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] relative">
              <NarrativeDistributionBar type="sentiment" maxItems={10} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Emotion Over Time */}
        <motion.div
          variants={item}
          className="col-span-1 md:col-span-2 xl:col-span-2"
        >
          <MultiLineTimeSeries
            data={chartData?.emotionTimeSeries || []}
            title="Emotion Trends"
            description="Tracking emotions over time"
            keys={emotionTimeSeriesKeys}
            height={400}
          />
        </motion.div>

        {/* Sentiment by Topics */}
        <motion.div
          variants={item}
          className="col-span-1 md:col-span-2 xl:col-span-3"
        >
          <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Sentiment by Topic</CardTitle>
              <CardDescription>
                How sentiment is distributed across different topics
              </CardDescription>
            </CardHeader>
            {/* Fix type issue for sentiment progress bar layout */}
            <CardContent className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topicSentimentData.map((topic, index) => (
                  <div
                    key={index}
                    className="bg-white/50 p-4 rounded-lg border border-sky-100"
                  >
                    <h3 className="font-semibold text-lg mb-3 truncate">
                      {topic.name}
                    </h3>
                    <div className="space-y-2">
                      {["positive", "neutral", "negative"].map((sentiment) => {
                        const color =
                          sentiment === "positive"
                            ? "bg-green-500"
                            : sentiment === "negative"
                            ? "bg-red-500"
                            : "bg-blue-500";

                        const sentimentValue =
                          sentiment === "positive"
                            ? topic.positive
                            : sentiment === "negative"
                            ? topic.negative
                            : topic.neutral;

                        return (
                          <div
                            key={sentiment}
                            className="flex items-center space-x-2"
                          >
                            <span className="text-xs font-medium capitalize w-16">
                              {sentiment}
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-4">
                              <div
                                className={`${color} h-4 rounded-full`}
                                style={{
                                  width: `${
                                    (sentimentValue /
                                      Math.max(
                                        topic.positive,
                                        topic.neutral,
                                        topic.negative
                                      )) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">
                              {sentimentValue} posts
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emoji Sentiment */}
        <motion.div
          variants={item}
          className="col-span-1 md:col-span-2 xl:col-span-1"
        >
          <WordCloud
            words={emojiSentimentData.positive}
            title="Positive Sentiment Emojis"
            description="Emojis associated with positive sentiment"
          />
        </motion.div>

        <motion.div
          variants={item}
          className="col-span-1 md:col-span-2 xl:col-span-1"
        >
          <WordCloud
            words={emojiSentimentData.neutral}
            title="Neutral Sentiment Emojis"
            description="Emojis associated with neutral sentiment"
          />
        </motion.div>

        <motion.div
          variants={item}
          className="col-span-1 md:col-span-2 xl:col-span-1"
        >
          <WordCloud
            words={emojiSentimentData.negative}
            title="Negative Sentiment Emojis"
            description="Emojis associated with negative sentiment"
          />
        </motion.div>
      </motion.div>
    </>
  );
}
