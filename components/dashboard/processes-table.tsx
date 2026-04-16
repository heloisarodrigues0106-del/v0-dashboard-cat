"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Eye, AlertCircle, Link as LinkIcon, Activity, AlertTriangle, ShieldAlert, HeartPulse, Stethoscope, Search, Check, X, ChevronDown } from "lucide-react"

const ITEMS_PER_PAGE = 5

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Ativo":
      return "default"
    case "Suspenso":
      return "secondary"
    case "Encerrado":
      return "outline"
    case "Arquivado":
      return "outline"
    default:
      return "default"
  }
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "Ativo":
      return "bg-success text-success-foreground"
    case "Suspenso":
      return "bg-warning text-warning-foreground"
    case "Encerrado":
      return "bg-muted text-muted-foreground"
    case "Arquivado":
      return "bg-secondary text-secondary-foreground"
    default:
      return ""
  }
}

export function ProcessesTable({ processos = [], laudos = [] }: { processos?: any[], laudos?: any[] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedProcesso, setExpandedProcesso] = useState<string | null>(null)
  
  const filteredProcessos = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return processos

    return processos.filter((p) => 
      (p.nome_reclamante || "").toLowerCase().includes(query) ||
      (p.numero_processo || "").toLowerCase().includes(query) ||
      (p.funcao_reclamante || "").toLowerCase().includes(query)
    )
  }, [processos, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredProcessos.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentProcesses = filteredProcessos.slice(startIndex, endIndex)

  return (
    <section className="py-0">
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6">
          <CardTitle className="text-xl font-bold text-card-foreground">
            Detalhamento dos Processos
          </CardTitle>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar reclamante, número ou cargo..." 
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm h-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 px-6">
          <div className="flex flex-col gap-2">
            {currentProcesses.map((processo) => {
              const laudo = laudos.find(l => String(l.numero_processo) === String(processo.numero_processo)) || {}
              
              const formatGrau = (val: any) => {
                if (val === null || val === undefined) return ""
                const n = Number(val)
                if (isNaN(n)) return String(val)
                return `${(n * 100).toFixed(0)}%`
              }

              const formatDate = (val: any) => {
                if (!val) return "N/A"
                try {
                  const datePart = String(val).split('T')[0]
                  if (datePart.includes('-')) {
                    const [y, m, d] = datePart.split('-')
                    if(y && m && d) return `${d}/${m}/${y}`
                  }
                  return String(val)
                } catch {
                  return String(val)
                }
              }

              const isExpanded = expandedProcesso === processo.numero_processo

              return (
                <div key={processo.numero_processo} className="border border-slate-200 rounded-md overflow-hidden">
                  {/* LINHA RESUMO (sempre visível) */}
                  <button
                    type="button"
                    onClick={() => setExpandedProcesso(isExpanded ? null : processo.numero_processo)}
                    className="w-full flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white transition-colors hover:bg-slate-50 gap-3 text-left"
                  >
                    <div className="w-full md:w-[30%] flex flex-col gap-0.5 shrink-0">
                      <span className="font-bold text-slate-900 text-sm tracking-tight">{processo.numero_processo}</span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase">{processo.nome_reclamante}</span>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-[40%] gap-2 md:gap-4 shrink-0">
                      <span className="text-sm text-slate-500 shrink-0">{processo.trt} / {processo.comarca}</span>
                      <span className="text-slate-300 hidden md:inline">|</span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{processo.fase_processual}</span>
                    </div>
                    <div className="flex items-center w-full md:w-[30%] gap-3 justify-between md:justify-end shrink-0">
                      <Badge variant={getStatusVariant(processo.status)} className={`${getStatusColor(processo.status)} text-[10px] px-2 py-0.5 font-bold uppercase`}>
                        {processo.status}
                      </Badge>
                      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* PAINEL EXPANDIDO — Layout Tabular Full-Width */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-white">
                      {/* Cabeçalho estilo Reintegração */}
                      <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-100 bg-slate-50">
                        <div className="w-1 h-8 bg-[#F6D000] rounded-full shrink-0" />
                        <div>
                          <h3 className="text-base font-bold text-slate-900 leading-tight">{processo.numero_processo}</h3>
                          <p className="text-sm text-slate-500">
                            {processo.nome_reclamante || "N/A"}
                            {processo.advogado_reclamante && <span className="ml-4 text-slate-400">Adv. Adverso: <span className="font-medium text-slate-600">{processo.advogado_reclamante}</span></span>}
                          </p>
                        </div>
                      </div>

                      {/* TABELA HORIZONTAL — Todas as informações em uma linha */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50">
                              <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
                              <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Unidade</th>
                              <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Terceirizada</th>
                              <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Ajuizamento</th>
                              <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Admissão</th>
                              <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Demissão</th>
                              <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Mod. Dispensa</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-slate-100">
                              <td className="px-4 py-3 font-medium text-slate-800">{processo.reclamada || "N/A"}</td>
                              <td className="px-4 py-3 font-medium text-slate-800">{processo.centro_custo || "N/A"}</td>
                              <td className="px-4 py-3 font-medium text-slate-800">{processo.empresa_terceirizada || "N/A"}</td>
                              <td className="px-4 py-3 font-medium text-slate-800">{formatDate(processo.data_ajuizamento)}</td>
                              <td className="px-4 py-3 font-medium text-slate-800">{formatDate(processo.data_admissao_reclamante)}</td>
                              <td className="px-4 py-3 font-medium text-slate-800">{formatDate(processo.data_demissao_reclamante || processo.data_demissao_reclamantte)}</td>
                              <td className="px-4 py-3 font-medium text-slate-800">{processo.modalidade_rescisao || "N/A"}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* SEGUNDA LINHA: Localidade + Laudos + Valor */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50">
                              <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Localidade</th>
                              <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Fase</th>
                              <th className="text-center px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Nexo Mental</th>
                              <th className="text-center px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Nexo Ergon.</th>
                              <th className="text-center px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Incapacidade</th>
                              <th className="text-center px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Acid. Trab.</th>
                              <th className="text-center px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Periculosidade</th>
                              <th className="text-center px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Insalubridade</th>
                              <th className="text-right px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor da Causa</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-slate-100">
                              <td className="px-4 py-3 font-medium text-slate-800 uppercase">
                                {processo.vara ? `${processo.vara} - ` : ""}{processo.comarca || "N/A"} {processo.uf ? `(${processo.uf})` : ""}
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-800 uppercase">{processo.fase_processual || "N/A"}</td>
                              <td className="px-4 py-3 text-center">
                                {laudo.do_mental ? (
                                  <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                                    {String(laudo.do_mental).toUpperCase()}
                                    {laudo.grau_mental && <span className="text-slate-400 text-xs">({formatGrau(laudo.grau_mental)})</span>}
                                  </span>
                                ) : <span className="text-slate-300">—</span>}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {laudo.do_ergonomica ? (
                                  <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                                    {String(laudo.do_ergonomica).toUpperCase()}
                                    {laudo.grau_ergonomico && <span className="text-slate-400 text-xs">({formatGrau(laudo.grau_ergonomico)})</span>}
                                  </span>
                                ) : <span className="text-slate-300">—</span>}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {laudo.incapacidade ? (
                                  <span className={`font-bold ${
                                    String(laudo.incapacidade).toUpperCase().includes('PARCIAL') ? 'text-orange-600' :
                                    String(laudo.incapacidade).toUpperCase().includes('INCAPAZ') ? 'text-red-600' :
                                    String(laudo.incapacidade).toUpperCase().includes('CAPAZ') ? 'text-emerald-600' :
                                    'text-slate-800'
                                  }`}>
                                    {String(laudo.incapacidade).toUpperCase()}
                                  </span>
                                ) : <span className="text-slate-300">—</span>}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {laudo.acidente_trabalho
                                  ? <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                                  : <X className="h-5 w-5 text-red-400 mx-auto" />
                                }
                              </td>
                              <td className="px-4 py-3 text-center">
                                {laudo.periculosidade
                                  ? <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                                  : <X className="h-5 w-5 text-red-400 mx-auto" />
                                }
                              </td>
                              <td className="px-4 py-3 text-center">
                                {laudo.insalubridade
                                  ? <span className="inline-flex items-center gap-1"><Check className="h-5 w-5 text-emerald-500" />{laudo.grau_insalubridade && <span className="text-xs text-slate-500">({formatGrau(laudo.grau_insalubridade)})</span>}</span>
                                  : <X className="h-5 w-5 text-red-400 mx-auto" />
                                }
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-lg font-black text-emerald-700 tracking-tight">
                                  {processo.valor_causa ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(processo.valor_causa) : "N/A"}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* LINHA DE ALERTAS (condicional) */}
                      {(processo.liminar || processo.numero_processo_apenso || processo.processo_apenso) && (
                        <div className="px-6 py-2.5 border-t border-slate-100 bg-amber-50/40 flex flex-wrap items-center gap-4 text-sm">
                          {processo.liminar && (
                            <span className="font-bold text-red-500 flex items-center gap-1.5">
                              <AlertCircle className="h-4 w-4" />
                              LIMINAR: {String(processo.liminar).toUpperCase()}
                            </span>
                          )}
                          {(processo.numero_processo_apenso || processo.processo_apenso) && (
                            <span className="font-semibold text-amber-700 flex items-center gap-1.5">
                              <LinkIcon className="h-4 w-4 opacity-70" />
                              Apenso: {processo.numero_processo_apenso || processo.processo_apenso}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs md:text-sm text-muted-foreground">
              {filteredProcessos.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredProcessos.length)} de {filteredProcessos.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="hidden md:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 p-0 ${currentPage === page ? 'bg-[#F6D000] text-[#111111] hover:bg-[#d97706]' : ''}`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
