"use client";

import { motion } from "framer-motion";
import {
  HelpCircle,
  MessageSquare,
  FileText,
  ExternalLink,
  Code2,
} from "lucide-react";
import { PageTitle } from "@/components/page-title";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

export default function HelpPage() {
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

  const faqs = [
    {
      question: "What is CognitiveSky?",
      answer:
        "CognitiveSky is a research-grade dashboard for visualizing, analyzing, and exploring mental health narratives on the Bluesky platform. It ingests public posts in real time via the Firehose API, processes them through a robust NLP pipeline, and generates insights into sentiment, emotion, topic trends, and user behavior. The dashboard enables both high-level overview and deep narrative investigation, making it suitable for researchers, policymakers, and mental health professionals.",
    },
    {
      question: "How is the data collected?",
      answer:
        "Posts are collected from Bluesky’s public Firehose stream 24/7 and filtered using mental health-related keyword matching. The data is stored in Supabase as the initial ingestion layer. A labeling pipeline classifies each post with sentiment and emotion labels using transformer-based models, and assigns semantic topics using topic modeling techniques like TF-IDF vectorization and NMF. Labeled data is migrated to a local-first SQLite-compatible Turso database optimized for analysis.",
    },
    {
      question: "How frequently is the data updated?",
      answer:
        "Data ingestion runs continuously, while NLP labeling, topic modeling, and summary generation are executed daily via a GitHub Actions workflow. This ensures that the dashboard reflects both near-real-time content and daily narrative shifts. Summaries such as volume trends, emotional distributions, and top hashtags/emojis are recalculated each midnight UTC and stored as JSON files.",
    },
    {
      question: "What are the sentiment labels and how are they determined?",
      answer:
        "Sentiment labels include Positive, Neutral, and Negative. These are inferred using the CardiffNLP RoBERTa sentiment model, which is fine-tuned for short social text. Positive reflects encouraging or hopeful tones, Neutral includes factual or objective posts, and Negative captures distressed, critical, or harmful expressions. These labels are further correlated with emoji and hashtag usage in the dashboard.",
    },
    {
      question: "How is emotion detection handled?",
      answer:
        "Emotions are classified using the 'j-hartmann/emotion-english-distilroberta-base' transformer model, which supports fine-grained categories such as joy, sadness, anger, fear, surprise, and love. Each post is tagged with the most probable emotion, and distributions are tracked over time and by topic.",
    },
    {
      question: "How are topics generated?",
      answer:
        "Topics are derived using an unsupervised machine learning approach. Posts are vectorized using TF-IDF, and NMF (Non-negative Matrix Factorization) is used to extract latent topics. Each topic includes top keywords and is tracked for daily volume, sentiment, emotion, and associated hashtags/emojis. This allows exploration of emerging mental health narratives.",
    },
    {
      question: "What does the Word Cloud show?",
      answer:
        "The Word Cloud visualizes the most frequent hashtags or emojis used in mental health-related posts, either globally or per sentiment/emotion/topic filter. It updates daily based on a 7-day rolling window, helping identify trending symbols and expressions within mental health discourse.",
    },
    {
      question: "How is historical data handled?",
      answer:
        "All labeled posts are stored in Turso, allowing for full historical analysis. Snapshots of summary statistics are computed and saved per day. The dashboard visualizes both total aggregate statistics (e.g., total posts, most used hashtags) and time series for the past 7 days. Older data is not discarded and can be queried programmatically if needed.",
    },
    {
      question: "What infrastructure powers CognitiveSky?",
      answer:
        "CognitiveSky runs a modular architecture: ingestion via a Node.js-based Firehose listener, storage in Supabase, labeling with Python + HuggingFace models, and a summary generator script using scikit-learn and libsql for Turso. All components are orchestrated with GitHub Actions and environment-configured pipelines for minimal overhead and open reproducibility.",
    },
    {
      question: "Can I use this data for research or policy work?",
      answer:
        "Yes. All analyses are based on publicly available posts and adhere to ethical considerations. The dashboard supports open exploration for academic, social, and healthcare research, and can be extended to custom queries and comparative studies. Daily JSON summaries are version-controlled and publicly exportable for transparency.",
    },
  ];

  return (
    <>
      <PageTitle
        title="Help & Documentation"
        description="Learn how to use the CognitiveSky dashboard"
        icon={<HelpCircle size={28} />}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="col-span-1 md:col-span-2">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Common questions about the CognitiveSky dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-1">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Resources</CardTitle>
              <CardDescription>
                Technical references and tools for working with CognitiveSky
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <ExternalLink className="h-8 w-8 mr-2 text-sky-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Project Overview</h3>
                    <p className="text-sm text-gray-500">
                      Introduction to the CognitiveSky ecosystem including
                      ingestion, labeling, snapshotting, and dashboard features.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FileText className="h-8 w-8 mr-2 text-sky-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium">API Documentation</h3>
                    <p className="text-sm text-gray-500">
                      Static JSON formats and schema guides for integrating
                      summaries into your own tools.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Code2 className="h-8 w-8 mr-2 text-sky-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Pipeline Source Code</h3>
                    <p className="text-sm text-gray-500">
                      Python scripts for Firehose ingestion, NLP annotation,
                      topic modeling, and Turso migration.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MessageSquare className="h-8 w-8 mr-2 text-sky-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Community Forum</h3>
                    <p className="text-sm text-gray-500">
                      Connect with others, ask questions, or share insights
                      related to mental health analysis.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Link
                href="https://github.com/gauravfs-14/CognitiveSky"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full cursor-pointer"
              >
                <Button variant="outline" className="w-full cursor-pointer">
                  <ExternalLink className="mr-2 h-4 w-4" /> View GitHub
                  Repository
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-1 md:col-span-3">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Need Assistance?</CardTitle>
              <CardDescription>
                We're here to help you get the most out of CognitiveSky
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="text-center py-6 space-y-4">
                <p className="text-sm text-gray-600">
                  Encountered a bug, need help with the data, or have a feature
                  request? Join the conversation or open an issue on GitHub.
                </p>
                <Link
                  href="https://github.com/gauravfs-14/CognitiveSky/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  <Button className={"cursor-pointer"}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Open GitHub Issue
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}
