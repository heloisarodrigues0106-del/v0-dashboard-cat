"use client"

import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { FileDown, Menu } from "lucide-react"

interface DashboardHeaderProps {
  breadcrumb?: string
  onMenuClick?: () => void
}

export function DashboardHeader({ breadcrumb = "Dashboard", onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="md:hidden h-9 w-9 p-0"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden sm:inline-flex">
              <BreadcrumbLink href="#">Dashboard CAT</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:inline-flex" />
            <BreadcrumbItem>
              <BreadcrumbPage>{breadcrumb}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Button className="gap-2 text-xs md:text-sm" size="sm">
        <FileDown className="h-4 w-4" />
        <span className="hidden sm:inline">Exportar PDF</span>
        <span className="sm:hidden">PDF</span>
      </Button>
    </header>
  )
}
