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

export default function Dashboard() {
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
        {/* TODO: Fix and display more relevant informations */}
        <QuickStatsCards />
      </motion.div>

      <motion.div
        variants={item}
        className="col-span-1 md:col-span-2 xl:col-span-3"
      >
        <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>Timeline of Post Volume </CardTitle>
            <CardDescription>
              Tracks mental health-related post activity over last 10 items.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] relative">
            <div className="h-full w-full">
              <TimelinePostVolumeChart />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <>
        <motion.div variants={item} className="col-span-1">
          <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Language Distribution</CardTitle>
              <CardDescription>
                Breakdown of languages used in posts.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] relative">
              {/* Placeholder for future chart */}
              <div className="h-full w-full flex items-center justify-center text-gray-500">
                <NarrativeDistributionBar type="language" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item} className="col-span-1">
          <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Emotion Distribution</CardTitle>
              <CardDescription>
                Distribution of emotions like joy, sadness, anger, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] relative">
              {/* Placeholder for future chart */}
              <div className="h-full w-full flex items-center justify-center text-gray-500">
                <NarrativeDistributionBar type="emotions" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item} className="col-span-1">
          <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Sentiment Distribution</CardTitle>
              <CardDescription>
                Proportion of posts labeled positive, neutral, negative.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] relative">
              {/* Placeholder for future chart */}
              <div className="h-full w-full flex items-center justify-center text-gray-500">
                <NarrativeDistributionBar type="sentiment" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </>

      <div className="col-span-1 md:col-span-2 xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={item} className="col-span-1">
          <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Hashtag Distribution</CardTitle>
              <CardDescription>
                Top hashtags used in mental health posts.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] relative">
              {/* Placeholder for future chart */}
              <div className="h-full w-full flex items-center justify-center text-gray-500">
                <NarrativeDistributionBar type="hashtags" maxItems={10} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item} className="col-span-1">
          <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Emoji Usage</CardTitle>
              <CardDescription>
                Most common emojis used in mental health posts.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] relative">
              {/* Placeholder for future chart */}
              <div className="h-full w-full flex items-center justify-center text-gray-500">
                <NarrativeDistributionBar type="emoji" maxItems={10} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
