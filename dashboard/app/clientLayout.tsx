"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { FilterProvider } from "@/contexts/filter-context"
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
  <NuqsAdapter>
    <FilterProvider>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-sky-50 to-white">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </FilterProvider>
    </NuqsAdapter>
  )
}
