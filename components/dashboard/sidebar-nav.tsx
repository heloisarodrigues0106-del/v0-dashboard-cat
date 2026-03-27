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
  Menu,
  X,
  Handshake
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface SidebarNavProps {
  activeItem?: string
  onItemClick?: (item: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
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
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose
}: SidebarNavProps) {
  const handleItemClick = (id: string) => {
    onItemClick?.(id)
    onMobileClose?.()
  }

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar text-sidebar-foreground",
          // Desktop: normal collapsible sidebar
          "hidden md:block transition-all duration-300",
          isCollapsed ? "md:w-20" : "md:w-64",
          // Mobile: drawer overlay
          isMobileOpen && "block w-72 shadow-2xl animate-in slide-in-from-left duration-300"
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Logo Header */}
          <div className="flex h-16 items-center border-b border-sidebar-border px-4 justify-between">
            <div className={cn("flex items-center gap-3", isCollapsed && !isMobileOpen && "justify-center w-full")}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary p-1">
                <Image
                  src="/caterpillar-logo.svg"
                  alt="CAT"
                  width={28}
                  height={28}
                  className="h-auto w-full"
                />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="whitespace-nowrap">
                  <h1 className="text-lg font-semibold tracking-tight">Dashboard CAT</h1>
                  <p className="text-xs text-sidebar-foreground/60">Gestão Jurídica</p>
                </div>
              )}
            </div>
            
            {/* Mobile close button */}
            {isMobileOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMobileClose}
                className="md:hidden h-8 w-8 p-0 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <div className="hidden md:block px-3 py-2">
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
              const showLabel = isMobileOpen || !isCollapsed
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  title={!showLabel ? item.label : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors my-1",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    !showLabel ? "justify-center" : "justify-start"
                  )}
                >
                  <Icon className={cn("shrink-0", !showLabel ? "h-6 w-6" : "h-5 w-5")} />
                  {showLabel && <span className="whitespace-nowrap">{item.label}</span>}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
            <div className={cn("flex items-center gap-3", !isMobileOpen && isCollapsed && "justify-center")}>
              <div className="h-9 w-9 shrink-0 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-sm font-medium">AS</span>
              </div>
              {(isMobileOpen || !isCollapsed) && (
                <div className="flex-1 truncate whitespace-nowrap">
                  <p className="text-sm font-medium">Ana Silva</p>
                  <p className="text-xs text-sidebar-foreground/60">Advogada Sênior</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
