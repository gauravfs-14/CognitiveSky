"use client"

import { useEffect, useRef } from "react"
import { useNetworkData } from "@/hooks/useNetworkData"
import { Loader2 } from "lucide-react"
import ForceGraph3D from "3d-force-graph"
import SpriteText from "three-spritetext"

export function NetworkGraph() {
  const { nodes, links, loading, error } = useNetworkData()
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<any>(null)

  useEffect(() => {
    if (loading || error || !containerRef.current || nodes.length === 0) return

    // Initialize the graph
    if (!graphRef.current) {
      graphRef.current = ForceGraph3D()
        .backgroundColor("#f8fafc")
        .nodeColor((node) => {
          const colors = ["#60a5fa", "#f87171", "#4ade80", "#fbbf24", "#a78bfa"]
          return colors[node.group % colors.length]
        })
        .nodeLabel((node) => `${node.label} (${node.posts} posts)`)
        .nodeRelSize(6)
        .linkWidth((link) => link.value || 1)
        .linkOpacity(0.5)
        .linkDirectionalParticles(2)
        .linkDirectionalParticleWidth((link) => link.value || 1)
        .nodeThreeObject((node) => {
          const sprite = new SpriteText(node.label)
          sprite.color = "#fff"
          sprite.backgroundColor = "#60a5fa"
          sprite.padding = 2
          sprite.textHeight = 3
          sprite.borderRadius = 2
          return sprite
        })
    }

    // Update data and render
    graphRef.current
      .graphData({ nodes, links })
      .width(containerRef.current.clientWidth)
      .height(containerRef.current.clientHeight)(containerRef.current)

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && graphRef.current) {
        graphRef.current.width(containerRef.current.clientWidth).height(containerRef.current.clientHeight)
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (graphRef.current && containerRef.current) {
        // Clean up
        containerRef.current.innerHTML = ""
        graphRef.current = null
      }
    }
  }, [nodes, links, loading, error])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  if (error) {
    return <div className="flex justify-center items-center h-full text-red-500">Error loading network data</div>
  }

  return <div ref={containerRef} className="w-full h-full" />
}
