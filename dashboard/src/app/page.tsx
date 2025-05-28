"use client"

import { Home } from "lucide-react"
import Dashboard from "@/components/dashboard"
import { PageTitle } from "@/components/page-title"

export default function HomePage() {
  return (
    <>
      <PageTitle
        title="Dashboard Overview"
        description="Comprehensive view of mental health narratives on Bluesky"
        icon={<Home size={28} />}
      />
      <Dashboard />
    </>
  )
}
