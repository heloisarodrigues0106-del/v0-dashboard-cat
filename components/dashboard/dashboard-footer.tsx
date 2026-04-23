"use client"

import { Calendar } from "lucide-react"

export function DashboardFooter() {
  return (
    <footer className="w-full mt-auto py-5 px-4 md:px-8 bg-[#F8FAFC] border-t border-slate-200">
      <div className="flex items-center justify-center gap-2.5">
        <Calendar className="h-4 w-4 text-[#183B8C]" />
        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
          Dados atualizados até <span className="text-[#183B8C] font-black underline underline-offset-4 decoration-2 decoration-blue-100">Q1 2026</span>
        </span>
      </div>
    </footer>
  )
}
