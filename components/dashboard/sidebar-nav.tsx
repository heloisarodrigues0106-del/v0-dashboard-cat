"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase-client"
import {
  LayoutDashboard,
  FileText,
  Settings,
  FileSignature,
  Landmark,
  ChevronLeft,
  Menu,
  X,
  Handshake,
  LogOut
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
  onLogout?: () => void
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
  onMobileClose,
  onLogout
}: SidebarNavProps) {
  const [userEmail, setUserEmail] = useState<string>("Carregando...")
  const [userInitials, setUserInitials] = useState<string>("--")

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email) {
        setUserEmail(user.email)
        setUserInitials(user.email.substring(0, 2).toUpperCase())
      } else {
        setUserEmail("Usuário")
        setUserInitials("US")
      }
    }
    fetchUser()
  }, [])

  const handleItemClick = (id: string) => {
    onItemClick?.(id)
    onMobileClose?.()
  }

  const showLabel = isMobileOpen || !isCollapsed

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-screen",
          "hidden md:flex transition-all duration-300",
          isCollapsed ? "md:w-20" : "md:w-64",
          isMobileOpen && "flex w-72 shadow-2xl animate-in slide-in-from-left duration-300"
        )}
        style={{ 
          background: "linear-gradient(180deg, #0F1B3D 0%, #152252 40%, #1A2A60 100%)" 
        }}
      >
        <div className="flex h-full w-full flex-col overflow-hidden">
          
          {/* === TOP: Martinelli Logo Block === */}
          <div className="px-5 pt-6 pb-4">
            <div className={cn(
              "flex items-center gap-3",
              !showLabel && "justify-center"
            )}>
              {/* "M" monogram circle */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10">
                <span className="text-white font-bold text-base tracking-tight">M</span>
              </div>
              {showLabel && (
                <Image
                  src="/martinelli-logo.svg"
                  alt="Martinelli Advogados"
                  width={160}
                  height={28}
                  className="h-7 w-auto"
                  priority
                />
              )}
            </div>
          </div>

          {/* === Company Card: Caterpillar === */}
          <div className="px-4 pb-4">
            <div className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-3",
              "bg-white/8 border border-white/10",
              "transition-all duration-200",
              !showLabel && "justify-center px-2"
            )}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 p-1.5">
                <Image
                  src="/caterpillar-logo.svg"
                  alt="Caterpillar"
                  width={24}
                  height={24}
                  className="h-auto w-full brightness-0 invert"
                />
              </div>
              {showLabel && (
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-white truncate tracking-[0.08em] uppercase">CATERPILLAR</p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-white/50">Contencioso Trabalhista</p>
                  </div>
              )}
            </div>
          </div>

          {/* Desktop Toggle Button */}
          <div className="hidden md:flex px-4 pb-1 justify-end">
            <button
              onClick={onToggleCollapse}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200",
                "text-white/40 hover:text-white/80 hover:bg-white/8",
                isCollapsed && "w-full justify-center"
              )}
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Mobile close button */}
          {isMobileOpen && (
            <div className="absolute top-5 right-4 md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMobileClose}
                className="h-8 w-8 p-0 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* === NAVEGAÇÃO Section Label === */}
          <div className="px-6 pt-4 pb-2">
            {showLabel && (
              <span className="text-[10px] font-bold tracking-[0.15em] text-white/35 uppercase">
                Navegação
              </span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  title={!showLabel ? item.label : undefined}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 my-0.5",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/55 hover:bg-white/6 hover:text-white/85",
                    !showLabel ? "justify-center" : "justify-start"
                  )}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{ backgroundColor: "#F6D000" }}
                    />
                  )}
                  <Icon className={cn(
                    "shrink-0 transition-all duration-200",
                    !showLabel ? "h-5 w-5" : "h-[18px] w-[18px]",
                    isActive ? "text-white" : "text-white/45 group-hover:text-white/75"
                  )} />
                  {showLabel && <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.06em]">{item.label}</span>}
                </button>
              )
            })}
          </nav>

          {/* === FOOTER: User Info + Logout === */}
          <div className="border-t border-white/8 p-4 space-y-2">
            <div className={cn(
              "flex items-center gap-3",
              !showLabel && "justify-center"
            )}>
              <div className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              >
                <span className="text-sm font-semibold text-white/80">{userInitials}</span>
              </div>
              {showLabel && (
                <div className="flex-1 truncate whitespace-nowrap overflow-hidden">
                  <p className="text-[12px] font-bold text-white/90 truncate" title={userEmail}>{userEmail}</p>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Advogado(a)</p>
                </div>
              )}
            </div>
            
            {/* Logout */}
            <button
              onClick={onLogout}
              title={!showLabel ? "Sair" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-[0.06em] transition-all duration-200",
                "text-white/40 hover:bg-red-500/12 hover:text-red-400",
                !showLabel ? "justify-center" : "justify-start"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {showLabel && <span>Sair da conta</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
