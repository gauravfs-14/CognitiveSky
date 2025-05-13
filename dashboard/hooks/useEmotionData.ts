"use client"

import { useState, useEffect } from "react"
import { useFilters } from "@/contexts/filter-context"

export interface EmotionData {
  label: string
  count: number
  color?: string
}

// Static data outside the component
const staticEmotionsData: EmotionData[] = [
  { label: "Joy", count: 2503, color: "#fbbf24" },
  { label: "Sadness", count: 1872, color: "#60a5fa" },
  { label: "Anger", count: 1245, color: "#f87171" },
  { label: "Fear", count: 1123, color: "#a78bfa" },
  { label: "Disgust", count: 876, color: "#34d399" },
  { label: "Surprise", count: 654, color: "#f472b6" },
]

export function useEmotionData() {
  const [data, setData] = useState<EmotionData[]>(staticEmotionsData)
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
  let filters = {
    topics: defaultTopics,
    emotions: defaultEmotions,
    dateRange: defaultDateRange,
    searchQuery: defaultSearchQuery,
    isFilterActive: defaultIsFilterActive,
  }

  let filterContext
  try {
    filterContext = useFilters()
  } catch (e) {
    // FilterProvider not available yet, use defaults
    console.warn("FilterProvider not available, using default filters.")
    filterContext = null
  }

  filters = filterContext || filters

  const { topics: activeTopics, emotions: activeEmotions, dateRange, searchQuery, isFilterActive } = filters

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Start with a copy of the static data
        let filteredData = [...staticEmotionsData]

        // Simulate filtering
        if (isFilterActive) {
          // If specific emotions are selected, highlight those
          if (activeEmotions.length > 0) {
            filteredData = filteredData.map((emotion) => {
              if (activeEmotions.includes(emotion.label)) {
                // Boost selected emotions
                return { ...emotion, count: Math.floor(emotion.count * 1.5) }
              } else {
                // Reduce non-selected emotions
                return { ...emotion, count: Math.floor(emotion.count * 0.5) }
              }
            })
          } else {
            // Apply general filtering
            let reductionFactor = 1.0

            if (activeTopics.length > 0) {
              reductionFactor *= 0.7 + Math.random() * 0.2
            }

            if (searchQuery) {
              reductionFactor *= 0.5 + Math.random() * 0.3
            }

            filteredData = filteredData.map((emotion) => ({
              ...emotion,
              count: Math.floor(emotion.count * reductionFactor),
            }))
          }
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
