"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { FiltersSection } from "@/components/dashboard/filters-section"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { FinancialAnalysis } from "@/components/dashboard/financial-analysis"
import { ClaimsAnalysis } from "@/components/dashboard/claims-analysis"
import { ProcessesTable } from "@/components/dashboard/processes-table"
import { ProcessosPage } from "@/components/dashboard/processos-page"
import { ConfiguracoesPage } from "@/components/dashboard/configuracoes-page"

export default function DashboardPage() {
  const [activeNavItem, setActiveNavItem] = useState("dashboard")

  const getBreadcrumb = () => {
    switch (activeNavItem) {
      case "dashboard":
        return "Dashboard"
      case "processos":
        return "Processos"
      case "configuracoes":
        return "Configurações"
      default:
        return "Dashboard"
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <SidebarNav activeItem={activeNavItem} onItemClick={setActiveNavItem} />

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {/* Header */}
        <DashboardHeader breadcrumb={getBreadcrumb()} />

        {/* Content based on active nav item */}
        <div className="pb-8">
          {activeNavItem === "dashboard" && (
            <>
              {/* Filters */}
              <FiltersSection />

              {/* KPI Cards */}
              <KpiCards />

              {/* Financial Risk Analysis */}
              <FinancialAnalysis />

              {/* Claims Analysis */}
              <ClaimsAnalysis />

              {/* Processes Table */}
              <ProcessesTable />
            </>
          )}

          {activeNavItem === "processos" && (
            <div className="px-8 pt-6">
              <ProcessosPage />
            </div>
          )}

          {activeNavItem === "configuracoes" && (
            <div className="px-8 pt-6">
              <ConfiguracoesPage />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
