"use client";

import { motion } from "framer-motion";
import { Hash } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { PopularHashtags } from "@/components/charts/popular-hashtags";
import { PopularEmojis } from "@/components/charts/popular-emojis";
import { EmojiSentimentCorrelation } from "@/components/charts/emoji-sentiment-correlation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHashtagData } from "@/hooks/useHashtagData";

export default function HashtagsPage() {
  const { data: hashtagData } = useHashtagData();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      <PageTitle
        title="Hashtags & Emojis"
        description="Explore popular hashtags and emojis in mental health discussions"
        icon={<Hash size={28} />}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <motion.div variants={item} className="col-span-1">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Popular Hashtags</CardTitle>
              <CardDescription>
                Most used hashtags in mental health discussions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PopularHashtags />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-1">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Popular Emojis</CardTitle>
              <CardDescription>
                Most used emojis in mental health discussions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PopularEmojis />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-1 md:col-span-2">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Hashtag Cloud</CardTitle>
              <CardDescription>
                Visual representation of hashtag frequency
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64 p-6">
              {/* TODO: use word-cloud package instead */}
              <div className="h-full flex flex-wrap items-center justify-center gap-3">
                {hashtagData.map((tag, index) => {
                  // Calculate size based on count
                  const minSize = 12;
                  const maxSize = 32;
                  const maxCount = Math.max(...hashtagData.map((t) => t.count));
                  const size =
                    minSize + (tag.count / maxCount) * (maxSize - minSize);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, type: "spring" }}
                      className="text-sky-600 hover:text-sky-800 transition-colors cursor-pointer"
                      style={{ fontSize: `${size}px` }}
                    >
                      {tag.hashtag}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-1 md:col-span-2">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Emoji Sentiment Correlation</CardTitle>
              <CardDescription>
                How emojis correlate with sentiment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmojiSentimentCorrelation />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}
