"use client"

import { useState, useEffect } from "react"

export interface HashtagData {
  hashtag: string
  count: number
}

export function useHashtagData() {
  const [data, setData] = useState<HashtagData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use static data
        const staticData: HashtagData[] = [
          { hashtag: "#mentalhealth", count: 212 },
          { hashtag: "#anxiety", count: 187 },
          { hashtag: "#depression", count: 165 },
          { hashtag: "#selfcare", count: 143 },
          { hashtag: "#therapy", count: 112 },
          { hashtag: "#mentalhealthawareness", count: 98 },
          { hashtag: "#wellness", count: 87 },
          { hashtag: "#mindfulness", count: 76 },
          { hashtag: "#recovery", count: 65 },
          { hashtag: "#selflove", count: 54 },
        ]

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
