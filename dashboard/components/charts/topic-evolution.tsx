"use client"

import { useTopicEvolutionData } from "@/hooks/useTopicEvolutionData"
import { useTopicData } from "@/hooks/useTopicData"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"

export function TopicEvolution() {
  const { data, loading, error } = useTopicEvolutionData()
  const { topics } = useTopicData()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error loading topic evolution data</div>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value)
              return `${date.getMonth() + 1}/${date.getDate()}`
            }}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            }}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "none",
            }}
          />
          <Legend />
          {topics.map((topic, index) => (
            <Area
              key={index}
              type="monotone"
              dataKey={topic.label}
              name={topic.label}
              stroke={topic.color}
              fill={topic.color}
              fillOpacity={0.3}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
