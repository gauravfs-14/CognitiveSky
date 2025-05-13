"use client";

import { useState, useEffect } from "react";
import { useEmojiData } from "./useEmojiData";

export interface EmojiSentimentData {
  emoji: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export function useEmojiSentimentData() {
  const { data: emojis } = useEmojiData();
  const [data, setData] = useState<EmojiSentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (emojis.length === 0) return;

        // Fetch posts data from clean_posts_full.json
        const response = await fetch("/data/clean_posts_full.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const postsData = await response.json();

        // Process top emojis and analyze their sentiment distribution
        const emojiSentimentMap = new Map<
          string,
          { positive: number; neutral: number; negative: number; total: number }
        >();

        // Initialize emoji sentiment counts
        emojis.slice(0, 8).forEach((emoji) => {
          emojiSentimentMap.set(emoji.emoji, {
            positive: 0,
            neutral: 0,
            negative: 0,
            total: 0,
          });
        });

        // Count sentiments for posts containing each emoji
        postsData.forEach((post: any) => {
          if (!post.text || !post.sentiment) return;

          // Check each tracked emoji
          emojiSentimentMap.forEach((sentimentCounts, emojiChar) => {
            if (post.text.includes(emojiChar)) {
              // Increment appropriate sentiment counter
              if (post.sentiment === "label_2") {
                sentimentCounts.positive += 1;
              } else if (post.sentiment === "label_1") {
                sentimentCounts.neutral += 1;
              } else if (post.sentiment === "label_0") {
                sentimentCounts.negative += 1;
              }
              sentimentCounts.total += 1;
            }
          });
        });

        // Convert map to array
        const emojiSentimentData: EmojiSentimentData[] = emojis
          .slice(0, 8)
          .map((emoji) => {
            const sentiments = emojiSentimentMap.get(emoji.emoji) || {
              positive: 0,
              neutral: 0,
              negative: 0,
              total: 0,
            };
            return {
              emoji: emoji.emoji,
              positive: sentiments.positive,
              neutral: sentiments.neutral,
              negative: sentiments.negative,
              total: sentiments.total || emoji.count, // Fallback to original count if no posts found
            };
          })
          .filter((item) => item.total > 0); // Only include emojis that were found in posts

        setData(emojiSentimentData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setLoading(false);
      }
    };

    if (emojis.length > 0) {
      fetchData();
    }
  }, [emojis]);

  return { data, loading, error };
}
