"use client"

import { useState, useEffect } from "react"

export interface EmojiData {
  emoji: string
  count: number
}

export function useEmojiData() {
  const [data, setData] = useState<EmojiData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use static data
        const staticData: EmojiData[] = [
          { emoji: "😭", count: 530 },
          { emoji: "❤️", count: 423 },
          { emoji: "😊", count: 387 },
          { emoji: "🙏", count: 342 },
          { emoji: "😔", count: 321 },
          { emoji: "✨", count: 298 },
          { emoji: "😢", count: 276 },
          { emoji: "🥺", count: 254 },
          { emoji: "😌", count: 231 },
          { emoji: "🤗", count: 198 },
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
