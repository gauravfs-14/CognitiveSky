"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import VisxWordCloud from "./visx-wordcloud";

interface WordCloudProps {
  words: { text: string; value: number }[];
  title: string;
  description?: string;
  height?: number;
}

export const WordCloud = ({
  words,
  title,
  description,
  height = 400,
}: WordCloudProps) => {
  return (
    <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent style={{ height: `${height}px` }} className="relative">
        <VisxWordCloud words={words} width={"100%"} height={height} />
      </CardContent>
    </Card>
  );
};
