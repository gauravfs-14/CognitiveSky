"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MessageSquare, ThumbsUp, Repeat, Calendar, User, Hash, Smile } from "lucide-react"
import { usePostsData } from "@/hooks/usePostsData"
import { useTopicData } from "@/hooks/useTopicData"
import { PageTitle } from "@/components/page-title"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function PostsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const { posts, totalPosts, totalPages, loading, error } = usePostsData(currentPage, 10)
  const { topics } = useTopicData()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  // Function to get topic color
  const getTopicColor = (topicId: number) => {
    const topic = topics.find((t) => t.id === topicId)
    return topic?.color || "#60a5fa"
  }

  // Function to get sentiment color
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      case "neutral":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Function to handle page change
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Generate pagination items
  const getPaginationItems = () => {
    const items = []

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink onClick={() => handlePageChange(1)} isActive={currentPage === 1}>
          1
        </PaginationLink>
      </PaginationItem>,
    )

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis1">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue // Skip first and last page as they're always shown

      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => handlePageChange(i)} isActive={currentPage === i}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis2">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => handlePageChange(totalPages)} isActive={currentPage === totalPages}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return items
  }

  // Loading state
  if (loading) {
    return (
      <>
        <PageTitle title="Posts" description="Browse all mental health posts" icon={<MessageSquare size={28} />} />

        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-6 w-full" />
                </CardFooter>
              </Card>
            ))}
        </div>
      </>
    )
  }

  // Error state
  if (error) {
    return (
      <>
        <PageTitle title="Posts" description="Browse all mental health posts" icon={<MessageSquare size={28} />} />

        <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              <p>Error loading posts. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageTitle
        title="Posts"
        description={`Browsing ${totalPosts} mental health posts`}
        icon={<MessageSquare size={28} />}
      />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {posts.map((post) => (
          <motion.div key={post.id} variants={item}>
            <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: getTopicColor(post.topic) }} />
                    <CardTitle className="text-lg">
                      {topics.find((t) => t.id === post.topic)?.label || "Unknown Topic"}
                    </CardTitle>
                  </div>
                  <Badge className={getSentimentColor(post.sentiment)}>
                    {post.sentiment.charAt(0).toUpperCase() + post.sentiment.slice(1)}
                  </Badge>
                </div>
                <CardDescription className="flex items-center mt-1">
                  <User className="h-3 w-3 mr-1" />
                  {post.author}
                  <span className="mx-2">•</span>
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(post.date)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{post.text}</p>

                {/* Hashtags and Emojis */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.hashtags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="bg-sky-50">
                      <Hash className="h-3 w-3 mr-1" />
                      {tag.replace("#", "")}
                    </Badge>
                  ))}

                  {post.emojis.length > 0 && (
                    <Badge variant="outline" className="bg-amber-50">
                      <Smile className="h-3 w-3 mr-1" />
                      {post.emojis.join(" ")}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-3">
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {post.likes}
                  </div>
                  <div className="flex items-center">
                    <Repeat className="h-4 w-4 mr-1" />
                    {post.reposts}
                  </div>
                  {post.emotions.length > 0 && (
                    <div className="flex items-center">
                      <span className="mr-1">Emotions:</span>
                      {post.emotions.map((emotion, i) => (
                        <Badge key={i} variant="outline" className="ml-1 text-xs">
                          {emotion}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {getPaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </motion.div>
    </>
  )
}
