"use client"

import { useState, useEffect } from "react"

export interface NetworkNode {
  id: string
  group: number
  posts: number
  label?: string
}

export interface NetworkLink {
  source: string
  target: string
  value?: number
}

export function useNetworkData() {
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [links, setLinks] = useState<NetworkLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll generate some random network data
        const nodeCount = 50
        const staticNodes: NetworkNode[] = Array(nodeCount)
          .fill(0)
          .map((_, i) => ({
            id: `user_${i}`,
            group: Math.floor(Math.random() * 5),
            posts: Math.floor(Math.random() * 10) + 1,
            label: `User ${i}`,
          }))

        // Generate some random links
        const staticLinks: NetworkLink[] = []
        for (let i = 0; i < nodeCount; i++) {
          const linkCount = Math.floor(Math.random() * 3) + 1
          for (let j = 0; j < linkCount; j++) {
            const target = Math.floor(Math.random() * nodeCount)
            if (target !== i) {
              staticLinks.push({
                source: `user_${i}`,
                target: `user_${target}`,
                value: Math.floor(Math.random() * 5) + 1,
              })
            }
          }
        }

        setNodes(staticNodes)
        setLinks(staticLinks)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { nodes, links, loading, error }
}
