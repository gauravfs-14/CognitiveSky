// filepath: /Users/gchhetri/Developer/PERSONAL/CognitiveSky/dashboard/contexts/filter-context.tsx
"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQueryState } from "nuqs";

export interface FilterState {
  topics: number[];
  emotions: string[];
  dateRange: [Date, Date];
  searchQuery: string;
}

interface FilterContextType {
  topics: number[];
  emotions: string[];
  dateRange: [Date, Date];
  searchQuery: string;
  setTopicFilter: (topicIds: number[]) => void;
  setEmotionFilter: (emotions: string[]) => void;
  setDateRangeFilter: (range: [Date, Date]) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
  isFilterActive: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  // Get date range for the last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  // Set up URL query parameters using nuqs
  const [topicsParam, setTopicsParam] = useQueryState("topics");
  const [emotionsParam, setEmotionsParam] = useQueryState("emotions");
  const [dateRangeParam, setDateRangeParam] = useQueryState("dateRange");
  const [searchQueryParam, setSearchQueryParam] = useQueryState("q");

  // Parse URL parameters into actual filter values
  const topics: number[] = topicsParam
    ? topicsParam
        .split(",")
        .map(Number)
        .filter((n) => !isNaN(n))
    : [];

  const emotions: string[] = emotionsParam
    ? emotionsParam.split(",").filter(Boolean)
    : [];

  // Ensure dateRange is always a valid tuple of Date objects
  let dateRange: [Date, Date];
  try {
    if (dateRangeParam) {
      const [start, end] = dateRangeParam.split(",");
      const startDate1 = new Date(start);
      const endDate1 = new Date(end);

      // Validate dates are valid
      if (!isNaN(startDate1.getTime()) && !isNaN(endDate1.getTime())) {
        dateRange = [startDate1, endDate1];
      } else {
        dateRange = [startDate, endDate];
      }
    } else {
      dateRange = [startDate, endDate];
    }
  } catch (error) {
    console.error("Error processing date range:", error);
    dateRange = [startDate, endDate];
  }

  const searchQuery = searchQueryParam || "";

  // Determine if any filters are active
  const isFilterActive =
    topics.length > 0 ||
    emotions.length > 0 ||
    searchQuery !== "" ||
    dateRange[0].getTime() !== startDate.getTime() ||
    dateRange[1].getTime() !== endDate.getTime();

  // Filter setters
  const setTopicFilter = (topicIds: number[]) => {
    if (topicIds.length === 0) {
      setTopicsParam(null);
    } else {
      setTopicsParam(topicIds.join(","));
    }
  };

  const setEmotionFilter = (emotionValues: string[]) => {
    if (emotionValues.length === 0) {
      setEmotionsParam(null);
    } else {
      setEmotionsParam(emotionValues.join(","));
    }
  };

  const setDateRangeFilter = (range: [Date, Date]) => {
    const dateStr = `${range[0].toISOString()},${range[1].toISOString()}`;
    setDateRangeParam(dateStr);
  };

  const setSearchQuery = (query: string) => {
    if (!query) {
      setSearchQueryParam(null);
    } else {
      setSearchQueryParam(query);
    }
  };

  const resetFilters = () => {
    setTopicsParam(null);
    setEmotionsParam(null);
    setDateRangeParam(`${startDate.toISOString()},${endDate.toISOString()}`);
    setSearchQueryParam(null);
  };

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
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
