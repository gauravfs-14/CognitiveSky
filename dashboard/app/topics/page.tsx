"use client"

import { motion } from "framer-motion"
import { Network } from "lucide-react"
import { PageTitle } from "@/components/page-title"
import { TopicMap } from "@/components/charts/topic-map"
import { TopicCorrelation } from "@/components/charts/topic-correlation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTopicData } from "@/hooks/useTopicData"

export default function TopicsPage() {
  const { topics } = useTopicData()

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
        title="Topic Clusters"
        description="Explore the main topics in mental health discussions"
        icon={<Network size={28} />}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="col-span-1 md:col-span-2">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Topic Semantic Map</CardTitle>
              <CardDescription>Visualization of topic clusters in mental health discussions</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <TopicMap />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-1">
          <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Topic Distribution</CardTitle>
              <CardDescription>Breakdown of topics by post count</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-auto">
                  {topics.map((topic) => (
                    <div key={topic.id} className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-sm">{topic.label}</span>
                        <span className="text-sm text-gray-500">{topic.count} posts</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${(topic.count / Math.max(...topics.map((t) => t.count))) * 100}%`,
                            backgroundColor: topic.color,
                          }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <span>Keywords: </span>
                        {topic.keywords.map((keyword, i) => (
                          <span key={i} className="inline-block bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-1 md:col-span-3">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Topic Correlation</CardTitle>
              <CardDescription>How different topics relate to each other</CardDescription>
            </CardHeader>
            <CardContent>
              <TopicCorrelation />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  )
}
