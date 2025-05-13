"use client"

import { motion } from "framer-motion"
import { BarChart2 } from "lucide-react"
import { PageTitle } from "@/components/page-title"
import { SentimentOverview } from "@/components/charts/sentiment-overview"
import { EmotionDistribution } from "@/components/charts/emotion-distribution"
import { SentimentOverTime } from "@/components/charts/sentiment-over-time"
import { SentimentByTopic } from "@/components/charts/sentiment-by-topic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SentimentPage() {
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
    <>
      <PageTitle
        title="Sentiment Analysis"
        description="Analyze the emotional tone of mental health discussions"
        icon={<BarChart2 size={28} />}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <motion.div variants={item} className="col-span-1 md:col-span-2">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Sentiment Distribution</CardTitle>
              <CardDescription>Overall sentiment in mental health posts</CardDescription>
            </CardHeader>
            <CardContent>
              <SentimentOverview />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-1">
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

        <motion.div variants={item} className="col-span-1">
          <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Sentiment Over Time</CardTitle>
              <CardDescription>How sentiment has changed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <SentimentOverTime />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-1 md:col-span-2">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Sentiment by Topic</CardTitle>
              <CardDescription>How sentiment varies across different topics</CardDescription>
            </CardHeader>
            <CardContent>
              <SentimentByTopic />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  )
}
