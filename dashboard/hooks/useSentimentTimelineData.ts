"use client"

import { useState, useEffect } from "react"

export interface SentimentTimelineData {
  date: string
  positive: number
  neutral: number
  negative: number
}

export function useSentimentTimelineData() {
  const [data, setData] = useState<SentimentTimelineData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll generate 30 days of data
        const today = new Date()
        const staticData: SentimentTimelineData[] = Array(30)
          .fill(0)
          .map((_, i) => {
            const date = new Date(today)
            date.setDate(date.getDate() - (29 - i))
            return {
              date: date.toISOString().split("T")[0],
              positive: Math.floor(Math.random() * 50) + 10,
              neutral: Math.floor(Math.random() * 40) + 5,
              negative: Math.floor(Math.random() * 30) + 5,
            }
          })

        setData(staticData)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
