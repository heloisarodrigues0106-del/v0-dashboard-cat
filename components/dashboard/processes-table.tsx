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
        <CardContent>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-y border-slate-200">
                  <TableHead className="font-bold text-slate-900">Número do Processo</TableHead>
                  <TableHead className="font-bold text-slate-900">Reclamante</TableHead>
                  <TableHead className="font-bold text-slate-900">TRT/Comarca</TableHead>
                  <TableHead className="font-bold text-slate-900">Fase Atual</TableHead>
                  <TableHead className="font-bold text-slate-900">Status</TableHead>
                  <TableHead className="font-bold text-slate-900 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProcesses.map((processo) => {
                  const laudo = laudos.find(l => String(l.numero_processo) === String(processo.numero_processo)) || {}
                  
                  const formatGrau = (val: any) => {
                    if (val === null || val === undefined) return ""
                    const n = Number(val)
                    if (isNaN(n)) return String(val)
                    return `${(n * 100).toFixed(0)}%`
                  }

                  const getIncapacidadeColor = (val: string) => {
                    const s = String(val || "").toUpperCase()
                    if (s.includes("PARCIAL")) return "bg-orange-100 text-orange-700 border-orange-200"
                    if (s.includes("INCAPAZ")) return "bg-red-100 text-red-700 border-red-200"
                    if (s.includes("CAPAZ")) return "bg-emerald-100 text-emerald-700 border-emerald-200"
                    return "bg-slate-100 text-slate-600 border-slate-200"
                  }

                  return (
                    <TableRow key={processo.numero_processo} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-sm text-card-foreground">
                        {processo.numero_processo}
                      </TableCell>
                      <TableCell className="font-medium text-card-foreground">
                        {processo.nome_reclamante}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {processo.trt} / {processo.comarca}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {processo.fase_processual}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusVariant(processo.status)}
                          className={getStatusColor(processo.status)}
                        >
                          {processo.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1.5 text-primary">
                              <Eye className="h-4 w-4" />
                              Ver detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-6 md:p-8">
                            <DialogHeader className="mb-6 space-y-4">
                              <DialogTitle className="text-2xl text-slate-900 font-bold tracking-tight">
                                {processo.numero_processo}
                              </DialogTitle>
                              <div className="flex flex-col gap-1.5 text-base">
                                <p className="text-slate-800">
                                  <span className="font-medium text-slate-500 mr-2">Reclamante:</span> 
                                  <span className="font-semibold">{processo.nome_reclamante || "Não informado"}</span>
                                </p>
                                <p className="text-slate-800">
                                  <span className="font-medium text-slate-500 mr-2">Advogado Adverso:</span> 
                                  <span className="font-medium">{processo.advogado_reclamante || "Não informado"}</span>
                                </p>
                              </div>
                            </DialogHeader>

                            <div className="flex flex-col gap-6">
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
                            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor da Causa</span>
                                <span className="text-2xl font-black text-emerald-800 tracking-tight">
                                  {processo.valor_causa ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(processo.valor_causa) : "Não Informado"}
                                </span>
                              </div>
                              <Button variant="outline" className="text-slate-700 font-semibold border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                Exportar PDF
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
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
                    className="h-8 w-8 p-0"
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
