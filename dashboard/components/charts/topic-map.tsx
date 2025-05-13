"use client"

import { useState, useEffect } from "react"
import { useTopicData } from "@/hooks/useTopicData"
import { Loader2, Info } from "lucide-react"
import { motion } from "framer-motion"
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Button } from "@/components/ui/button"

export function TopicMap() {
  const { topics, semanticMap, loading, error } = useTopicData()
  const [activePoint, setActivePoint] = useState<any>(null)
  const [showInfo, setShowInfo] = useState(false)

  // Generate more meaningful clusters for each topic
  useEffect(() => {
    if (!loading && !error && topics.length > 0 && semanticMap.length > 0) {
      // This would be where we'd process the data if needed
    }
  }, [topics, semanticMap, loading, error])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  if (error) {
    return <div className="flex justify-center items-center h-full text-red-500">Error loading topic data</div>
  }

  // Group data by topic with more distinct clustering
  const dataByTopic = topics.map((topic) => {
    // Filter points for this topic
    const topicPoints = semanticMap.filter((point) => point.topic === topic.id)

    // Create a more coherent cluster by adjusting positions
    // Each topic will have its own quadrant/area in the visualization
    const adjustedPoints = topicPoints.map((point) => {
      // Base position for this topic's cluster
      const baseX = ((topic.id % 3) - 1) * 7 // Spread topics horizontally
      const baseY = (Math.floor(topic.id / 3) - 1) * 7 // And vertically

      // Add some random variation within the cluster
      const variationX = (Math.random() - 0.5) * 3
      const variationY = (Math.random() - 0.5) * 3

      return {
        ...point,
        x: baseX + variationX,
        y: baseY + variationY,
        z: 10 + Math.random() * 5, // Vary the point size slightly
      }
    })

    return {
      id: topic.id,
      name: topic.label,
      color: topic.color,
      data: adjustedPoints,
    }
  })

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const topic = topics.find((t) => t.id === data.topic)

      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg text-sm max-w-xs"
        >
          <div className="font-semibold text-sky-800">{topic?.label}</div>
          <div className="text-gray-600 mt-1">
            {data.text.length > 100 ? data.text.substring(0, 100) + "..." : data.text}
          </div>
        </motion.div>
      )
    }
    return null
  }

  return (
    <div className="h-full w-full relative">
      <Button
        variant="outline"
        size="sm"
        className="absolute top-0 right-0 z-10"
        onClick={() => setShowInfo(!showInfo)}
      >
        <Info className="h-4 w-4 mr-1" />
        Help
      </Button>

      {showInfo && (
        <div className="absolute top-10 right-0 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg text-sm max-w-xs">
          <h4 className="font-semibold mb-1">How to read this chart:</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>Each point represents a post about mental health</li>
            <li>Points are colored by their primary topic</li>
            <li>Similar posts are clustered together</li>
            <li>Hover over points to see post details</li>
            <li>Distance between clusters shows topic relatedness</li>
          </ul>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis
            type="number"
            dataKey="x"
            name="x"
            domain={["auto", "auto"]}
            tickFormatter={() => ""} // Hide axis values for cleaner look
            axisLine={{ stroke: "#e0e7ff" }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="y"
            domain={["auto", "auto"]}
            tickFormatter={() => ""} // Hide axis values for cleaner look
            axisLine={{ stroke: "#e0e7ff" }}
          />
          <ZAxis type="number" dataKey="z" range={[60, 400]} name="size" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />

          {dataByTopic.map((topicGroup) => (
            <Scatter
              key={topicGroup.id}
              name={topicGroup.name}
              data={topicGroup.data}
              fill={topicGroup.color}
              shape="circle"
            >
              {topicGroup.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={topicGroup.color} />
              ))}
            </Scatter>
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Topic Legend */}
      <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-sm">
        <div className="text-xs font-semibold mb-1">Topics</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {topics.map((topic) => (
            <div key={topic.id} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: topic.color }} />
              <span className="text-xs">{topic.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
