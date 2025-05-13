"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useQueryState } from "nuqs"

export interface FilterState {
  topics: number[]
  emotions: string[]
  dateRange: [Date, Date]
  searchQuery: string
}

interface FilterContextType {
  topics: number[]
  emotions: string[]
  dateRange: [Date, Date]
  searchQuery: string
  setTopicFilter: (topicIds: number[]) => void
  setEmotionFilter: (emotions: string[]) => void
  setDateRangeFilter: (range: [Date, Date]) => void
  setSearchQuery: (query: string) => void
  resetFilters: () => void
  isFilterActive: boolean
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  // Get date range for the last 30 days
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  // Set up URL query parameters using nuqs
  const [topicsParam, setTopicsParam] = useQueryState("topics", {
    defaultValue: "",
    parse: (value) => (value ? value.split(",").map(Number) : []),
    serialize: (value) => (value.length ? value.join(",") : null),
  })

  const [emotionsParam, setEmotionsParam] = useQueryState("emotions", {
    defaultValue: "",
    parse: (value) => (value ? value.split(",") : []),
    serialize: (value) => (value.length ? value.join(",") : null),
  })

  const [dateRangeParam, setDateRangeParam] = useQueryState("dateRange", {
    defaultValue: `${startDate.toISOString()},${endDate.toISOString()}`,
    parse: (value) => {
      if (!value) return [startDate, endDate]
      try {
        const [start, end] = value.split(",")
        return [new Date(start), new Date(end)]
      } catch (error) {
        console.error("Error parsing date range:", error)
        return [startDate, endDate]
      }
    },
    serialize: (value) => {
      try {
        // Ensure both values are valid Date objects
        const start = value[0] instanceof Date ? value[0] : new Date(value[0])
        const end = value[1] instanceof Date ? value[1] : new Date(value[1])
        return `${start.toISOString()},${end.toISOString()}`
      } catch (error) {
        console.error("Error serializing date range:", error)
        return `${startDate.toISOString()},${endDate.toISOString()}`
      }
    },
  })

  const [searchQueryParam, setSearchQueryParam] = useQueryState("q", {
    defaultValue: "",
  })

  // Parse URL parameters into actual filter values
  const topics = topicsParam
  const emotions = emotionsParam

  // Ensure dateRange is always a valid tuple of Date objects
  let dateRange: [Date, Date]
  try {
    if (Array.isArray(dateRangeParam) && dateRangeParam.length === 2) {
      dateRange = [
        dateRangeParam[0] instanceof Date ? dateRangeParam[0] : new Date(dateRangeParam[0]),
        dateRangeParam[1] instanceof Date ? dateRangeParam[1] : new Date(dateRangeParam[1]),
      ]
    } else {
      dateRange = [startDate, endDate]
    }
  } catch (error) {
    console.error("Error processing date range:", error)
    dateRange = [startDate, endDate]
  }

  const searchQuery = searchQueryParam

  // Determine if any filters are active
  const isFilterActive = topics.length > 0 || emotions.length > 0 || searchQuery !== ""

  // Filter setters
  const setTopicFilter = (topicIds: number[]) => {
    setTopicsParam(topicIds)
  }

  const setEmotionFilter = (emotions: string[]) => {
    setEmotionsParam(emotions)
  }

  const setDateRangeFilter = (range: [Date, Date]) => {
    setDateRangeParam(range)
  }

  const setSearchQuery = (query: string) => {
    setSearchQueryParam(query)
  }

  const resetFilters = () => {
    setTopicsParam([])
    setEmotionsParam([])
    setDateRangeParam([startDate, endDate])
    setSearchQueryParam("")
  }

  return (
    <FilterContext.Provider
      value={{
        topics,
        emotions,
        dateRange,
        searchQuery,
        setTopicFilter,
        setEmotionFilter,
        setDateRangeFilter,
        setSearchQuery,
        resetFilters,
        isFilterActive,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider")
  }
  return context
}
