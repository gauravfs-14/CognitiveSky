"use client"

import { useState, useEffect } from "react"
import { useFilters } from "@/contexts/filter-context"

export interface TopicData {
  id: number
  label: string
  keywords: string[]
  count: number
  color: string
}

export interface SemanticMapPoint {
  postId: string
  text: string
  x: number
  y: number
  topic: number
}

// Static data outside the component to avoid re-creation on each render
const staticTopicsData: TopicData[] = [
  {
    id: 0,
    label: "Anxiety & Stress",
    keywords: ["anxiety", "stress", "time", "depression"],
    count: 3245,
    color: "#60a5fa",
  },
  {
    id: 1,
    label: "Depression",
    keywords: ["depression", "feel", "feeling", "sad"],
    count: 2876,
    color: "#a78bfa",
  },
  {
    id: 2,
    label: "Self-care",
    keywords: ["self", "care", "health", "mental"],
    count: 2123,
    color: "#4ade80",
  },
  {
    id: 3,
    label: "Support & Community",
    keywords: ["support", "help", "community", "people"],
    count: 1987,
    color: "#fbbf24",
  },
  {
    id: 4,
    label: "Therapy & Treatment",
    keywords: ["therapy", "treatment", "doctor", "medication"],
    count: 1654,
    color: "#f472b6",
  },
]

// Sample post texts for each topic to make the data more realistic
const samplePostTexts = {
  0: [
    "Feeling so anxious about my upcoming presentation. Can't sleep at all.",
    "My anxiety has been through the roof lately. Any tips for managing stress?",
    "Does anyone else feel physical symptoms from anxiety? My chest gets so tight.",
    "Work stress is killing me. I can't seem to catch a break.",
    "Had a panic attack in public today. So embarrassing and scary.",
  ],
  1: [
    "Been feeling so down lately. Nothing seems to bring me joy anymore.",
    "Depression is like carrying a heavy weight that no one else can see.",
    "Some days I can't even get out of bed. Depression is exhausting.",
    "Does anyone else feel completely numb sometimes?",
    "The sadness comes in waves. Today is a really bad day.",
  ],
  2: [
    "Started a new self-care routine. Meditation has been life-changing.",
    "Remember that self-care isn't selfish. You deserve to take care of yourself.",
    "What are your favorite self-care activities? Looking for new ideas.",
    "Mental health days should be normalized. Taking one today.",
    "Setting boundaries has been the best form of self-care for me.",
  ],
  3: [
    "So grateful for this supportive community. You all make me feel less alone.",
    "Looking for support groups in the Boston area. Any recommendations?",
    "Community is everything when dealing with mental health challenges.",
    "Thank you to everyone who reached out after my last post. It meant a lot.",
    "How do you find supportive people who really understand what you're going through?",
  ],
  4: [
    "Started therapy last week. Nervous but hopeful it will help.",
    "My new medication is finally starting to make a difference.",
    "CBT techniques have been really effective for my anxiety.",
    "Looking for a new therapist who specializes in trauma. Any recommendations?",
    "Just had my first psychiatrist appointment. Feeling validated.",
  ],
}

export function useTopicData() {
  const [topics, setTopics] = useState<TopicData[]>(staticTopicsData)
  const [semanticMap, setSemanticMap] = useState<SemanticMapPoint[]>([])
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

        // Generate more meaningful semantic map points
        // Each topic will have its own cluster with some variation
        let staticSemanticMap: SemanticMapPoint[] = []

        // For each topic, create a cluster of points
        staticTopicsData.forEach((topic, topicIndex) => {
          // Base position for this topic's cluster
          const baseX = ((topicIndex % 3) - 1) * 7 // Spread topics horizontally
          const baseY = (Math.floor(topicIndex / 3) - 1) * 7 // And vertically

          // Number of points for this topic
          const pointCount = Math.floor(topic.count / 20) // Scale down for visualization

          // Create points for this topic
          for (let i = 0; i < pointCount; i++) {
            // Add some random variation within the cluster
            const variationX = (Math.random() - 0.5) * 3
            const variationY = (Math.random() - 0.5) * 3

            // Get a sample post text for this topic
            const textIndex = i % samplePostTexts[topicIndex].length
            const text = samplePostTexts[topicIndex][textIndex]

            staticSemanticMap.push({
              postId: `post_${topicIndex}_${i}`,
              text,
              x: baseX + variationX,
              y: baseY + variationY,
              topic: topicIndex,
            })
          }
        })

        // Start with a copy of the static data
        let filteredTopics = [...staticTopicsData]

        // Apply filters
        if (isFilterActive) {
          // If specific topics are selected, highlight those
          if (activeTopics.length > 0) {
            filteredTopics = filteredTopics.map((topic) => {
              if (activeTopics.includes(topic.id)) {
                // Boost selected topics
                return { ...topic, count: Math.floor(topic.count * 1.5) }
              } else {
                // Reduce non-selected topics
                return { ...topic, count: Math.floor(topic.count * 0.5) }
              }
            })

            // Filter semantic map to show primarily selected topics
            staticSemanticMap = staticSemanticMap.filter(
              (point) => activeTopics.includes(point.topic) || Math.random() < 0.2,
            )
          } else {
            // Apply general filtering
            let reductionFactor = 1.0

            if (activeEmotions.length > 0) {
              reductionFactor *= 0.7 + Math.random() * 0.2
            }

            if (searchQuery) {
              reductionFactor *= 0.5 + Math.random() * 0.3
            }

            filteredTopics = filteredTopics.map((topic) => ({
              ...topic,
              count: Math.floor(topic.count * reductionFactor),
            }))

            // Reduce semantic map points
            staticSemanticMap = staticSemanticMap.filter(() => Math.random() < reductionFactor)
          }
        }

        setTopics(filteredTopics)
        setSemanticMap(staticSemanticMap)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
        setLoading(false)
      }
    }

    fetchData()
  }, [isFilterActive, activeTopics, activeEmotions, dateRange, searchQuery])

  return { topics, semanticMap, loading, error }
}
