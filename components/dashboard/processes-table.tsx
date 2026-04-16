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
                        <DialogHeader className="mb-6 space-y-4">
                          <DialogTitle className="text-2xl text-slate-900 font-bold tracking-tight">
                            {processo.numero_processo}
                          </DialogTitle>
                          <div className="flex flex-col gap-1.5 text-base">
                            <p className="text-slate-800">
                              <span className="font-medium text-slate-500 mr-2">Reclamante:</span> 
                              <span className="font-semibold">{processo.nome_reclamante || "N/A"}</span>
                            </p>
                            <p className="text-slate-800">
                              <span className="font-medium text-slate-500 mr-2">Advogado Adverso:</span> 
                              <span className="font-medium">{processo.advogado_reclamante || "N/A"}</span>
                            </p>
                          </div>
                        </DialogHeader>

                        <div className="flex flex-col gap-6">
                          
                          {/* DADOS CONTRATUAIS */}
                          <div className="space-y-4">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Informações Contratuais</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white p-4 border border-slate-100 rounded-xl shadow-sm">
                              <div>
                                <p className="font-medium text-slate-500 mb-1">Empresa</p>
                                <p className="font-semibold text-slate-800 truncate" title={processo.reclamada}>{processo.reclamada || "N/A"}</p>
                              </div>
                              <div>
                                <p className="font-medium text-slate-500 mb-1">Unidade</p>
                                <p className="font-semibold text-slate-800 truncate" title={processo.centro_custo}>{processo.centro_custo || "N/A"}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="font-medium text-slate-500 mb-1">Empresa Terceira</p>
                                <p className="font-semibold text-slate-800 truncate" title={processo.empresa_terceirizada}>{processo.empresa_terceirizada || "N/A"}</p>
                              </div>
                              <div>
                                <p className="font-medium text-slate-500 mb-1">Data Ajuizamento</p>
                                <p className="font-semibold text-slate-800">{formatDate(processo.data_ajuizamento)}</p>
                              </div>
                              <div>
                                <p className="font-medium text-slate-500 mb-1">Admissão</p>
                                <p className="font-semibold text-slate-800">{formatDate(processo.data_admissao_reclamante)}</p>
                              </div>
                              <div>
                                <p className="font-medium text-slate-500 mb-1">Demissão</p>
                                <p className="font-semibold text-slate-800">{formatDate(processo.data_demissao_reclamante || processo.data_demissao_reclamantte)}</p>
                              </div>
                              <div>
                                <p className="font-medium text-slate-500 mb-1">Modalidade Dispensa</p>
                                <p className="font-semibold text-slate-800 truncate" title={processo.modalidade_rescisao}>{processo.modalidade_rescisao || "N/A"}</p>
                              </div>
                            </div>
                          </div>

                          {/* STATUS GRID */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-xl">
                            <div>
                              <p className="font-medium text-slate-500 mb-1">Localidade</p>
                              <p className="font-semibold text-slate-800 uppercase">
                                {processo.vara ? `${processo.vara} - ` : ""}{processo.comarca || "Sem Registro"} {processo.uf ? `(${processo.uf})` : ""}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-slate-500 mb-1">Fase Processual</p>
                              <p className="font-semibold text-slate-800 uppercase">{processo.fase_processual || processo.fase_processo_atual || "Não Informada"}</p>
                            </div>
                            <div>
                              <p className="font-medium text-slate-500 mb-1">Status</p>
                              <p className="font-semibold text-slate-800 uppercase">{processo.status || "-"}</p>
                            </div>
                          </div>

                          {/* ALERTAS DE URGÊNCIA */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                            {processo.liminar && (
                              <span className="font-bold text-[#E67E66] flex items-center gap-1.5">
                                <AlertCircle className="h-4 w-4" /> 
                                LIMINAR: {String(processo.liminar).toUpperCase()}
                              </span>
                            )}
                            
                            {processo.numero_processo_apenso || processo.processo_apenso ? (
                              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                <LinkIcon className="h-4 w-4 text-slate-400" />
                                APENSO: {processo.numero_processo_apenso || processo.processo_apenso}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic flex items-center gap-1.5">
                                Sem apensos
                              </span>
                            )}
                          </div>

                          <hr className="border-slate-100" />

                          {/* LAUDOS */}
                          <div className="space-y-4">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Análise de Laudos</h3>
                            
                            <div className="space-y-3 text-sm">
                              <div className="flex flex-col sm:flex-row gap-x-6 gap-y-2">
                                <p className="text-slate-700">
                                  <span className="font-medium text-slate-500 mr-2">Nexo Mental:</span>
                                  {laudo.do_mental ? (
                                    <span className="font-bold text-slate-900">
                                      {String(laudo.do_mental).toUpperCase()} {laudo.grau_mental && `(${formatGrau(laudo.grau_mental)})`}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-medium">Sem Registro</span>
                                  )}
                                </p>
                                <p className="text-slate-700">
                                  <span className="font-medium text-slate-500 mr-2">Nexo Ergonômico:</span>
                                  {laudo.do_ergonomica ? (
                                    <span className="font-bold text-slate-900">
                                      {String(laudo.do_ergonomica).toUpperCase()} {laudo.grau_ergonomico && `(${formatGrau(laudo.grau_ergonomico)})`}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-medium">Sem Registro</span>
                                  )}
                                </p>
                              </div>

                              <div className="pt-1">
                                <p className="text-slate-700 flex items-center gap-2">
                                  <span className="font-medium text-slate-500">Incapacidade:</span>
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
                                    <span className="text-slate-400 font-medium">Não Informada</span>
                                  )}
                                </p>
                              </div>

                              {/* Riscos */}
                              <div className="flex flex-wrap items-center gap-6 pt-3">
                                <div className={`flex items-center gap-1.5 font-medium ${laudo.acidente_trabalho ? 'text-red-600' : 'text-slate-400'}`}>
                                  <ShieldAlert className="h-4 w-4" />
                                  Acidente de Trabalho
                                </div>
                                <div className={`flex items-center gap-1.5 font-medium ${laudo.periculosidade ? 'text-amber-600' : 'text-slate-400'}`}>
                                  <AlertTriangle className="h-4 w-4" />
                                  Periculosidade
                                </div>
                                <div className={`flex items-center gap-1.5 font-medium ${laudo.insalubridade ? 'text-amber-600' : 'text-slate-400'}`}>
                                  <Activity className="h-4 w-4" />
                                  Insalubridade {laudo.insalubridade && laudo.grau_insalubridade && `(${formatGrau(laudo.grau_insalubridade)})`}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* FOOTER DA MODAL */}
                        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-start gap-4">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor da Causa</span>
                            <span className="text-2xl font-black text-emerald-800 tracking-tight">
                              {processo.valor_causa ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(processo.valor_causa) : "Não Informado"}
                            </span>
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
