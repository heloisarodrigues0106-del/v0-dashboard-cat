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
import { ChevronLeft, ChevronRight, Eye, AlertCircle, Link as LinkIcon, Activity, AlertTriangle, ShieldAlert, HeartPulse, Stethoscope, Search, Check, X, ChevronDown, ShieldCheck, DollarSign, Landmark } from "lucide-react"

const ITEMS_PER_PAGE = 10

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
  const s = String(status || "").toUpperCase()
  if (s.includes("PROCEDENTE")) return "bg-[#183B8C] text-white"
  if (s.includes("ACORDO")) return "bg-[#183B8C] text-white"
  if (s === "ATIVO") return "bg-emerald-500 text-white"
  if (s === "SUSPENSO") return "bg-amber-500 text-white"
  return "bg-slate-200 text-slate-700"
}

// Map database columns to display labels for the "Pedidos e Desfechos" table
const PEDIDO_MAPPING = [
  { key: "do_at", label: "Doença/Acidente", icon: HeartPulse },
  { key: "estabilidade", label: "Estabilidade", icon: ShieldCheck },
  { key: "reintegracao", label: "Reintegração", icon: Activity },
  { key: "danos_morais", label: "Danos Morais", icon: AlertTriangle },
  { key: "danos_materiais", label: "Danos Materiais", icon: Landmark },
  { key: "plano_saude", label: "Plano de Saúde", icon: Stethoscope },
  { key: "periculosidade", label: "Periculosidade", icon: ShieldAlert },
  { key: "insalubridade", label: "Insalubridade", icon: Stethoscope },
  { key: "horas_extras", label: "Horas Extras", icon: Activity },
  { key: "intrajornada", label: "Intrajornada", icon: Activity },
  { key: "horas_itinere", label: "Horas in Itinere", icon: Activity },
  { key: "acumulo_funcao", label: "Acúmulo de Função", icon: Activity },
  { key: "equip_salarial", label: "Equiparação Salarial", icon: Landmark },
  { key: "rec_vinculo", label: "Vínculo Empregatício", icon: ShieldCheck },
  { key: "rescisao_indireta", label: "Rescisão Indireta", icon: Activity },
  { key: "outros", label: "Outros Pedidos", icon: LinkIcon },
  { key: "honorarios_advocaticios", label: "Honorários", icon: DollarSign },
]

