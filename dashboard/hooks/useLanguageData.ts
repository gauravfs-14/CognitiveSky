"use client"

import { useState, useEffect } from "react"

export interface LanguageData {
  lang: string
  count: number
  label: string
  color: string
}

export function useLanguageData() {
  const [data, setData] = useState<LanguageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use static data
        const staticData: LanguageData[] = [
          { lang: "en", count: 23818, label: "English", color: "#60a5fa" },
          { lang: "es", count: 2134, label: "Spanish", color: "#f87171" },
          { lang: "fr", count: 1243, label: "French", color: "#4ade80" },
          { lang: "de", count: 987, label: "German", color: "#fbbf24" },
          { lang: "ja", count: 765, label: "Japanese", color: "#a78bfa" },
          { lang: "other", count: 1532, label: "Other", color: "#94a3b8" },
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
