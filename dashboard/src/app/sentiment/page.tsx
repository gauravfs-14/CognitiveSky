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

  // Prepare emoji sentiment data
  const emojiSentimentData = chartData?.emojiSentimentBars
    ? {
        positive:
          chartData.emojiSentimentBars.positive?.map((item) => ({
            text: item.name,
            value: item.value,
          })) || [],
        negative:
          chartData.emojiSentimentBars.negative?.map((item) => ({
            text: item.name,
            value: item.value,
          })) || [],
        neutral:
          chartData.emojiSentimentBars.neutral?.map((item) => ({
            text: item.name,
            value: item.value,
          })) || [],
      }
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
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mt-6"
      >
        {/* Sentiment Over Time */}
        <motion.div
          variants={item}
          className="col-span-1 md:col-span-2 xl:col-span-3"
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
        <motion.div variants={item} className="col-span-1">
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
        <motion.div variants={item} className="col-span-1 md:col-span-2">
          <MultiLineTimeSeries
            data={chartData?.emotionTimeSeries || []}
            title="Emotion Trends"
            description="Tracking emotions over time"
            keys={emotionTimeSeriesKeys}
            height={400}
          />
        </motion.div>

        {/* Sentiment by Topics */}
        <motion.div variants={item} className="col-span-1 md:col-span-3">
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
        <motion.div variants={item} className="col-span-1">
          <WordCloud
            words={emojiSentimentData.positive}
            title="Positive Sentiment Emojis"
            description="Emojis associated with positive sentiment"
          />
        </motion.div>

        <motion.div variants={item} className="col-span-1">
          <WordCloud
            words={emojiSentimentData.neutral}
            title="Neutral Sentiment Emojis"
            description="Emojis associated with neutral sentiment"
          />
        </motion.div>

        <motion.div variants={item} className="col-span-1">
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
