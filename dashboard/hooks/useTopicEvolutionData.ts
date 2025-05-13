"use client";

import { useState, useEffect } from "react";
import { useTopicData } from "./useTopicData";

export interface TopicEvolutionData {
  date: string;
  [key: string]: string | number;
}

export function useTopicEvolutionData() {
  const { topics } = useTopicData();
  const [data, setData] = useState<TopicEvolutionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (topics.length === 0) return;

        // Fetch real data from clean_posts_full.json
        const response = await fetch("/data/clean_posts_full.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const postsData = await response.json();

        // Create a map to organize posts by date and topic
        const dateTopicCounts = new Map<string, Map<string, number>>();

        // Process each post to count topics by date
        let processedPosts = 0;
        let skippedPosts = 0;

        postsData.forEach((post: any) => {
          if (!post.createdAt || post.topic === undefined) {
            skippedPosts++;
            return;
          }

          // Handle the date format (2025-05-11T01:42:31.882Z)
          let date;
          try {
            // Try to parse the date and format it as YYYY-MM-DD
            date = new Date(post.createdAt).toISOString().split("T")[0];
          } catch (e) {
            // If parsing fails, try to use the string split directly
            date = post.createdAt.split("T")[0];
          }

          // Skip if date is invalid
          if (!date) {
            skippedPosts++;
            return;
          }

          processedPosts++;

          // Initialize date entry if doesn't exist
          if (!dateTopicCounts.has(date)) {
            dateTopicCounts.set(date, new Map<string, number>());

            // Initialize all topics with zero for this date
            topics.forEach((topic) => {
              dateTopicCounts.get(date)!.set(topic.label, 0);
            });
          }

          // Get the topic label from our topics array
          const topic = topics.find((t) => t.id === post.topic);
          if (!topic) return;

          const topicLabel = topic.label;

          // Update count for this date and topic
          const topicCounts = dateTopicCounts.get(date)!;
          topicCounts.set(topicLabel, (topicCounts.get(topicLabel) || 0) + 1);
        });

        console.log(
          `Posts data: processed ${processedPosts}, skipped ${skippedPosts}`
        );
        console.log(`Found data for ${dateTopicCounts.size} unique dates`);

        // Convert to array and sort by date
        const dates = Array.from(dateTopicCounts.keys()).sort();

        // Log some debug info
        console.log(`Found ${dates.length} unique dates in the data`);

        // Choose evenly distributed dates for the chart if we have more than 10
        let selectedDates = dates;
        if (dates.length > 10) {
          selectedDates = [];
          const step = Math.max(1, Math.floor((dates.length - 1) / 9)); // Ensure we get at most 10 points

          // Always include the first date
          selectedDates.push(dates[0]);

          // Add evenly spaced dates
          for (let i = step; i < dates.length - step; i += step) {
            selectedDates.push(dates[i]);
            // Stop if we reached our target count
            if (selectedDates.length >= 9) break;
          }

          // Always include the last date
          if (!selectedDates.includes(dates[dates.length - 1])) {
            selectedDates.push(dates[dates.length - 1]);
          }

          // Ensure dates are sorted
          selectedDates.sort();
        }

        console.log(
          `Selected ${
            selectedDates.length
          } dates for visualization: ${selectedDates.join(", ")}`
        );

        // Create the final data array
        const topicEvolutionData: TopicEvolutionData[] = selectedDates.map(
          (date) => {
            const dataPoint: TopicEvolutionData = { date };

            // Add count for each topic
            topics.forEach((topic) => {
              const topicCounts = dateTopicCounts.get(date);
              // Use 0 if no data exists for this topic on this date
              dataPoint[topic.label] = topicCounts?.get(topic.label) || 0;
            });

            return dataPoint;
          }
        );

        setData(topicEvolutionData);

        // Log stats about the data
        const totalPosts = topicEvolutionData.reduce((sum, dataPoint) => {
          let dateSum = 0;
          topics.forEach((topic) => {
            dateSum += (dataPoint[topic.label] as number) || 0;
          });
          return sum + dateSum;
        }, 0);

        console.log(`Total posts processed for chart: ${totalPosts}`);
        console.log(`First data point:`, topicEvolutionData[0]);
        console.log(
          `Last data point:`,
          topicEvolutionData[topicEvolutionData.length - 1]
        );

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setLoading(false);
      }
    };

    if (topics.length > 0) {
      fetchData();
    }
  }, [topics]);

  return { data, loading, error };
}
