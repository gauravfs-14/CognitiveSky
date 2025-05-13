"use client"

import { useState, useEffect } from "react"
import { useTopicData } from "./useTopicData"

export interface TopicCorrelationData {
  source: string
  target: string
  value: number
}

// Define meaningful correlations between topics
const topicCorrelations = [
  // Anxiety & Depression have a strong correlation
  { source: "Anxiety & Stress", target: "Depression", value: 0.85 },

  // Self-care is moderately correlated with both Anxiety and Depression
  { source: "Self-care", target: "Anxiety & Stress", value: 0.65 },
  { source: "Self-care", target: "Depression", value: 0.7 },

  // Support & Community has various correlations
  { source: "Support & Community", target: "Anxiety & Stress", value: 0.6 },
  { source: "Support & Community", target: "Depression", value: 0.75 },
  { source: "Support & Community", target: "Self-care", value: 0.55 },

  // Therapy & Treatment correlations
  { source: "Therapy & Treatment", target: "Anxiety & Stress", value: 0.8 },
  { source: "Therapy & Treatment", target: "Depression", value: 0.9 },
  { source: "Therapy & Treatment", target: "Self-care", value: 0.5 },
  { source: "Therapy & Treatment", target: "Support & Community", value: 0.4 },
]

export function useTopicCorrelationData() {
  const { topics } = useTopicData()
  const [data, setData] = useState<TopicCorrelationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (topics.length === 0) return

        // Use predefined correlations when topics are loaded
        if (topics.length > 0) {
          // Filter correlations to only include topics that exist in our data
          const validCorrelations = topicCorrelations.filter((corr) => {
            const sourceExists = topics.some((t) => t.label === corr.source)
            const targetExists = topics.some((t) => t.label === corr.target)
            return sourceExists && targetExists
          })

          setData(validCorrelations)
        } else {
          // Fallback to random correlations if needed
          const correlations: TopicCorrelationData[] = []

          // Generate correlations between topics
          for (let i = 0; i < topics.length; i++) {
            for (let j = i + 1; j < topics.length; j++) {
              // Random correlation value between 0 and 1
              const value = Math.random()
              if (value > 0.3) {
                // Only show stronger correlations
                correlations.push({
                  source: topics[i].label,
                  target: topics[j].label,
                  value: Number.parseFloat(value.toFixed(2)),
                })
              }
            }
          }

          setData(correlations)
        }

        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
        setLoading(false)
      }
    }

    if (topics.length > 0) {
      fetchData()
    }
  }, [topics])

  return { data, loading, error }
}
