"use client"

import { useState, useEffect } from "react"
import { useFilters } from "@/contexts/filter-context"

export interface Post {
  id: string
  text: string
  date: string
  author: string
  likes: number
  reposts: number
  topic: number
  sentiment: "positive" | "neutral" | "negative"
  emotions: string[]
  hashtags: string[]
  emojis: string[]
}

// Sample author names
const authors = [
  "Alex Johnson",
  "Sam Taylor",
  "Jordan Smith",
  "Casey Williams",
  "Morgan Brown",
  "Riley Davis",
  "Quinn Miller",
  "Taylor Wilson",
  "Jamie Garcia",
  "Avery Martinez",
]

// Sample post texts for each topic
const samplePostTexts = {
  0: [
    "Feeling so anxious about my upcoming presentation. Can't sleep at all. #anxiety #stress",
    "My anxiety has been through the roof lately. Any tips for managing stress? 😔 #mentalhealth",
    "Does anyone else feel physical symptoms from anxiety? My chest gets so tight. #anxiety",
    "Work stress is killing me. I can't seem to catch a break. #stress #burnout",
    "Had a panic attack in public today. So embarrassing and scary. #anxiety #panicattack",
  ],
  1: [
    "Been feeling so down lately. Nothing seems to bring me joy anymore. #depression",
    "Depression is like carrying a heavy weight that no one else can see. 😞 #mentalhealth",
    "Some days I can't even get out of bed. Depression is exhausting. #depression #tired",
    "Does anyone else feel completely numb sometimes? #depression #mentalhealth",
    "The sadness comes in waves. Today is a really bad day. 😢 #depression",
  ],
  2: [
    "Started a new self-care routine. Meditation has been life-changing. ✨ #selfcare",
    "Remember that self-care isn't selfish. You deserve to take care of yourself. #selfcare",
    "What are your favorite self-care activities? Looking for new ideas. #selfcare #mentalhealth",
    "Mental health days should be normalized. Taking one today. #selfcare #mentalhealth",
    "Setting boundaries has been the best form of self-care for me. #boundaries #selfcare",
  ],
  3: [
    "So grateful for this supportive community. You all make me feel less alone. ❤️ #community",
    "Looking for support groups in the Boston area. Any recommendations? #support #mentalhealth",
    "Community is everything when dealing with mental health challenges. #support #community",
    "Thank you to everyone who reached out after my last post. It meant a lot. 🙏 #gratitude",
    "How do you find supportive people who really understand what you're going through? #support",
  ],
  4: [
    "Started therapy last week. Nervous but hopeful it will help. #therapy #mentalhealth",
    "My new medication is finally starting to make a difference. #treatment #mentalhealth",
    "CBT techniques have been really effective for my anxiety. #therapy #cbt",
    "Looking for a new therapist who specializes in trauma. Any recommendations? #therapy",
    "Just had my first psychiatrist appointment. Feeling validated. #treatment #mentalhealth",
  ],
}

// Generate a larger set of posts for pagination
const generatePosts = (count: number): Post[] => {
  const posts: Post[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const topic = i % 5 // Cycle through topics
    const textIndex = i % samplePostTexts[topic].length
    const text = samplePostTexts[topic][textIndex]

    // Extract hashtags
    const hashtags = text.match(/#\w+/g) || []

    // Extract emojis
    const emojiRegex = /[\p{Emoji}]/gu
    const emojis = text.match(emojiRegex) || []

    // Determine sentiment based on topic
    let sentiment: "positive" | "neutral" | "negative"
    if (topic === 0 || topic === 1) {
      sentiment = "negative"
    } else if (topic === 2) {
      sentiment = "positive"
    } else {
      sentiment = Math.random() > 0.5 ? "neutral" : Math.random() > 0.5 ? "positive" : "negative"
    }

    // Determine emotions
    const emotions: string[] = []
    if (sentiment === "negative") {
      emotions.push(Math.random() > 0.5 ? "Sadness" : "Fear")
      if (Math.random() > 0.7) emotions.push("Anger")
    } else if (sentiment === "positive") {
      emotions.push(Math.random() > 0.5 ? "Joy" : "Surprise")
    } else {
      if (Math.random() > 0.5) emotions.push("Disgust")
    }

    // Generate date within the last 30 days
    const date = new Date(now)
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))

    posts.push({
      id: `post_${i}`,
      text,
      date: date.toISOString(),
      author: authors[Math.floor(Math.random() * authors.length)],
      likes: Math.floor(Math.random() * 50),
      reposts: Math.floor(Math.random() * 20),
      topic,
      sentiment,
      emotions,
      hashtags,
      emojis,
    })
  }

  return posts
}

// Generate 200 posts
const allPosts = generatePosts(200)

export function usePostsData(page = 1, pageSize = 10) {
  const [posts, setPosts] = useState<Post[]>([])
  const [totalPosts, setTotalPosts] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Get filters
  const filters = useFilters() || {
    topics: [],
    emotions: [],
    dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
    searchQuery: "",
    isFilterActive: false,
  }

  const { topics: activeTopics, emotions: activeEmotions, dateRange, searchQuery, isFilterActive } = filters

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Filter posts based on active filters
        let filteredPosts = [...allPosts]

        if (isFilterActive) {
          // Filter by topics
          if (activeTopics.length > 0) {
            filteredPosts = filteredPosts.filter((post) => activeTopics.includes(post.topic))
          }

          // Filter by emotions
          if (activeEmotions.length > 0) {
            filteredPosts = filteredPosts.filter((post) =>
              post.emotions.some((emotion) => activeEmotions.includes(emotion)),
            )
          }

          // Filter by date range
          if (dateRange && dateRange.length === 2) {
            const startDate = new Date(dateRange[0])
            const endDate = new Date(dateRange[1])

            filteredPosts = filteredPosts.filter((post) => {
              const postDate = new Date(post.date)
              return postDate >= startDate && postDate <= endDate
            })
          }

          // Filter by search query
          if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filteredPosts = filteredPosts.filter(
              (post) =>
                post.text.toLowerCase().includes(query) ||
                post.author.toLowerCase().includes(query) ||
                post.hashtags.some((tag) => tag.toLowerCase().includes(query)),
            )
          }
        }

        // Sort by date (newest first)
        filteredPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        // Calculate pagination
        setTotalPosts(filteredPosts.length)
        setTotalPages(Math.ceil(filteredPosts.length / pageSize))

        // Get posts for current page
        const startIndex = (page - 1) * pageSize
        const paginatedPosts = filteredPosts.slice(startIndex, startIndex + pageSize)

        setPosts(paginatedPosts)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
        setLoading(false)
      }
    }

    fetchData()
  }, [page, pageSize, isFilterActive, activeTopics, activeEmotions, dateRange, searchQuery])

  return { posts, totalPosts, totalPages, loading, error }
}
