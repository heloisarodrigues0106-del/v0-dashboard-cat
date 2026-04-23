"use client"

import { Calendar } from "lucide-react"

export function DashboardFooter() {
  return (
    <footer className="w-full mt-auto py-3 px-4 md:px-8 bg-[#F8FAFC] border-t border-slate-200/60">
      <div className="flex items-center justify-center gap-2 opacity-70">
        <Calendar className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Dados atualizados até <span className="text-[#183B8C]">Q1 2026</span>
        </span>
      </div>
    </footer>
  )
}
