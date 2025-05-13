"use client"

import { motion } from "framer-motion"
import { HelpCircle, Book, MessageSquare, FileText, ExternalLink } from "lucide-react"
import { PageTitle } from "@/components/page-title"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HelpPage() {
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

  const faqs = [
    {
      question: "What is CognitiveSky?",
      answer:
        "CognitiveSky is a dashboard for visualizing and exploring mental health narratives from Bluesky data. It provides insights into sentiment, emotions, topics, and trends in mental health discussions.",
    },
    {
      question: "How is the data collected?",
      answer:
        "The data is collected from public posts on the Bluesky platform that contain mental health related content. The data is then processed and analyzed using natural language processing techniques.",
    },
    {
      question: "How often is the data updated?",
      answer: "By default, the data is updated every 5 minutes. You can change this interval in the Settings page.",
    },
    {
      question: "What do the different sentiment labels mean?",
      answer:
        "Positive sentiment indicates content with a generally optimistic or uplifting tone. Neutral sentiment indicates factual or balanced content. Negative sentiment indicates content with a pessimistic, critical, or distressed tone.",
    },
    {
      question: "How are topics determined?",
      answer:
        "Topics are determined using a combination of keyword analysis and machine learning clustering techniques. Each post is assigned to the topic that best matches its content.",
    },
  ]

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
              <CardDescription>Common questions about the CognitiveSky dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
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
              <CardDescription>Helpful resources and documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Book className="h-5 w-5 mr-2 text-sky-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium">User Guide</h3>
                    <p className="text-sm text-gray-500">Comprehensive guide to using the dashboard</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FileText className="h-5 w-5 mr-2 text-sky-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium">API Documentation</h3>
                    <p className="text-sm text-gray-500">Technical documentation for the API</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MessageSquare className="h-5 w-5 mr-2 text-sky-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Community Forum</h3>
                    <p className="text-sm text-gray-500">Discuss with other users and get help</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" /> Visit Knowledge Base
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-1 md:col-span-3">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Get help from our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="mb-4">Need help with something not covered in the documentation?</p>
                <Button className="bg-sky-600 hover:bg-sky-700">
                  <MessageSquare className="mr-2 h-4 w-4" /> Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  )
}
