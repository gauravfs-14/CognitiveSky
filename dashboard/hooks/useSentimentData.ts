"use client"

import { useState, useEffect } from "react"
import { useFilters } from "@/contexts/filter-context"

export interface SentimentData {
  label: string
  count: number
  percent: number
  color?: string
}

// Static data outside the component
const staticSentimentData: SentimentData[] = [
  { label: "Positive", count: 12464, percent: 42.32, color: "#4ade80" },
  { label: "Neutral", count: 9872, percent: 33.51, color: "#60a5fa" },
  { label: "Negative", count: 7123, percent: 24.17, color: "#f87171" },
]

export function useSentimentData() {
  const [data, setData] = useState<SentimentData[]>(staticSentimentData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Get filters - wrap in try/catch to handle case where FilterProvider isn't available yet
  // Initialize filter values with defaults
  const defaultTopics: number[] = []
  const defaultEmotions: string[] = []
  const defaultDateRange: [Date, Date] = [new Date(), new Date()]
  const defaultSearchQuery: string = ""
  const defaultIsFilterActive: boolean = false

  // Attempt to get filters from the context, but provide defaults if unavailable
  let filters
  try {
    filters = useFilters()
  } catch (e) {
    // FilterProvider not available yet, use defaults
    console.warn("FilterProvider not available, using default filters.")
    filters = {
      topics: defaultTopics,
      emotions: defaultEmotions,
      dateRange: defaultDateRange,
      searchQuery: defaultSearchQuery,
      isFilterActive: defaultIsFilterActive,
    }
  }

  const { topics: activeTopics, emotions: activeEmotions, dateRange, searchQuery, isFilterActive } = filters

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Start with a copy of the static data
        let filteredData = [...staticSentimentData]

        // Simulate filtering by reducing counts based on active filters
        if (isFilterActive) {
          // Apply a random reduction factor for each filter to simulate filtering
          let reductionFactor = 1.0

          // Each active filter reduces the data by some amount
          if (activeTopics.length > 0) {
            reductionFactor *= 0.7 + Math.random() * 0.2 // 0.7-0.9
          }

          if (activeEmotions.length > 0) {
            reductionFactor *= 0.6 + Math.random() * 0.3 // 0.6-0.9
          }

          if (searchQuery) {
            reductionFactor *= 0.5 + Math.random() * 0.3 // 0.5-0.8
          }

          filteredData = filteredData.map((item) => {
            const newCount = Math.floor(item.count * reductionFactor)
            return {
              ...item,
              count: newCount,
              // Recalculate percentages
              percent: 0, // We'll calculate this after
            }
          })

          // Recalculate percentages
          const total = filteredData.reduce((sum, item) => sum + item.count, 0)
          filteredData = filteredData.map((item) => ({
            ...item,
            percent: Number(((item.count / total) * 100).toFixed(2)),
          }))
        }

        setData(filteredData)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
        setLoading(false)
      }
    }

    fetchData()
  }, [isFilterActive, activeTopics, activeEmotions, dateRange, searchQuery])

  return { data, loading, error }
}
