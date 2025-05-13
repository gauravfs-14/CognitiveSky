"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Filter, Search, RefreshCw } from "lucide-react"
import { useFilters } from "@/contexts/filter-context"
import { useTopicData } from "@/hooks/useTopicData"
import { useEmotionData } from "@/hooks/useEmotionData"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function FilterSheet({ isOpen, onClose }: FilterSheetProps) {
  const {
    topics: activeTopics,
    emotions: activeEmotions,
    dateRange,
    searchQuery,
    setTopicFilter,
    setEmotionFilter,
    setDateRangeFilter,
    setSearchQuery,
    resetFilters,
    isFilterActive,
  } = useFilters()

  // Fetch topics and emotions data directly in this component
  const { topics: allTopics } = useTopicData()
  const { data: allEmotions } = useEmotionData()

  const [localTopics, setLocalTopics] = useState<number[]>(activeTopics)
  const [localEmotions, setLocalEmotions] = useState<string[]>(activeEmotions)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  // Calculate slider value from date range
  const calculateSliderValue = () => {
    try {
      const now = new Date()

      // Ensure dateRange[0] is a valid Date object
      let startDate: Date
      if (dateRange && dateRange[0]) {
        // Check if dateRange[0] is already a Date object
        if (dateRange[0] instanceof Date) {
          startDate = dateRange[0]
        } else {
          // Try to parse it as a Date
          startDate = new Date(dateRange[0])
        }
      } else {
        // Default to 30 days ago if no valid date
        startDate = new Date()
        startDate.setDate(now.getDate() - 30)
      }

      // Calculate the difference in days
      const diffTime = Math.abs(now.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Convert to slider value (0-100)
      return Math.max(0, Math.min(100, 100 - (diffDays / 30) * 100))
    } catch (error) {
      console.error("Error calculating slider value:", error)
      return 0 // Default to 0 (30 days) if there's an error
    }
  }

  const [dateRangeValue, setDateRangeValue] = useState([calculateSliderValue()])

  // Sync local state with URL params when opened
  useEffect(() => {
    if (isOpen) {
      setLocalTopics(activeTopics)
      setLocalEmotions(activeEmotions)
      setLocalSearchQuery(searchQuery)
      setDateRangeValue([calculateSliderValue()])
    }
  }, [isOpen, activeTopics, activeEmotions, searchQuery, dateRange])

  const handleTopicChange = (topicId: number, checked: boolean) => {
    setLocalTopics((prev) => (checked ? [...prev, topicId] : prev.filter((id) => id !== topicId)))
  }

  const handleEmotionChange = (emotion: string, checked: boolean) => {
    setLocalEmotions((prev) => (checked ? [...prev, emotion] : prev.filter((e) => e !== emotion)))
  }

  const handleApplyFilters = () => {
    setTopicFilter(localTopics)
    setEmotionFilter(localEmotions)
    setSearchQuery(localSearchQuery)

    // Convert slider value to date range
    const now = new Date()
    const daysAgo = Math.floor(((100 - dateRangeValue[0]) / 100) * 30) // 0-30 days
    const startDate = new Date()
    startDate.setDate(now.getDate() - daysAgo)
    setDateRangeFilter([startDate, now])

    onClose()
  }

  const handleResetFilters = () => {
    setLocalTopics([])
    setLocalEmotions([])
    setLocalSearchQuery("")
    setDateRangeValue([50])
    resetFilters()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Filter Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-sky-600 mr-2" />
                <h2 className="text-lg font-semibold">Filters</h2>
                {isFilterActive && (
                  <Badge variant="secondary" className="ml-2">
                    Active
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium">
                  Search Posts
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="search"
                    placeholder="Search for keywords or phrases..."
                    className="pl-8"
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Topics */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Topics</Label>
                <div className="grid grid-cols-2 gap-2">
                  {allTopics.map((topic) => (
                    <div key={topic.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`topic-${topic.id}`}
                        checked={localTopics.includes(topic.id)}
                        onCheckedChange={(checked) => handleTopicChange(topic.id, checked === true)}
                      />
                      <Label htmlFor={`topic-${topic.id}`} className="flex items-center text-sm">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: topic.color }} />
                        {topic.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emotions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Emotions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {allEmotions.map((emotion, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`emotion-${emotion.label}`}
                        checked={localEmotions.includes(emotion.label)}
                        onCheckedChange={(checked) => handleEmotionChange(emotion.label, checked === true)}
                      />
                      <Label htmlFor={`emotion-${emotion.label}`} className="text-sm">
                        {emotion.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Time Period</Label>
                <Slider max={100} step={1} value={dateRangeValue} onValueChange={setDateRangeValue} className="py-4" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Past 30 days</span>
                  <span>Past 15 days</span>
                  <span>Today</span>
                </div>
                <div className="text-center text-sm mt-2">
                  {dateRangeValue[0] === 0 ? (
                    <span>All data from the past 30 days</span>
                  ) : dateRangeValue[0] === 100 ? (
                    <span>Today only</span>
                  ) : (
                    <span>Past {Math.floor(((100 - dateRangeValue[0]) / 100) * 30)} days</span>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full bg-sky-600 hover:bg-sky-700" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
