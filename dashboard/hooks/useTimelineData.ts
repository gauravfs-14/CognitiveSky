"use client"

import { useState, useEffect } from "react"

export interface TimelineData {
  date: string
  count: number
}

export function useTimelineData() {
  const [data, setData] = useState<TimelineData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll generate 30 days of data
        const today = new Date()
        const staticData: TimelineData[] = Array(30)
          .fill(0)
          .map((_, i) => {
            const date = new Date(today)
            date.setDate(date.getDate() - (29 - i))
            return {
              date: date.toISOString().split("T")[0],
              count: Math.floor(Math.random() * 100) + 10,
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
