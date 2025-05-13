"use client";

import { useSentimentByTopicData } from "@/hooks/useSentimentByTopicData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

export function SentimentByTopic() {
  const { data, loading, error } = useSentimentByTopicData();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Error loading sentiment by topic data
      </div>
    );
  }

  return (
    <div className="h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="topic"
            tick={{ fontSize: 12 }}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "none",
            }}
          />
          <Legend />
          <Bar dataKey="positive" name="Positive" stackId="a" fill="#4ade80" />
          <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#60a5fa" />
          <Bar dataKey="negative" name="Negative" stackId="a" fill="#f87171" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