export function ProcessesTable({ 
  processos = [], 
  laudos = [],
  pedidosInicial = [],
  pedidosSentenca = [],
  pedidosAcordao = []
}: { 
  processos?: any[], 
  laudos?: any[],
  pedidosInicial?: any[],
  pedidosSentenca?: any[],
  pedidosAcordao?: any[]
}) {
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

  const renderOutcomeIcon = (val: any) => {
    if (val === null || val === undefined || val === "") return <span className="text-slate-300">—</span>
    
    const s = String(val).toUpperCase()
    
    // Positive logic
    if (val === true || s === "SIM" || s === "DEFERIDO" || s === "RECONHECIDO" || s === "MANTIDO" || s === "TRUE") {
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} />
          <span className="text-emerald-600 font-bold">Sim</span>
        </div>
      )
    }
    
    // Negative logic
    if (val === false || s === "NÃO" || s === "INDEFERIDO" || s === "FALSO" || s === "FALSE") {
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <X className="h-4 w-4 text-red-500" strokeWidth={3} />
          <span className="text-red-500 font-bold">Não</span>
        </div>
      )
    }
    
    // Partial/Liminar logic
    if (s.includes("PARCIAL")) {
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <div className="h-2 w-2 rounded-full bg-orange-400" />
          <span className="text-orange-500 font-bold">Parcial</span>
        </div>
      )
    }
    if (s.includes("LIMINAR")) {
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <div className="h-2 w-2 rounded-full bg-blue-400" />
          <span className="text-blue-500 font-bold">Liminar</span>
        </div>
      )
    }

    return <span className="text-slate-600 font-bold">{String(val)}</span>
  }

  const formatDate = (val: any) => {
    if (!val) return "—"
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

  return (
    <section className="py-0">
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6">
          <CardTitle className="text-[18px] font-bold text-[#111111] tracking-tight">
            Detalhamento dos processos
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
        <CardContent className="p-0 px-4 md:px-6 pb-8 overflow-x-auto">
          <div className="flex flex-col gap-2 min-w-[600px] lg:min-w-0">
            {currentProcesses.map((processo) => {
              const laudo = laudos.find(l => String(l.numero_processo) === String(processo.numero_processo)) || {}
              const pIni = pedidosInicial.find(p => String(p.numero_processo) === String(processo.numero_processo)) || {}
              const pSen = pedidosSentenca.find(p => String(p.numero_processo) === String(processo.numero_processo)) || {}
              const pAco = pedidosAcordao.find(p => String(p.numero_processo) === String(processo.numero_processo)) || {}
              
              const isExpanded = expandedProcesso === processo.numero_processo

              return (
                <div key={processo.numero_processo} className="border border-slate-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-300 bg-white">
                  {/* LINHA RESUMO (sempre visível) */}
                  <button
                    type="button"
                    onClick={() => setExpandedProcesso(isExpanded ? null : processo.numero_processo)}
                    className="w-full flex flex-col md:flex-row justify-between items-start md:items-center pl-5 pr-6 py-4 transition-colors hover:bg-blue-50/30 gap-3 text-left cursor-pointer group"
                  >
                    <div className="w-full md:w-[35%] flex flex-col gap-0.5 shrink-0">
                      <span className="font-bold text-slate-900 text-[13px] tracking-tight group-hover:text-[#183B8C] transition-colors">{processo.numero_processo}</span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.04em]">{processo.nome_reclamante}</span>
                    </div>
                    <div className="w-full md:w-[30%] shrink-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.06em]">{processo.fase_processual}</span>
                    </div>
                    <div className="flex items-center w-full md:flex-1 gap-5 justify-between md:justify-end shrink-0">
                      <Badge className={`${getStatusColor(processo.status)} text-[10px] px-2.5 py-0.5 font-bold uppercase border-none rounded-full`}>
                        {processo.status}
                      </Badge>
                      <div className="p-1 rounded-md text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-all">
                        <ChevronDown className={`h-6 w-6 transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-180 text-[#183B8C]' : ''}`} />
                      </div>
                    </div>
                  </button>

                  {/* PAINEL EXPANDIDO */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-white p-6 space-y-8 animate-in slide-in-from-top-2 duration-300">
                      
                      {/* 1. Resumo Processual */}
                      <div className="space-y-4">
                        <h4 className="text-[14px] font-bold text-[#111111] flex items-center gap-2 tracking-[0.04em]">
                          <Activity className="h-4 w-4" /> Resumo processual
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-[11px]">
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Empresa</span>
                            <p className="font-bold text-slate-700">{processo.reclamada || "—"}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Unidade</span>
                            <p className="font-bold text-slate-700">{processo.centro_custo || "—"}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Terceirizada</span>
                            <p className="font-bold text-slate-700">{processo.empresa_terceirizada || "—"}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Ajuizamento</span>
                            <p className="font-bold text-slate-700">{formatDate(processo.data_ajuizamento)}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Admissão</span>
                            <p className="font-bold text-slate-700">{formatDate(processo.data_admissao_reclamante)}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Demissão</span>
                            <p className="font-bold text-slate-700">{formatDate(processo.data_demissao_reclamante || processo.data_demissao_reclamantte)}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Mod. Dispensa</span>
                            <p className="font-bold text-slate-700">{processo.modalidade_rescisao || "—"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-slate-100" />

                      {/* 2. Marcadores Técnicos / Processuais */}
                      <div className="space-y-4">
                        <h4 className="text-[14px] font-bold text-[#111111] flex items-center gap-2 tracking-[0.04em]">
                          <LinkIcon className="h-4 w-4" /> Resumo técnico-pericial
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-y-6 gap-x-2 text-[11px]">
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Localidade</span>
                            <p className="font-bold text-slate-700">{processo.vara ? `${processo.vara} - ` : ""}{processo.comarca || "—"} {processo.uf ? `(${processo.uf})` : ""}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Fase</span>
                            <p className="font-bold text-slate-700 uppercase tracking-tight">{processo.fase_processual || "—"}</p>
                          </div>
                          <div className="space-y-1 text-center">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Nexo Mental</span>
                            <p className="font-bold text-slate-700">{laudo.do_mental || "—"}</p>
                          </div>
                          <div className="space-y-1 text-center">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Nexo Méd. Geral</span>
                            <p className="font-bold text-slate-700">{laudo.do_medica_geral || "—"}</p>
                          </div>
                          <div className="space-y-1 text-center">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Ergonomia</span>
                            <p className="font-bold text-slate-700">{laudo.ergonomia || "—"}</p>
                          </div>
                          <div className="space-y-1 text-center">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Incapacidade</span>
                            <p className={`font-bold ${String(laudo.incapacidade || "").toUpperCase().includes("INCAPAZ") ? "text-red-500" : "text-slate-700"}`}>
                              {laudo.incapacidade || "—"}
                            </p>
                          </div>
                          <div className="space-y-1 text-center">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Acid. Trab.</span>
                            <div className="flex justify-center">{laudo.acidente_trabalho ? <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} /> : <X className="h-4 w-4 text-red-500" strokeWidth={3} />}</div>
                          </div>
                          <div className="space-y-1 text-center">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Reintegração</span>
                            <div className="flex justify-center">{pIni.reintegracao ? <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} /> : <X className="h-4 w-4 text-red-500" strokeWidth={3} />}</div>
                          </div>
                          <div className="space-y-1 text-center">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Estabilidade</span>
                            <div className="flex justify-center">{String(processo.status_reclamante || "").includes("ESTABILIDADE") ? <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} /> : <span className="text-slate-300">—</span>}</div>
                          </div>
                          <div className="space-y-1 text-center">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Periculosidade</span>
                            <div className="flex justify-center">{pIni.periculosidade ? <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} /> : <X className="h-4 w-4 text-red-500" strokeWidth={3} />}</div>
                          </div>
                          <div className="space-y-1 text-center">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Insalubridade</span>
                            <div className="flex justify-center">{pIni.insalubridade ? <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} /> : <X className="h-4 w-4 text-red-500" strokeWidth={3} />}</div>
                          </div>
                          <div className="space-y-1 text-right">
                            <span className="text-slate-400 font-bold uppercase tracking-[0.04em] text-[10px]">Valor da Causa</span>
                            <p className="font-bold text-emerald-600 text-[13px]">
                              {processo.valor_causa ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(processo.valor_causa) : "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-slate-100" />

                      {/* 3. Pedidos e Desfechos */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-[#111111] flex items-center gap-2 tracking-wide">
                          <Search className="h-4 w-4" /> Pedidos e desfechos
                        </h4>
                        <div className="overflow-x-auto rounded-lg border border-slate-100">
                          <table className="w-full text-[11px]">
                            <thead>
                              <tr className="bg-slate-50/80 text-slate-500 uppercase font-bold tracking-[0.04em]">
                                <th className="text-left px-4 py-2 border-r border-slate-100">Pedido</th>
                                <th className="text-center px-4 py-2 border-r border-slate-100">Inicial</th>
                                <th className="text-center px-4 py-2 border-r border-slate-100">Sentença</th>
                                <th className="text-center px-4 py-2">Acórdão</th>
                              </tr>
                            </thead>
                            <tbody>
                              {PEDIDO_MAPPING.map((item, idx) => {
                                const hasInInitial = pIni[item.key] !== undefined && pIni[item.key] !== null
                                if (!hasInInitial) return null
                                
                                return (
                                  <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-2.5 border-r border-slate-100 flex items-center gap-2 font-medium text-slate-700">
                                      <item.icon className="h-3.5 w-3.5 text-slate-400" />
                                      {item.label}
                                    </td>
                                    <td className="px-4 py-2.5 border-r border-slate-100 text-center">
                                      {renderOutcomeIcon(pIni[item.key] === true ? "Sim" : pIni[item.key] === false ? "Não" : pIni[item.key])}
                                    </td>
                                    <td className="px-4 py-2.5 border-r border-slate-100 text-center">
                                      {renderOutcomeIcon(pSen[item.key])}
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                      {renderOutcomeIcon(pAco[item.key])}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 4. Alertas do Processo */}
                      {(processo.liminar || processo.numero_processo_apenso || processo.processo_apenso) ? (
                        <div className="space-y-4 pt-2">
                          <h4 className="text-sm font-bold text-[#111111] flex items-center gap-2 tracking-wide">
                            <AlertCircle className="h-4 w-4" /> Alertas do processo
                          </h4>
                          <div className="flex flex-wrap gap-4">
                            {processo.liminar && (
                              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-red-100 flex items-center gap-2 text-xs font-bold uppercase">
                                <AlertTriangle className="h-4 w-4" />
                                Liminar: {String(processo.liminar).toUpperCase()}
                              </div>
                            )}
                            {(processo.numero_processo_apenso || processo.processo_apenso) && (
                              <div className="bg-blue-50 text-[#183B8C] px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-2 text-xs font-bold uppercase">
                                <LinkIcon className="h-4 w-4" />
                                Execução Provisória: {processo.numero_processo_apenso || processo.processo_apenso}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="pt-4 text-[11px] text-slate-400 italic">
                          Sem alertas sensíveis identificados.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
            <p className="text-[11px] font-bold text-slate-500 tracking-[0.04em] uppercase">
              {filteredProcessos.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredProcessos.length)} de <span className="text-slate-900 font-bold">{filteredProcessos.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-9 px-4 font-medium text-slate-600 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <div className="hidden md:flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Only show current, first, last, and neighbors
                  if (totalPages > 7 && page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                    if (Math.abs(page - currentPage) === 2) return <span key={page} className="text-slate-400 px-1">...</span>
                    return null
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`h-9 w-9 p-0 font-bold transition-all ${currentPage === page ? 'bg-[#183B8C] text-white hover:bg-[#102A63] border-[#183B8C]' : 'text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-9 px-4 font-medium text-slate-600 hover:bg-slate-50"
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
