"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { FiltersSection } from "@/components/dashboard/filters-section"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { FinancialAnalysis } from "@/components/dashboard/financial-analysis"
import { ClaimsAnalysis } from "@/components/dashboard/claims-analysis"
import { ProcessesTable } from "@/components/dashboard/processes-table"

export default function DashboardPage() {
  const [activeNavItem, setActiveNavItem] = useState("dashboard")

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <SidebarNav activeItem={activeNavItem} onItemClick={setActiveNavItem} />

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {/* Header */}
        <DashboardHeader />

        {/* Filters */}
        <FiltersSection />

        {/* Content Sections */}
        <div className="pb-8">
          {/* KPI Cards */}
          <KpiCards />

          {/* Financial Risk Analysis */}
          <FinancialAnalysis />

          {/* Claims Analysis */}
          <ClaimsAnalysis />

          {/* Processes Table */}
          <ProcessesTable />
        </div>
      </main>
    </div>
  )
}
