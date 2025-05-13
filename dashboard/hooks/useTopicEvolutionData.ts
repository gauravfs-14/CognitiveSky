"use client"

import { useState, useEffect } from "react"
import { useTopicData } from "./useTopicData"

export interface TopicEvolutionData {
  date: string
  [key: string]: string | number
}

export function useTopicEvolutionData() {
  const { topics } = useTopicData()
  const [data, setData] = useState<TopicEvolutionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (topics.length === 0) return

        // In a real app, this would be an API call
        // For now, we'll generate 10 time periods of data
        const periods = 10
        const staticData: TopicEvolutionData[] = []

        for (let i = 0; i < periods; i++) {
          const date = new Date()
          date.setDate(date.getDate() - (periods - 1 - i) * 3) // Every 3 days

          const dataPoint: TopicEvolutionData = {
            date: date.toISOString().split("T")[0],
          }

          // Add random values for each topic
          topics.forEach((topic) => {
            // Create a trend where topics grow or decline over time
            const baseTrend = Math.random() < 0.5 ? 1 : -1 // Increasing or decreasing trend
            const trendFactor = 1 + baseTrend * 0.1 * i // Trend grows stronger over time
            const randomFactor = 0.8 + Math.random() * 0.4 // Random variation

            dataPoint[topic.label] = Math.max(5, Math.floor((topic.count / 10) * trendFactor * randomFactor))
          })

          staticData.push(dataPoint)
        }

        setData(staticData)
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
