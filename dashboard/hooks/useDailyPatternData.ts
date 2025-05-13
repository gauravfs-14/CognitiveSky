"use client"

import { useState, useEffect } from "react"

export interface DailyPatternData {
  hour: string
  count: number
}

export function useDailyPatternData() {
  const [data, setData] = useState<DailyPatternData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll generate static data for 24 hours
        const staticData: DailyPatternData[] = Array(24)
          .fill(0)
          .map((_, i) => {
            const hour = i.toString().padStart(2, "0") + ":00"
            // Create a pattern with higher activity during day hours
            let count
            if (i >= 8 && i <= 23) {
              // More activity during day/evening (8am-11pm)
              count = Math.floor(Math.random() * 50) + 20
            } else {
              // Less activity during night (12am-7am)
              count = Math.floor(Math.random() * 20) + 5
            }
            return { hour, count }
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
