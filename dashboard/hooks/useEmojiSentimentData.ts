"use client"

import { useState, useEffect } from "react"
import { useEmojiData } from "./useEmojiData"

export interface EmojiSentimentData {
  emoji: string
  positive: number
  neutral: number
  negative: number
  total: number
}

export function useEmojiSentimentData() {
  const { data: emojis } = useEmojiData()
  const [data, setData] = useState<EmojiSentimentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (emojis.length === 0) return

        // In a real app, this would be an API call
        // For now, we'll generate random sentiment data for each emoji
        const staticData: EmojiSentimentData[] = emojis.slice(0, 8).map((emoji) => {
          const total = emoji.count
          const positive = Math.floor(Math.random() * 0.7 * total)
          const negative = Math.floor(Math.random() * 0.5 * total)
          const neutral = total - positive - negative

          return {
            emoji: emoji.emoji,
            positive,
            neutral,
            negative,
            total,
          }
        })

        setData(staticData)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
        setLoading(false)
      }
    }

    if (emojis.length > 0) {
      fetchData()
    }
  }, [emojis])

  return { data, loading, error }
}
