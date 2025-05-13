"use client"

import { useState } from "react"
import { useTopicCorrelationData } from "@/hooks/useTopicCorrelationData"
import { useTopicData } from "@/hooks/useTopicData"
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TopicCorrelation() {
  const { data, loading, error } = useTopicCorrelationData()
  const { topics } = useTopicData()
  const [showInfo, setShowInfo] = useState(false)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">Error loading topic correlation data</div>
    )
  }

  // Transform correlation data into a format suitable for a scatter plot
  // with more meaningful positioning
  const scatterData = data.map((item) => {
    const sourceIndex = topics.findIndex((t) => t.label === item.source)
    const targetIndex = topics.findIndex((t) => t.label === item.target)

    // Calculate a more meaningful position based on topic indices
    // This creates a grid-like layout where each cell represents a pair of topics
    return {
      x: sourceIndex,
      y: targetIndex,
      z: item.value * 100, // Scale up for better visibility
      sourceLabel: item.source,
      targetLabel: item.target,
      value: item.value,
    }
  })

  // Create a custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg text-sm">
          <p className="font-semibold">{`${data.sourceLabel} ↔ ${data.targetLabel}`}</p>
          <p className="text-gray-600">{`Correlation: ${(data.value * 100).toFixed(0)}%`}</p>
          <p className="text-xs text-gray-500 mt-1">
            {data.value > 0.7 ? "Strong correlation" : data.value > 0.4 ? "Moderate correlation" : "Weak correlation"}
          </p>
        </div>
      )
    }
    return null
  }

  // Generate colors for the scatter points
  const getColor = (value: number) => {
    // Color scale from light blue to dark blue based on correlation strength
    if (value < 0.4) return "#bfdbfe" // light blue
    if (value < 0.6) return "#93c5fd" // medium light blue
    if (value < 0.8) return "#60a5fa" // medium blue
    return "#3b82f6" // darker blue
  }

  return (
    <div className="h-64 relative">
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
            <li>Each bubble represents a relationship between two topics</li>
            <li>Bubble size indicates correlation strength</li>
            <li>Darker blue indicates stronger correlation</li>
            <li>Hover over bubbles to see exact correlation values</li>
            <li>X and Y axes represent different topics</li>
          </ul>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis
            type="number"
            dataKey="x"
            name="Source Topic"
            tickFormatter={(value) => {
              // Only show labels for integer values that correspond to topic indices
              if (Number.isInteger(value) && value >= 0 && value < topics.length) {
                return value.toString()
              }
              return ""
            }}
            axisLine={{ stroke: "#94a3b8" }}
            label={{ value: "Source Topics", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Target Topic"
            tickFormatter={(value) => {
              // Only show labels for integer values that correspond to topic indices
              if (Number.isInteger(value) && value >= 0 && value < topics.length) {
                return value.toString()
              }
              return ""
            }}
            axisLine={{ stroke: "#94a3b8" }}
            label={{ value: "Target Topics", position: "insideLeft", angle: -90, offset: -20 }}
          />
          <ZAxis type="number" dataKey="z" range={[40, 400]} />
          <Tooltip content={<CustomTooltip />} />
          <Scatter name="Topic Correlation" data={scatterData} fill="#8884d8">
            {scatterData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-sm">
        <div className="text-xs font-semibold mb-1">Topic Index</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {topics.map((topic, index) => (
            <div key={index} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: topic.color }} />
              <span className="text-xs">{`${index}: ${topic.label}`}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
