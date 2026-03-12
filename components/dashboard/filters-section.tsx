"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { trts, comarcas, statusOptions, trimestres, anos } from "@/lib/mock-data"
import { CalendarIcon, Filter, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function FiltersSection() {
  const [dataInicial, setDataInicial] = useState<Date>()
  const [dataFinal, setDataFinal] = useState<Date>()
  const [trt, setTrt] = useState<string>("")
  const [comarca, setComarca] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [trimestre, setTrimestre] = useState<string>("")
  const [ano, setAno] = useState<string>("")

  const handleReset = () => {
    setDataInicial(undefined)
    setDataFinal(undefined)
    setTrt("")
    setComarca("")
    setStatus("")
    setTrimestre("")
    setAno("")
  }

  return (
    <div className="sticky top-16 z-20 border-b border-border bg-card px-6 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filtros
        </div>

        {/* Data Inicial */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[160px] justify-start text-left font-normal",
                !dataInicial && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dataInicial ? format(dataInicial, "dd/MM/yyyy", { locale: ptBR }) : "Data Inicial"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dataInicial}
              onSelect={setDataInicial}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Data Final */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[160px] justify-start text-left font-normal",
                !dataFinal && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dataFinal ? format(dataFinal, "dd/MM/yyyy", { locale: ptBR }) : "Data Final"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dataFinal}
              onSelect={setDataFinal}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* TRT */}
        <Select value={trt} onValueChange={setTrt}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="TRT" />
          </SelectTrigger>
          <SelectContent>
            {trts.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Comarca */}
        <Select value={comarca} onValueChange={setComarca}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Comarca" />
          </SelectTrigger>
          <SelectContent>
            {comarcas.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Trimestre */}
        <Select value={trimestre} onValueChange={setTrimestre}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Trimestre" />
          </SelectTrigger>
          <SelectContent>
            {trimestres.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ano */}
        <Select value={ano} onValueChange={setAno}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {anos.map((a) => (
              <SelectItem key={a} value={a.toString()}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" onClick={handleReset} className="text-muted-foreground">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
