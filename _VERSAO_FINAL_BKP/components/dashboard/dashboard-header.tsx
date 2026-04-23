"use client"

import { Button } from "@/components/ui/button"
import { FileDown, Menu, Loader2 } from "lucide-react"
import Image from "next/image"

interface DashboardHeaderProps {
  breadcrumb?: string
  onMenuClick?: () => void
  isExporting?: boolean
  onExportPDF?: () => void
}

export function DashboardHeader({ breadcrumb = "Dashboard", onMenuClick, isExporting = false, onExportPDF }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        className="md:hidden h-9 w-9 p-0"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Center: Caterpillar Logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Image
          src="/caterpillar-logo.svg"
          alt="Caterpillar"
          width={160}
          height={56}
          className="h-10 md:h-12 w-auto"
          priority
        />
      </div>

      {/* Right side: Export */}
      <div className="flex items-center gap-2">
        <Button 
          className="gap-2 text-xs md:text-sm min-w-[125px]" 
          size="sm"
          onClick={onExportPDF}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          <span className="hidden sm:inline">{isExporting ? "Gerando PDF..." : "Exportar PDF"}</span>
          <span className="sm:hidden">{isExporting ? "..." : "PDF"}</span>
        </Button>
      </div>
    </header>
  )
}
