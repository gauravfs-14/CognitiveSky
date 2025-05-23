"use client";

import { useEmojiSentimentData } from "@/hooks/useEmojiSentimentData";
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

export function EmojiSentimentCorrelation() {
  const { data, loading, error } = useEmojiSentimentData();

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
        Error loading emoji sentiment data
      </div>
    );
  }

  // Custom tick formatter for emoji display
  const EmojiTick = (props: any) => {
    const { x, y, payload } = props;

    // Check if payload exists before accessing its properties
    if (!payload) {
      return <g />;
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fontSize="16px">
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="emoji" tick={EmojiTick} width={40} />
          <Tooltip
            formatter={(value, name) => [value, name]}
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
