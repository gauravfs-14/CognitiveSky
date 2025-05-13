"use client";

import { useState, useEffect } from "react";
import { useFilters } from "@/contexts/filter-context";

export interface Post {
  id: string;
  text: string;
  date: string;
  author: string;
  likes: number;
  reposts: number;
  topic: number;
  sentiment: "positive" | "neutral" | "negative";
  emotions: string[];
  hashtags: string[];
  emojis: string[];
}

export function usePostsData(page = 1, pageSize = 10) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [allPostsData, setAllPostsData] = useState<Post[]>([]);

  // Get filters
  const filters = useFilters() || {
    topics: [],
    emotions: [],
    dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
    searchQuery: "",
    isFilterActive: false,
  };

  const {
    topics: activeTopics,
    emotions: activeEmotions,
    dateRange,
    searchQuery,
    isFilterActive,
  } = filters;

  // Fetch all posts data from JSON file
  useEffect(() => {
    const loadAllPosts = async () => {
      try {
        if (allPostsData.length > 0) return; // Only load once

        const response = await fetch("/data/clean_posts_full.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const postsData = await response.json();

        // Transform the raw data to match our Post interface
        const transformedPosts: Post[] = postsData.map((post: any) => {
          // Extract hashtags from text
          const hashtags = (post.text?.match(/#\w+/g) || []) as string[];

          // Extract emojis from text
          const emojiRegex = /[\p{Emoji}]/gu;
          const emojis = (post.text?.match(emojiRegex) || []) as string[];

          // Map sentiment labels to our format
          let sentiment: "positive" | "neutral" | "negative";
          if (post.sentiment === "label_2") {
            sentiment = "positive";
          } else if (post.sentiment === "label_1") {
            sentiment = "neutral";
          } else {
            sentiment = "negative";
          }

          // Get the emotion as an array
          const emotions = post.emotion
            ? [post.emotion.charAt(0).toUpperCase() + post.emotion.slice(1)]
            : [];

          return {
            id:
              post.postId ||
              `post_${Math.random().toString(36).substring(2, 11)}`,
            text: post.text || "",
            date: post.createdAt || new Date().toISOString(),
            author: post.authorDid || "Anonymous",
            likes: Math.floor(Math.random() * 50), // Random likes since not in data
            reposts: Math.floor(Math.random() * 20), // Random reposts since not in data
            topic: post.topic !== undefined ? post.topic : 0,
            sentiment,
            emotions,
            hashtags,
            emojis,
          };
        });

        setAllPostsData(transformedPosts);
        console.log(`Loaded ${transformedPosts.length} posts from real data`);
      } catch (err) {
        console.error("Error loading posts data:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to load posts data")
        );
      }
    };

    loadAllPosts();
  }, [allPostsData.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Make sure we have data loaded
        if (allPostsData.length === 0) {
          return; // Wait for data to load
        }

        // Filter posts based on active filters
        let filteredPosts = [...allPostsData];

        if (isFilterActive) {
          // Filter by topics
          if (activeTopics.length > 0) {
            filteredPosts = filteredPosts.filter((post) =>
              activeTopics.includes(post.topic)
            );
          }

          // Filter by emotions
          if (activeEmotions.length > 0) {
            filteredPosts = filteredPosts.filter((post) =>
              post.emotions.some((emotion: string) =>
                activeEmotions.includes(emotion)
              )
            );
          }

          // Filter by date range
          if (dateRange && dateRange.length === 2) {
            const startDate = new Date(dateRange[0]);
            const endDate = new Date(dateRange[1]);

            filteredPosts = filteredPosts.filter((post) => {
              const postDate = new Date(post.date);
              return postDate >= startDate && postDate <= endDate;
            });
          }

          // Filter by search query
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredPosts = filteredPosts.filter(
              (post) =>
                post.text.toLowerCase().includes(query) ||
                post.author.toLowerCase().includes(query) ||
                post.hashtags.some((tag: string) =>
                  tag.toLowerCase().includes(query)
                )
            );
          }
        }

        // Sort by date (newest first)
        filteredPosts.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Calculate pagination
        setTotalPosts(filteredPosts.length);
        setTotalPages(Math.ceil(filteredPosts.length / pageSize));

        // Get posts for current page
        const startIndex = (page - 1) * pageSize;
        const paginatedPosts = filteredPosts.slice(
          startIndex,
          startIndex + pageSize
        );

        setPosts(paginatedPosts);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setLoading(false);
      }
    };

    fetchData();
  }, [
    page,
    pageSize,
    isFilterActive,
    activeTopics,
    activeEmotions,
    dateRange,
    searchQuery,
    allPostsData,
  ]);

  return { posts, totalPosts, totalPages, loading, error };
}
