"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Settings,
  Scale
} from "lucide-react"

interface SidebarNavProps {
  activeItem?: string
  onItemClick?: (item: string) => void
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "processos", label: "Processos", icon: FileText },
  { id: "configuracoes", label: "Configurações", icon: Settings }
]

export function SidebarNav({ activeItem = "dashboard", onItemClick }: SidebarNavProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Scale className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">LexDash</h1>
            <p className="text-xs text-sidebar-foreground/60">Gestão Jurídica</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            return (
              <button
                key={item.id}
                onClick={() => onItemClick?.(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-medium">AS</span>
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium">Ana Silva</p>
              <p className="text-xs text-sidebar-foreground/60">Advogada Sênior</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
