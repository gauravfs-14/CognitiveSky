"use client"

import { useState, useEffect } from "react"
import { useTopicData } from "./useTopicData"

export interface SentimentByTopicData {
  topic: string
  topicId: number
  positive: number
  neutral: number
  negative: number
  color: string
}

export function useSentimentByTopicData() {
  const { topics } = useTopicData()
  const [data, setData] = useState<SentimentByTopicData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (topics.length === 0) return

        // In a real app, this would be an API call
        // For now, we'll generate random data based on topics
        const staticData: SentimentByTopicData[] = topics.map((topic) => {
          const total = topic.count
          const positive = Math.floor(Math.random() * 0.6 * total)
          const negative = Math.floor(Math.random() * 0.4 * total)
          const neutral = total - positive - negative

          return {
            topic: topic.label,
            topicId: topic.id,
            positive,
            neutral,
            negative,
            color: topic.color,
          }
        })

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
