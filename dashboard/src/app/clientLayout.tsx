"use client";

import type React from "react";
import { useState, Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-sky-50 to-white">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex flex-col flex-1 overflow-y-auto">
          <TopBar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
          <main className=" p-4 md:p-6 continer max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </Suspense>
  );
}
