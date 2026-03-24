"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

// Importações dos novos componentes de Abas (agora rotas do sidebar)
import { VisaoGeralTab } from "@/components/dashboard/tabs/visao-geral-tab"
import { ProcessosTab } from "@/components/dashboard/tabs/processos-tab"
import { LaudosTab } from "@/components/dashboard/tabs/laudos-tab"
import { ValoresTab } from "@/components/dashboard/tabs/valores-tab"

// Páginas secundárias
import { ConfiguracoesPage } from "@/components/dashboard/configuracoes-page"
import { cn } from "@/lib/utils"

export default function DashboardClient({ 
  processos,
  pedidosInicial,
  pedidosSentenca,
  pedidosAcordao,
  laudos,
  valores
}: { 
  processos: any[],
  pedidosInicial: any[],
  pedidosSentenca: any[],
  pedidosAcordao: any[],
  laudos: any[],
  valores: any[]
}) {
  const [activeNavItem, setActiveNavItem] = useState("dashboard")
  const [isCollapsed, setIsCollapsed] = useState(false)

  const getBreadcrumb = () => {
    switch (activeNavItem) {
      case "dashboard":
        return "Visão Geral"
      case "processos":
        return "Processos"
      case "laudos":
        return "Laudos"
      case "valores":
        return "Valores"
      case "configuracoes":
        return "Configurações"
      default:
        return "Visão Geral"
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <SidebarNav 
        activeItem={activeNavItem} 
        onItemClick={setActiveNavItem} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content */}
      <main className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-20" : "ml-64")}>
        {/* Header */}
        <DashboardHeader breadcrumb={getBreadcrumb()} />

        {/* Content based on active nav item */}
        <div className="pb-8">
          
          {/* 1. Visão Geral (Antigo Dashboard com Cards) */}
          {activeNavItem === "dashboard" && (
            <div className="px-8 pt-6 animate-in fade-in-50 duration-500">
              <VisaoGeralTab processos={processos} />
            </div>
          )}

          {/* 2. Processos */}
          {activeNavItem === "processos" && (
            <div className="px-8 pt-6 animate-in fade-in-50 duration-500">
              <ProcessosTab 
                processos={processos} 
                pedidosInicial={pedidosInicial} 
                pedidosSentenca={pedidosSentenca} 
                pedidosAcordao={pedidosAcordao} 
              />
            </div>
          )}

          {/* 3. Laudos */}
          {activeNavItem === "laudos" && (
            <div className="px-8 pt-6 animate-in fade-in-50 duration-500">
               <LaudosTab laudos={laudos} />
            </div>
          )}

          {/* 4. Valores */}
          {activeNavItem === "valores" && (
            <div className="px-8 pt-6 animate-in fade-in-50 duration-500">
               <ValoresTab valores={valores} />
            </div>
          )}

          {/* 5. Configurações */}
          {activeNavItem === "configuracoes" && (
            <div className="px-8 pt-6 animate-in fade-in-50 duration-500">
              <ConfiguracoesPage />
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
