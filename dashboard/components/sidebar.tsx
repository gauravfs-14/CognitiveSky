"use client"

import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, BarChart2, Network, Hash, Clock, HelpCircle, Menu, MessageSquare, FileDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useFilters } from "@/contexts/filter-context"

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { topics, emotions, dateRange, searchQuery } = useFilters()

  const sidebarVariants = {
    open: { width: "240px", transition: { duration: 0.3 } },
    closed: { width: "72px", transition: { duration: 0.3 } },
  }

  const textVariants = {
    open: { opacity: 1, display: "block", transition: { delay: 0.1 } },
    closed: { opacity: 0, display: "none", transition: { duration: 0.1 } },
  }

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: BarChart2, label: "Sentiment Analysis", href: "/sentiment" },
    { icon: Network, label: "Topic Clusters", href: "/topics" },
    { icon: Hash, label: "Hashtags & Emojis", href: "/hashtags" },
    { icon: Clock, label: "Timeline", href: "/timeline" },
    { icon: MessageSquare, label: "Posts", href: "/posts" },
    { icon: FileDown, label: "Export Reports", href: "/export" },
    { icon: HelpCircle, label: "Help", href: "/help" },
  ]

  // Function to navigate while preserving filter state
  const navigateTo = (href: string) => {
    // Build the query string manually to preserve all filter parameters
    const queryParams = new URLSearchParams()

    // Add topics if they exist
    if (topics && topics.length > 0) {
      queryParams.set("topics", topics.join(","))
    }

    // Add emotions if they exist
    if (emotions && emotions.length > 0) {
      queryParams.set("emotions", emotions.join(","))
    }

    // Add date range if it exists
    if (dateRange && dateRange.length === 2) {
      const dateRangeStr = `${dateRange[0].toISOString()},${dateRange[1].toISOString()}`
      queryParams.set("dateRange", dateRangeStr)
    }

    // Add search query if it exists
    if (searchQuery) {
      queryParams.set("q", searchQuery)
    }

    // Build the full URL
    const queryString = queryParams.toString()
    const url = queryString ? `${href}?${queryString}` : href

    // Navigate to the new URL
    router.push(url)
  }

  return (
    <motion.div
      variants={sidebarVariants}
      animate={open ? "open" : "closed"}
      className="h-screen bg-gradient-to-b from-sky-600 to-sky-800 text-white shadow-lg z-20 flex flex-col"
    >
      <div className="p-4 flex items-center justify-between border-b border-sky-500/30">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-xl font-bold">CS</span>
          </div>
          <motion.div variants={textVariants} className="ml-3 font-semibold">
            CognitiveSky
          </motion.div>
        </div>
        <button onClick={() => setOpen(!open)} className="lg:hidden text-white/80 hover:text-white">
          <Menu size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                <button
                  onClick={() => navigateTo(item.href)}
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-all duration-200 w-full text-left",
                    isActive ? "bg-sky-700/50 text-white" : "text-white/70 hover:bg-sky-700/30 hover:text-white",
                  )}
                >
                  <item.icon size={20} />
                  <motion.span variants={textVariants} className="ml-3">
                    {item.label}
                  </motion.span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="p-4 border-t border-sky-500/30">
        <div className="flex items-center justify-center">
          <div className="text-xs text-white/70">CognitiveSky v1.0</div>
        </div>
      </div>
    </motion.div>
  )
}
