"use client"
import { useState } from "react"
import { Menu, Filter, FilterX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FilterSheet } from "@/components/filter-sheet"
import { useFilters } from "@/contexts/filter-context"

interface TopBarProps {
  setSidebarOpen: (open: boolean) => void
  sidebarOpen: boolean
}

export function TopBar({ setSidebarOpen, sidebarOpen }: TopBarProps) {
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const { isFilterActive, resetFilters } = useFilters()

  return (
    <>
      <header className="h-16 border-b border-sky-100 bg-white/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2 text-sky-700"
          >
            <Menu size={20} />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          <h1 className="text-xl font-semibold text-sky-900 hidden md:block">Mental Health Narratives Dashboard</h1>
        </div>

        <div className="flex items-center">
          <div className="relative">
            {isFilterActive && <span className="absolute -top-1 -right-1 w-2 h-2 bg-sky-500 rounded-full"></span>}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFilterSheetOpen(true)}
              className="text-sky-700"
              aria-label="Open filters"
            >
              <Filter size={20} />
            </Button>
          </div>

          {isFilterActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-sky-700 ml-2"
              aria-label="Clear filters"
            >
              <FilterX size={16} className="mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>
      </header>

      <FilterSheet isOpen={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} />
    </>
  )
}
