"use client"

import { useEmojiData } from "@/hooks/useEmojiData"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export function PopularEmojis() {
  const { data, loading, error } = useEmojiData()

  // Take only top 5 emojis
  const topEmojis = data.slice(0, 5)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error loading emoji data</div>
  }

  // Calculate max count for scaling
  const maxCount = Math.max(...topEmojis.map((item) => item.count))

  return (
    <div className="h-64 flex flex-col justify-center">
      <div className="grid grid-cols-5 gap-2">
        {topEmojis.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring" }}
              className="flex items-center justify-center mb-2"
              style={{
                fontSize: `${Math.max(24, (item.count / maxCount) * 48)}px`,
              }}
            >
              {item.emoji}
            </motion.div>
            <div className="text-xs text-center">
              <div className="font-semibold">{item.count}</div>
              <div className="text-gray-500">posts</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
