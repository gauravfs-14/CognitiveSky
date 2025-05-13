"use client"
import { motion } from "framer-motion"
import { SentimentOverview } from "@/components/charts/sentiment-overview"
import { EmotionDistribution } from "@/components/charts/emotion-distribution"
import { TopicMap } from "@/components/charts/topic-map"
import { TimelineChart } from "@/components/charts/timeline-chart"
import { PopularHashtags } from "@/components/charts/popular-hashtags"
import { PopularEmojis } from "@/components/charts/popular-emojis"
import { NetworkGraph } from "@/components/charts/network-graph"
import { LanguageDistribution } from "@/components/charts/language-distribution"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
    >
      <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-3">
        <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>Mental Health Narratives Overview</CardTitle>
            <CardDescription>Visualization of mental health discussions on Bluesky</CardDescription>
          </CardHeader>
          <CardContent>
            <SentimentOverview />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="col-span-1 md:col-span-1">
        <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>Emotion Distribution</CardTitle>
            <CardDescription>Emotional tone of mental health posts</CardDescription>
          </CardHeader>
          <CardContent>
            <EmotionDistribution />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="col-span-1 md:col-span-1">
        <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>Popular Hashtags</CardTitle>
            <CardDescription>Most used hashtags in mental health discussions</CardDescription>
          </CardHeader>
          <CardContent>
            <PopularHashtags />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="col-span-1 md:col-span-1">
        <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>Popular Emojis</CardTitle>
            <CardDescription>Most used emojis in mental health discussions</CardDescription>
          </CardHeader>
          <CardContent>
            <PopularEmojis />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-2">
        <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>Topic Semantic Map</CardTitle>
            <CardDescription>Visualization of topic clusters in mental health discussions</CardDescription>
          </CardHeader>
          <CardContent className="h-[500px] relative">
            <div className="absolute top-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-3 rounded-md text-sm text-gray-600 border border-sky-100 shadow-sm mb-2">
              <p>
                This visualization shows how posts cluster around different mental health topics. Each point represents
                a post, and colors indicate the topic. Similar posts appear closer together.
              </p>
            </div>
            <div className="pt-14 h-full">
              <TopicMap />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="col-span-1 md:col-span-1 lg:col-span-1">
        <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>Language Distribution</CardTitle>
            <CardDescription>Languages used in mental health posts</CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageDistribution />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="col-span-1 md:col-span-3 lg:col-span-3">
        <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>Post Timeline</CardTitle>
            <CardDescription>Mental health posts over time</CardDescription>
          </CardHeader>
          <CardContent>
            <TimelineChart />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="col-span-1 md:col-span-3 lg:col-span-3">
        <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>User Interaction Network</CardTitle>
            <CardDescription>Network of users discussing mental health topics</CardDescription>
          </CardHeader>
          <CardContent className="h-[500px]">
            <NetworkGraph />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
