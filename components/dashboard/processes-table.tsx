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
import { ChevronLeft, ChevronRight, Eye, AlertCircle, Link as LinkIcon, Activity, AlertTriangle, ShieldAlert, HeartPulse, Stethoscope, Search } from "lucide-react"

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

              return (
                <div key={processo.numero_processo} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white border border-slate-200 rounded-md transition-colors hover:bg-slate-50 gap-4">
                  {/* Esquerda: Identificação */}
                  <div className="w-full md:w-[30%] flex flex-col gap-1 shrink-0">
                    <span className="font-bold text-slate-900 text-sm tracking-tight">{processo.numero_processo}</span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">{processo.nome_reclamante}</span>
                  </div>

                  {/* Centro: Contexto */}
                  <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-[45%] gap-2 md:gap-4 shrink-0">
                    <span className="text-sm text-slate-500 shrink-0">
                      {processo.trt} / {processo.comarca}
                    </span>
                    <span className="text-slate-300 hidden md:inline">|</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {processo.fase_processual}
                    </span>
                  </div>

                  {/* Direita: Status e Ação */}
                  <div className="flex items-center justify-between md:justify-end w-full md:w-[25%] gap-3 shrink-0">
                    <Badge 
                      variant={getStatusVariant(processo.status)}
                      className={`${getStatusColor(processo.status)} text-[10px] px-2 py-0.5 font-bold uppercase`}
                    >
                      {processo.status}
                    </Badge>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-[#F6D000] hover:text-[#d97706] font-bold text-xs uppercase p-0 h-auto">
                          <Eye className="h-4 w-4" />
                          Ver detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-6 md:p-8">
                        <DialogHeader className="mb-4">
                          <DialogTitle className="text-xl text-slate-900 font-bold tracking-tight">
                            {processo.numero_processo}
                          </DialogTitle>
                          <div className="flex flex-col md:flex-row gap-x-6 gap-y-1 text-sm mt-1">
                            <p className="text-slate-800">
                              <span className="font-medium text-slate-500 mr-1">Reclamante:</span> 
                              <span className="font-bold">{processo.nome_reclamante || "N/A"}</span>
                            </p>
                            <p className="text-slate-800">
                              <span className="font-medium text-slate-500 mr-1">Advogado:</span> 
                              <span className="font-semibold">{processo.advogado_reclamante || "N/A"}</span>
                            </p>
                          </div>
                        </DialogHeader>

                        {/* LAYOUT EM 3 COLUNAS */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          
                          {/* COLUNA 1: DADOS CONTRATUAIS E STATUS */}
                          <div className="flex flex-col gap-3">
                            <div className="bg-white p-3 border border-slate-100 rounded-lg shadow-sm text-xs">
                              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-2">Informações Contratuais</h3>
                              <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                                <div className="col-span-2 flex justify-between items-end">
                                  <div>
                                    <p className="font-medium text-slate-500">Empresa / Unidade</p>
                                    <p className="font-semibold text-slate-800 truncate" title={`${processo.reclamada} - ${processo.centro_custo}`}>
                                      {processo.reclamada || "N/A"} <span className="text-slate-300 mx-0.5">•</span> {processo.centro_custo || "N/A"}
                                    </p>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <p className="font-medium text-slate-500">Empresa Terceira</p>
                                  <p className="font-semibold text-slate-800 truncate" title={processo.empresa_terceirizada}>{processo.empresa_terceirizada || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-slate-500">Data Ajuiz.</p>
                                  <p className="font-semibold text-slate-800">{formatDate(processo.data_ajuizamento)}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-slate-500">Mod. Dispensa</p>
                                  <p className="font-semibold text-slate-800 truncate" title={processo.modalidade_rescisao}>{processo.modalidade_rescisao || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-slate-500">Admissão</p>
                                  <p className="font-semibold text-slate-800">{formatDate(processo.data_admissao_reclamante)}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-slate-500">Demissão</p>
                                  <p className="font-semibold text-slate-800">{formatDate(processo.data_demissao_reclamante || processo.data_demissao_reclamantte)}</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-lg text-xs border border-slate-100">
                              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1.5 mb-2">Localidade & Status</h3>
                              <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                                <div className="col-span-2">
                                  <p className="font-medium text-slate-500">Localidade</p>
                                  <p className="font-semibold text-slate-800 uppercase">
                                    {processo.vara ? `${processo.vara} - ` : ""}{processo.comarca || "N/A"} {processo.uf ? `(${processo.uf})` : ""}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium text-slate-500">Fase Atual</p>
                                  <p className="font-semibold text-slate-800 uppercase">{processo.fase_processual || processo.fase_processo_atual || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-slate-500">Status</p>
                                  <p className="font-semibold text-slate-800 uppercase">{processo.status || "-"}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* COLUNA 2: LAUDOS E ALERTAS */}
                          <div className="flex flex-col gap-3 lg:border-l lg:border-slate-100 lg:pl-4">
                            <div className="bg-white p-3 border border-slate-100 rounded-lg shadow-sm text-xs">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-2">Análise de Laudos</h3>
                                
                                {/* Itens Lado a Lado (Flex Wrap) */}
                                <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-slate-500 text-[10px] uppercase tracking-wider">Nexo Mental</span>
                                    {laudo.do_mental ? (
                                      <span className="font-bold text-slate-900">
                                        {String(laudo.do_mental).toUpperCase()} {laudo.grau_mental && <span className="text-slate-500 font-medium">({formatGrau(laudo.grau_mental)})</span>}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 font-medium italic">N/A</span>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-col">
                                    <span className="font-medium text-slate-500 text-[10px] uppercase tracking-wider">Nexo Ergonômico</span>
                                    {laudo.do_ergonomica ? (
                                      <span className="font-bold text-slate-900">
                                        {String(laudo.do_ergonomica).toUpperCase()} {laudo.grau_ergonomico && <span className="text-slate-500 font-medium">({formatGrau(laudo.grau_ergonomico)})</span>}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 font-medium italic">N/A</span>
                                    )}
                                  </div>

                                  <div className="flex flex-col mt-1 w-full">
                                    <span className="font-medium text-slate-500 text-[10px] uppercase tracking-wider">Incapacidade</span>
                                    {laudo.incapacidade ? (
                                      <span className={`font-bold ${
                                        String(laudo.incapacidade).toUpperCase().includes('PARCIAL') ? 'text-orange-600' :
                                        String(laudo.incapacidade).toUpperCase().includes('INCAPAZ') ? 'text-red-600' :
                                        String(laudo.incapacidade).toUpperCase().includes('CAPAZ') ? 'text-emerald-600' :
                                        'text-slate-800'
                                      }`}>
                                        {String(laudo.incapacidade).toUpperCase()}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 font-medium italic">N/A</span>
                                    )}
                                  </div>
                                </div>

                                {/* Chips Compactos para Riscos */}
                                {(laudo.acidente_trabalho || laudo.periculosidade || laudo.insalubridade) && (
                                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-50">
                                    {laudo.acidente_trabalho && (
                                      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-[9px] px-1.5 py-0 uppercase gap-1 h-5">
                                        <ShieldAlert className="h-3 w-3" /> Acidente Trab.
                                      </Badge>
                                    )}
                                    {laudo.periculosidade && (
                                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[9px] px-1.5 py-0 uppercase gap-1 h-5">
                                        <AlertTriangle className="h-3 w-3" /> Periculosidade
                                      </Badge>
                                    )}
                                    {laudo.insalubridade && (
                                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[9px] px-1.5 py-0 uppercase gap-1 h-5">
                                        <Activity className="h-3 w-3" /> Insalub. {laudo.grau_insalubridade && `(${formatGrau(laudo.grau_insalubridade)})`}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                            </div>
                            
                            {/* Alertas de Urgência (Passou pra coluna central sob laudos) */}
                            {(processo.liminar || processo.numero_processo_apenso || processo.processo_apenso) && (
                              <div className="bg-[#FFF8E6] text-amber-900 p-3 rounded-lg border border-amber-200 text-xs">
                                <h3 className="text-[10px] font-bold text-amber-600/80 uppercase tracking-widest border-b border-amber-200/50 pb-1.5 mb-2">Alertas e Apensos</h3>
                                <div className="flex flex-col gap-1.5">
                                  {processo.liminar && (
                                    <span className="font-bold text-[#E67E66] flex items-center gap-1.5">
                                      <AlertCircle className="h-3.5 w-3.5 mt-[-1px]" /> 
                                      LIMINAR: {String(processo.liminar).toUpperCase()}
                                    </span>
                                  )}
                                  {(processo.numero_processo_apenso || processo.processo_apenso) && (
                                    <span className="font-semibold flex items-center gap-1.5 text-amber-800">
                                      <LinkIcon className="h-3 w-3 mt-[-1px] opacity-70" />
                                      Apenso: {processo.numero_processo_apenso || processo.processo_apenso}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* COLUNA 3: VALOR DA CAUSA */}
                          <div className="flex flex-col lg:border-l lg:border-slate-100 lg:pl-4">
                            <div className="bg-[#F8FAFC] border border-slate-200 p-4 rounded-xl flex flex-col justify-center h-full flex-1">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor da Causa</span>
                              <span className="text-3xl lg:text-2xl xl:text-3xl font-black text-emerald-700 tracking-tighter leading-none mb-2">
                                {processo.valor_causa ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(processo.valor_causa) : "N/A"}
                              </span>
                              <p className="text-[10px] text-slate-500 font-medium">Valor global estimado em sistema para provisões e riscos legais.</p>
                            </div>
                          </div>
                          
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
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
