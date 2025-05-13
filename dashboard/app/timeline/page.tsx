"use client"

import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import { PageTitle } from "@/components/page-title"
import { TimelineChart } from "@/components/charts/timeline-chart"
import { WeeklyPatterns } from "@/components/charts/weekly-patterns"
import { DailyPatterns } from "@/components/charts/daily-patterns"
import { TopicEvolution } from "@/components/charts/topic-evolution"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TimelinePage() {
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
        title="Timeline Analysis"
        description="Analyze mental health discussions over time"
        icon={<Clock size={28} />}
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
              <CardTitle>Post Timeline</CardTitle>
              <CardDescription>Mental health posts over time</CardDescription>
            </CardHeader>
            <CardContent>
              <TimelineChart />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-1">
          <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Weekly Patterns</CardTitle>
              <CardDescription>Post frequency by day of week</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyPatterns />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-1">
          <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Daily Patterns</CardTitle>
              <CardDescription>Post frequency by hour of day</CardDescription>
            </CardHeader>
            <CardContent>
              <DailyPatterns />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-1 md:col-span-2">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Topic Evolution</CardTitle>
              <CardDescription>How topics have evolved over time</CardDescription>
            </CardHeader>
            <CardContent>
              <TopicEvolution />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  )
}
