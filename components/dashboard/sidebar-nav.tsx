"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Settings,
  Scale,
  FileSignature,
  Landmark,
  ChevronLeft,
  ChevronRight,
  Menu,
  Handshake
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarNavProps {
  activeItem?: string
  onItemClick?: (item: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const navItems = [
  { id: "dashboard", label: "Visão Geral", icon: LayoutDashboard },
  { id: "processos", label: "Processos", icon: FileText },
  { id: "acordos", label: "Acordos", icon: Handshake },
  { id: "laudos", label: "Laudos", icon: FileSignature },
  { id: "valores", label: "Valores", icon: Landmark },
  { id: "configuracoes", label: "Configurações", icon: Settings }
]

export function SidebarNav({ 
  activeItem = "dashboard", 
  onItemClick,
  isCollapsed = false,
  onToggleCollapse
}: SidebarNavProps) {
  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 bg-sidebar text-sidebar-foreground",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col overflow-hidden">
        {/* Logo and Toggle Header */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-4 justify-between">
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center w-full")}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
              <Scale className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div className="whitespace-nowrap">
                <h1 className="text-lg font-semibold tracking-tight">LexDash</h1>
                <p className="text-xs text-sidebar-foreground/60">Gestão Jurídica</p>
              </div>
            )}
          </div>
          
          {/* Mobile or overlay toggle could go here, but we will place a fixed toggle inside the nav */}
        </div>

        {/* Toggle Button */}
        <div className="px-3 py-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleCollapse} 
            className={cn("w-full h-8 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground", isCollapsed ? "justify-center" : "justify-end")}
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            return (
              <button
                key={item.id}
                onClick={() => onItemClick?.(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors my-1",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <Icon className={cn("shrink-0", isCollapsed ? "h-6 w-6" : "h-5 w-5")} />
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
           <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <div className="h-9 w-9 shrink-0 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-medium">AS</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate whitespace-nowrap">
                <p className="text-sm font-medium">Ana Silva</p>
                <p className="text-xs text-sidebar-foreground/60">Advogada Sênior</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
