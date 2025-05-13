"use client"

import { useDailyPatternData } from "@/hooks/useDailyPatternData"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"

export function DailyPatterns() {
  const { data, loading, error } = useDailyPatternData()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error loading daily pattern data</div>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 10 }}
            interval={2} // Show every 3rd hour
          />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "none",
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            name="Post Count"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={{ r: 3, fill: "#60a5fa", stroke: "#60a5fa" }}
            activeDot={{ r: 5, fill: "#3b82f6", stroke: "#3b82f6" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
