"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  FileDown,
  BarChart2,
  PieChart,
  LineChart,
  Download,
  Eye,
  FileText,
  FileSpreadsheetIcon as FileCsv,
  FileJson,
} from "lucide-react"
import { PageTitle } from "@/components/page-title"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SentimentOverview } from "@/components/charts/sentiment-overview"
import { EmotionDistribution } from "@/components/charts/emotion-distribution"
import { TopicMap } from "@/components/charts/topic-map"
import { TimelineChart } from "@/components/charts/timeline-chart"

export default function ExportPage() {
  const [reportType, setReportType] = useState("sentiment")
  const [exportFormat, setExportFormat] = useState("pdf")
  const [timeRange, setTimeRange] = useState("30days")

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

  // Function to handle export
  const handleExport = () => {
    // In a real app, this would trigger an API call to generate the export
    alert(`Exporting ${reportType} report as ${exportFormat} for the last ${timeRange}`)
  }

  // Report type descriptions
  const reportDescriptions = {
    sentiment: "Analysis of positive, negative, and neutral sentiment in mental health discussions",
    emotion: "Breakdown of emotional content in mental health posts",
    topic: "Visualization of topic clusters and their relationships",
    timeline: "Trends in mental health discussions over time",
    comprehensive: "Complete analysis including all metrics and visualizations",
  }

  return (
    <>
      <PageTitle
        title="Export Reports"
        description="Generate and download reports from mental health data"
        icon={<FileDown size={28} />}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Export Options */}
        <motion.div variants={item} className="md:col-span-1">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Configure your report export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Type */}
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sentiment">
                      <div className="flex items-center">
                        <BarChart2 className="h-4 w-4 mr-2" />
                        Sentiment Analysis
                      </div>
                    </SelectItem>
                    <SelectItem value="emotion">
                      <div className="flex items-center">
                        <PieChart className="h-4 w-4 mr-2" />
                        Emotion Distribution
                      </div>
                    </SelectItem>
                    <SelectItem value="topic">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Topic Analysis
                      </div>
                    </SelectItem>
                    <SelectItem value="timeline">
                      <div className="flex items-center">
                        <LineChart className="h-4 w-4 mr-2" />
                        Timeline Analysis
                      </div>
                    </SelectItem>
                    <SelectItem value="comprehensive">
                      <div className="flex items-center">
                        <FileDown className="h-4 w-4 mr-2" />
                        Comprehensive Report
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {reportDescriptions[reportType as keyof typeof reportDescriptions]}
                </p>
              </div>

              {/* Time Range */}
              <div className="space-y-2">
                <Label htmlFor="time-range">Time Range</Label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger id="time-range">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="year">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Export Format */}
              <div className="space-y-2">
                <Label>Export Format</Label>
                <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label htmlFor="pdf" className="flex items-center cursor-pointer">
                      <FileText className="h-4 w-4 mr-2" />
                      PDF Document
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv" className="flex items-center cursor-pointer">
                      <FileCsv className="h-4 w-4 mr-2" />
                      CSV Spreadsheet
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="json" id="json" />
                    <Label htmlFor="json" className="flex items-center cursor-pointer">
                      <FileJson className="h-4 w-4 mr-2" />
                      JSON Data
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-sky-600 hover:bg-sky-700" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Report Preview */}
        <motion.div variants={item} className="md:col-span-2">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-sky-100 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Report Preview</CardTitle>
                  <CardDescription>Preview of your selected report</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Full Preview
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={reportType} value={reportType} onValueChange={setReportType}>
                <TabsList className="grid grid-cols-5 mb-4">
                  <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                  <TabsTrigger value="emotion">Emotion</TabsTrigger>
                  <TabsTrigger value="topic">Topic</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="comprehensive">All</TabsTrigger>
                </TabsList>

                <TabsContent value="sentiment" className="h-[400px]">
                  <SentimentOverview />
                </TabsContent>

                <TabsContent value="emotion" className="h-[400px]">
                  <EmotionDistribution />
                </TabsContent>

                <TabsContent value="topic" className="h-[400px]">
                  <TopicMap />
                </TabsContent>

                <TabsContent value="timeline" className="h-[400px]">
                  <TimelineChart />
                </TabsContent>

                <TabsContent value="comprehensive" className="h-[400px]">
                  <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="col-span-2 h-48">
                      <SentimentOverview />
                    </div>
                    <div className="h-48">
                      <EmotionDistribution />
                    </div>
                    <div className="h-48">
                      <TimelineChart />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="text-sm text-gray-500">
                Data range:{" "}
                {timeRange === "7days"
                  ? "Last 7 days"
                  : timeRange === "30days"
                    ? "Last 30 days"
                    : timeRange === "90days"
                      ? "Last 90 days"
                      : timeRange === "year"
                        ? "Last year"
                        : "All time"}
              </div>
              <div className="text-sm text-gray-500">Format: {exportFormat.toUpperCase()}</div>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </>
  )
}
