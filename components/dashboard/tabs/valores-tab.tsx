import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, DollarSign, WalletCards, Landmark, ShieldCheck, Search, ChevronDown, ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { FinancialAnalysis } from "../financial-analysis"
import { formatLabel } from "@/lib/utils"
import { provisionamentoConfig, toNumber, isAcaoNova } from "@/lib/config"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value || 0)
}

const ITEMS_PER_PAGE = 10

export function ValoresTab({ 
  valoresOperacionais = [], 
  valoresProvisionamento = [],
  processos = []
}: { 
  valoresOperacionais?: any[], 
  valoresProvisionamento?: any[],
  processos?: any[]
}) {
  const [riscoAtivo, setRiscoAtivo] = useState("provavel")
  const [activeMainTab, setActiveMainTab] = useState("provisionamento")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  
  // State for Provisionamento Search & Page
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // State for Preparo Recursal Search & Page
  const [searchQueryOp, setSearchQueryOp] = useState("")
  const [currentPageOp, setCurrentPageOp] = useState(1)

  // 1. Calculador de KPIs Operacionais (Preparo Recursal)
  const kpisOperacionais = useMemo(() => {
    let custas = 0
    let depositoRecursal = 0
    let apoliceCount = 0
    let depositoJudicial = 0

    valoresOperacionais.forEach(v => {
      custas += toNumber(v.custas_processuais)
      depositoRecursal += toNumber(v.deposito_recursal)
      depositoJudicial += toNumber(v.deposito_judicial)
      if (v.apolice === true || String(v.apolice).toLowerCase().trim() === "true") {
        apoliceCount++
      }
    })

    return { custas, depositoRecursal, depositoJudicial, apoliceCount }
  }, [valoresOperacionais])

  // 2. Calculador de KPIs Comparativos de Quarter (Provisionamento)
  const kpisProvisionamento = useMemo(() => {
    let anterior = 0
    let atual = 0

    valoresProvisionamento.forEach(v => {
      anterior += toNumber(v[`${riscoAtivo}_total_anterior`])
      atual += toNumber(v[`${riscoAtivo}_total_atual`])
    })

    return { anterior, atual }
  }, [valoresProvisionamento, riscoAtivo])

  // 3. Processamento do Detalhamento Individual (Provisionamento)
  const processosVariacao = useMemo(() => {
    const list: any[] = []

    valoresProvisionamento.forEach(v => {
      const procInfo = processos.find(p => p.numero_processo === v.numero_processo) || {}
      const reclamante = procInfo.nome_reclamante || "Não informado"
      const instancia = procInfo.instancia || "Não informado"

      const totalAnterior = toNumber(v[`${riscoAtivo}_total_anterior`])
      const totalAtual = toNumber(v[`${riscoAtivo}_total_atual`])
      const diferenca = totalAtual - totalAnterior
      const percentual = totalAnterior > 0 ? (diferenca / totalAnterior) * 100 : null

      const principalAnterior = toNumber(v[`${riscoAtivo}_principal_quarter_anterior`])
      const principalAtual = toNumber(v[`${riscoAtivo}_principal_quarter_atual`])
      const correcaoAnterior = toNumber(v[`${riscoAtivo}_correcao_quarter_anterior`])
      const correcaoAtual = toNumber(v[`${riscoAtivo}_correcao_quarter_atual`])
      const jurosAnterior = toNumber(v[`${riscoAtivo}_juros_quarter_anterior`])
      const jurosAtual = toNumber(v[`${riscoAtivo}_juros_quarter_atual`])

      const justificativa = v.justificativa_reavaliacao_quarter_atual || ""
      const valorPago = toNumber(v.valor_pago_reclamante)

      const acaoNova = isAcaoNova(justificativa, totalAnterior)

      let tipo = "Estável"
      if (acaoNova) {
        tipo = "Ação nova"
      } else if (diferenca > 0) {
        tipo = "Aumento"
      } else if (diferenca < 0) {
        tipo = "Redução"
      }

      list.push({
        numero_processo: v.numero_processo,
        reclamante,
        instancia,
        principalAnterior, principalAtual,
        correcaoAnterior, correcaoAtual,
        jurosAnterior, jurosAtual,
        totalAnterior, totalAtual,
        diferenca,
        percentual,
        tipo,
        justificativa,
        valorPago,
        acaoNova
      })
    })

    // Maiores diferenças absolutas primeiro
    return list.sort((a, b) => Math.abs(b.diferenca) - Math.abs(a.diferenca))
  }, [valoresProvisionamento, processos, riscoAtivo])

  // 4. Filtro por busca (Provisionamento)
  const filteredVariacoes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return processosVariacao

    return processosVariacao.filter(v => 
      (v.numero_processo || "").toLowerCase().includes(query) ||
      (v.reclamante || "").toLowerCase().includes(query)
    )
  }, [processosVariacao, searchQuery])

  // Paginação (Provisionamento)
  const totalPages = Math.max(1, Math.ceil(filteredVariacoes.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentVariacoes = filteredVariacoes.slice(startIndex, endIndex)

  const diffQuarter = kpisProvisionamento.atual - kpisProvisionamento.anterior
  const variationPercentLabel = kpisProvisionamento.anterior > 0 
    ? `${diffQuarter > 0 ? "+" : ""}${(diffQuarter / kpisProvisionamento.anterior * 100).toFixed(1)}%` 
    : null

  // Mensagens de Estado Vazio (Provisionamento)
  const emptyMessage = useMemo(() => {
    if (valoresProvisionamento.length === 0) {
      return "Nenhum processo disponível para este fechamento"
    }
    if (searchQuery.trim() !== "" && filteredVariacoes.length === 0) {
      return "Nenhum processo encontrado"
    }
    if (filteredVariacoes.every(v => v.totalAnterior === 0 && v.totalAtual === 0)) {
      return "Nenhuma variação identificada para o filtro atual"
    }
    return null
  }, [valoresProvisionamento, searchQuery, filteredVariacoes])

  // 5. Processamento dos Processos Operacionais (Preparo Recursal)
  const processosOperacionais = useMemo(() => {
    const list: any[] = []
    valoresOperacionais.forEach(v => {
      const procInfo = processos.find(p => p.numero_processo === v.numero_processo) || {}
      const reclamante = procInfo.nome_reclamante || "Não informado"
      const instancia = procInfo.instancia || "Não informado"

      list.push({
        numero_processo: v.numero_processo,
        reclamante,
        instancia,
        deposito_recursal: toNumber(v.deposito_recursal),
        custas_processuais: toNumber(v.custas_processuais),
        deposito_judicial: toNumber(v.deposito_judicial),
        apolice: v.apolice
      })
    })

    return list.sort((a, b) => a.numero_processo.localeCompare(b.numero_processo))
  }, [valoresOperacionais, processos])

  // Filtro por busca (Preparo Recursal)
  const filteredOperacionais = useMemo(() => {
    const query = searchQueryOp.toLowerCase().trim()
    if (!query) return processosOperacionais

    return processosOperacionais.filter(o => 
      (o.numero_processo || "").toLowerCase().includes(query) ||
      (o.reclamante || "").toLowerCase().includes(query)
    )
  }, [processosOperacionais, searchQueryOp])

  // Paginação (Preparo Recursal)
  const totalPagesOp = Math.max(1, Math.ceil(filteredOperacionais.length / ITEMS_PER_PAGE))
  const startIndexOp = (currentPageOp - 1) * ITEMS_PER_PAGE
  const endIndexOp = startIndexOp + ITEMS_PER_PAGE
  const currentOperacionais = filteredOperacionais.slice(startIndexOp, endIndexOp)

  // Mensagens de Estado Vazio (Preparo Recursal)
  const emptyMessageOp = useMemo(() => {
    if (valoresOperacionais.length === 0) {
      return "Nenhum processo disponível"
    }
    if (searchQueryOp.trim() !== "" && filteredOperacionais.length === 0) {
      return "Nenhum processo encontrado"
    }
    return null
  }, [valoresOperacionais, searchQueryOp, filteredOperacionais])

  const renderApolice = (val: any) => {
    if (val === true || String(val).toLowerCase().trim() === "true") {
      return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 shadow-none">Sim</Badge>
    }
    if (val === false || String(val).toLowerCase().trim() === "false") {
      return <Badge className="bg-red-500/10 text-red-700 border-red-200 shadow-none">Não</Badge>
    }
    return <span className="text-slate-400 font-medium text-xs">Não informado</span>
  }

  return (
    <div className="w-full bg-transparent space-y-6">
      
      {/* Abas Textuais Minimalistas (Main Navigation) */}
      <div className="flex items-center gap-8 border-b border-border/60 font-sans">
        <button
          onClick={() => setActiveMainTab("provisionamento")}
          className={`pb-3 text-[14px] transition-all focus:outline-none ${activeMainTab === "provisionamento" ? "font-bold text-[#111111] border-b-[3px] border-[#F6D000]" : "text-slate-500 font-medium hover:text-[#111111] border-b-[3px] border-transparent"}`}
        >
          Provisionamento
        </button>
        <button
          onClick={() => setActiveMainTab("preparo_recursal")}
          className={`pb-3 text-[14px] transition-all focus:outline-none ${activeMainTab === "preparo_recursal" ? "font-bold text-[#111111] border-b-[3px] border-[#F6D000]" : "text-slate-500 font-medium hover:text-[#111111] border-b-[3px] border-transparent"}`}
        >
          Preparo Recursal
        </button>
      </div>

      {activeMainTab === "provisionamento" && (
        <div className="space-y-6">
          {/* Gráfico de Análise Financeira Consolidada */}
          <FinancialAnalysis valoresRisco={valoresProvisionamento} />
          
          <Tabs defaultValue="provavel" onValueChange={(val) => { setRiscoAtivo(val); setCurrentPage(1); setExpandedRow(null); }} className="w-full space-y-6">
          
          <TabsList className="w-full flex flex-wrap justify-start gap-3 bg-transparent border-none p-0 h-auto">
            <TabsTrigger value="provavel" className="px-5 py-2 text-xs md:text-sm font-semibold rounded-md transition-all text-slate-500 border-none data-[state=active]:bg-[#183B8C] data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700">Risco Provável</TabsTrigger>
            <TabsTrigger value="possivel" className="px-5 py-2 text-xs md:text-sm font-semibold rounded-md transition-all text-slate-500 border-none data-[state=active]:bg-[#183B8C] data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700">Risco Possível</TabsTrigger>
            <TabsTrigger value="remoto" className="px-5 py-2 text-xs md:text-sm font-semibold rounded-md transition-all text-slate-500 border-none data-[state=active]:bg-[#183B8C] data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700">Risco Remoto</TabsTrigger>
          </TabsList>

          <TabsContent value={riscoAtivo} className="space-y-6 mt-0">
            
            {/* Visões de Quarter Dinâmicas */}
            <h3 className="text-[16px] font-bold text-[#111111] tracking-tight">Comparativo trimestral — Risco {formatLabel(riscoAtivo)}</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="shadow-sm border-slate-200 relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500 pr-8">Total {provisionamentoConfig.quarterAnterior}</CardTitle>
                  <div className="absolute top-3 right-3 opacity-30">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-5 overflow-hidden">
                  <div className="text-[clamp(1.1rem,3.5vw,1.875rem)] font-bold text-slate-400 tracking-tight leading-none whitespace-nowrap tabular-nums">{formatCurrency(kpisProvisionamento.anterior)}</div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border-slate-200 relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500 pr-8">Total {provisionamentoConfig.quarterAtual}</CardTitle>
                  <div className="absolute top-3 right-3 opacity-50">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-5 overflow-hidden">
                  <div className="text-[clamp(1.1rem,3.5vw,1.875rem)] font-bold text-slate-800 tracking-tight leading-none whitespace-nowrap tabular-nums">{formatCurrency(kpisProvisionamento.atual)}</div>
                </CardContent>
              </Card>

              <Card className={`shadow-sm border-slate-200 ${diffQuarter > 0 ? "bg-destructive/5" : diffQuarter < 0 ? "bg-emerald-500/5" : "bg-muted/5"}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
                  <CardTitle className={`text-[11px] font-bold uppercase tracking-[0.04em] ${diffQuarter > 0 ? "text-destructive" : diffQuarter < 0 ? "text-emerald-600" : "text-slate-500"}`}>Variação do Período</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-5 overflow-hidden">
                    <div className={`text-[clamp(1.1rem,3.5vw,1.875rem)] font-bold tracking-tight leading-none whitespace-nowrap tabular-nums ${diffQuarter > 0 ? "text-destructive" : diffQuarter < 0 ? "text-emerald-600" : "text-slate-500"}`}>
                      {diffQuarter > 0 ? '+' : ''}{formatCurrency(diffQuarter)}
                      {variationPercentLabel && <span className="text-xs font-semibold ml-2">({variationPercentLabel})</span>}
                    </div>
                    <div className="text-[10px] mt-2 font-bold flex items-center gap-1 uppercase tracking-tight text-slate-400">
                      {diffQuarter > 0 ? <ArrowUpIcon className="h-3 w-3 text-destructive" /> : diffQuarter < 0 ? <ArrowDownIcon className="h-3 w-3 text-emerald-600" /> : <ArrowRightIcon className="h-3 w-3" />}
                      {diffQuarter > 0 ? "Aumento de Provisão" : diffQuarter < 0 ? "Redução de Passivo" : "Estável"}
                    </div>
                </CardContent>
              </Card>
            </div>

            {/* Análise de Processos Drill-down - NOVA VERSÃO (CARDS EXPANSÍVEIS) */}
            <Card className="shadow-sm border border-slate-200 mt-8 bg-card">
              <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 pt-4 px-5">
                <CardTitle className="text-[18px] font-bold text-[#111111] tracking-tight">
                  Detalhamento individual da variação
                </CardTitle>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por número ou reclamante..." 
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
                  {currentVariacoes.length > 0 ? (
                    currentVariacoes.map((item) => {
                      const isExpanded = expandedRow === item.numero_processo
                      const isAumento = item.diferenca > 0

                      return (
                        <div key={item.numero_processo} className="border border-slate-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-300 bg-white">
                          {/* LINHA RESUMO (sempre visível) */}
                          <button
                            type="button"
                            onClick={() => setExpandedRow(isExpanded ? null : item.numero_processo)}
                            className="w-full flex flex-col md:flex-row justify-between items-start md:items-center pl-5 pr-6 py-4 transition-colors hover:bg-blue-50/30 gap-4 text-left cursor-pointer group"
                          >
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 flex-1">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-slate-900 text-[13px] tracking-tight group-hover:text-[#183B8C] transition-colors">{item.numero_processo}</span>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight truncate max-w-[280px]">
                                  {formatLabel(item.reclamante)} — {formatLabel(item.instancia)}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap gap-x-6 gap-y-1 items-center ml-auto md:ml-0">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                                  {provisionamentoConfig.quarterAnterior}: {item.acaoNova ? "Não aplicável" : formatCurrency(item.totalAnterior)}
                                </span>
                                
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                                  {provisionamentoConfig.quarterAtual}: {formatCurrency(item.totalAtual)}
                                </span>
                                
                                <span className={`text-[11px] font-bold uppercase tracking-tight ${item.acaoNova ? 'text-blue-600' : isAumento ? 'text-destructive' : item.diferenca < 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                                  {item.acaoNova ? 'NOVA' : `VARIAÇÃO: ${isAumento ? '+' : ''}${formatCurrency(item.diferenca)}`}
                                  {!item.acaoNova && item.percentual !== null && ` (${isAumento ? "+" : ""}${item.percentual.toFixed(1)}%)`}
                                </span>
                              </div>
                            </div>
 
                            <div className="flex items-center gap-5 shrink-0 ml-auto">
                              <Badge variant="outline" className={`px-2.5 py-0.5 font-bold uppercase text-[10px] border-transparent shadow-none ${
                                item.tipo === "Ação nova" ? 'bg-blue-100 text-blue-800' :
                                item.tipo === "Aumento" ? 'bg-destructive/10 text-destructive' :
                                item.tipo === "Redução" ? 'bg-emerald-500/10 text-emerald-600' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {item.tipo}
                              </Badge>
                              <div className="p-1 rounded-md text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-all">
                                <ChevronDown className={`h-6 w-6 transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-180 text-[#183B8C]' : ''}`} />
                              </div>
                            </div>
                          </button>

                          {/* PAINEL EXPANDIDO — Layout Tabular Full-Width */}
                          {isExpanded && (
                            <div className="border-t border-slate-200 bg-white">

                              <div className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                  <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-[0.04em]">Principal</span>
                                    <div className="font-medium mt-2 text-slate-500">Ant: {item.acaoNova ? "—" : formatCurrency(item.principalAnterior)}</div>
                                    <div className="font-bold text-slate-900">Atu: {formatCurrency(item.principalAtual)}</div>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-[0.04em]">Correção</span>
                                    <div className="font-medium mt-2 text-slate-500">Ant: {item.acaoNova ? "—" : formatCurrency(item.correcaoAnterior)}</div>
                                    <div className="font-bold text-slate-900">Atu: {formatCurrency(item.correcaoAtual)}</div>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-[0.04em]">Juros</span>
                                    <div className="font-medium mt-2 text-slate-500">Ant: {item.acaoNova ? "—" : formatCurrency(item.jurosAnterior)}</div>
                                    <div className="font-bold text-slate-900">Atu: {formatCurrency(item.jurosAtual)}</div>
                                  </div>
                                  <div className="border-l border-slate-200 pl-4">
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-[0.04em]">Soma Total</span>
                                    <div className="font-medium mt-2 text-slate-500">Ant: {item.acaoNova ? "Não aplicável" : formatCurrency(item.totalAnterior)}</div>
                                    <div className="font-bold text-slate-900">Atu: {formatCurrency(item.totalAtual)}</div>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2 mt-4">
                                  {item.justificativa && (
                                    <div className="bg-white border-l-4 border-l-[#183B8C] border-y border-r border-slate-200 rounded p-3 text-[11px] flex items-start gap-3 shadow-sm">
                                      <span className="font-bold text-[#111111] uppercase tracking-tight whitespace-nowrap pt-0.5">Justificativa:</span>
                                      <span className="italic text-slate-600 font-medium pt-0.5">{item.justificativa}</span>
                                    </div>
                                  )}
                                  {item.valorPago > 0 && (
                                    <div className="bg-emerald-50 border-l-4 border-l-emerald-600 border-y border-r border-emerald-100 rounded p-3 text-[11px] flex items-start gap-3 shadow-sm">
                                      <span className="font-bold text-emerald-700 uppercase tracking-tight whitespace-nowrap pt-0.5">Valor Pago ao Reclamante:</span>
                                      <span className="font-bold text-emerald-800 pt-0.5">{formatCurrency(item.valorPago)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="py-12 text-center text-muted-foreground border border-dashed border-slate-300 rounded-lg bg-slate-50/50 text-sm font-medium">
                      {emptyMessage || "Nenhum processo com variação."}
                    </div>
                  )}
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 mt-4 pt-4 px-2 gap-4">
                    <div className="text-sm text-slate-500 font-medium">
                      Mostrando <span className="font-bold text-slate-700">{startIndex + 1}</span> a <span className="font-bold text-slate-700">{Math.min(endIndex, filteredVariacoes.length)}</span> de <span className="font-bold text-slate-700">{filteredVariacoes.length}</span> registros
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-slate-600"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <div className="text-sm font-semibold bg-slate-100 px-3 py-1.5 rounded-md text-slate-700">
                        Página {currentPage} de {totalPages}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-slate-600"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </TabsContent>
          </Tabs>
        </div>
      )}

      {activeMainTab === "preparo_recursal" && (
        <div className="space-y-6 pt-2">
          {/* Gestão de Custos e Garantias */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
                <CardTitle className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.04em]">Custas Processuais</CardTitle>
                <Landmark className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent className="px-5 pb-5 overflow-hidden">
                <div className="text-[clamp(1.25rem,4vw,2rem)] font-bold text-slate-800 tracking-tight leading-none whitespace-nowrap tabular-nums">{formatCurrency(kpisOperacionais.custas)}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
                <CardTitle className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.04em]">Depósitos Recursais</CardTitle>
                <WalletCards className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent className="px-5 pb-5 overflow-hidden">
                <div className="text-[clamp(1.25rem,4vw,2rem)] font-bold text-slate-800 tracking-tight leading-none whitespace-nowrap tabular-nums">{formatCurrency(kpisOperacionais.depositoRecursal)}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
                <CardTitle className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.04em]">Depósitos Judiciais</CardTitle>
                <Landmark className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent className="px-5 pb-5 overflow-hidden">
                <div className="text-[clamp(1.25rem,4vw,2rem)] font-bold text-slate-800 tracking-tight leading-none whitespace-nowrap tabular-nums">{formatCurrency(kpisOperacionais.depositoJudicial)}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
                <CardTitle className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.04em]">Apólices / Seguros</CardTitle>
                <ShieldCheck className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="text-[32px] font-bold text-slate-800 tracking-tight leading-none">{kpisOperacionais.apoliceCount}</div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-2">Apólices ativas</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Detalhamento de Valores Operacionais */}
          <Card className="shadow-sm border border-slate-200 mt-8 bg-card">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 pt-4 px-5">
              <div className="space-y-1">
                <CardTitle className="text-[18px] font-bold text-[#111111] tracking-tight">
                  Detalhamento de Custos e Garantias
                </CardTitle>
                <p className="text-[11px] text-slate-400 font-medium">Listagem detalhada das garantias e custas processuais por processo ativo</p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por número ou reclamante..." 
                  className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm h-10"
                  value={searchQueryOp}
                  onChange={(e) => {
                    setSearchQueryOp(e.target.value)
                    setCurrentPageOp(1)
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-[#111111] shadow-sm">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="font-bold text-white text-[11px] uppercase tracking-[0.04em] py-3 pl-6 w-[200px]">Processo</TableHead>
                      <TableHead className="font-bold text-white text-[11px] uppercase tracking-[0.04em] py-3 min-w-[200px]">Reclamante</TableHead>
                      <TableHead className="font-bold text-white text-[11px] uppercase tracking-[0.04em] py-3 text-right min-w-[140px]">Depósito Recursal</TableHead>
                      <TableHead className="font-bold text-white text-[11px] uppercase tracking-[0.04em] py-3 text-right min-w-[140px]">Custas Processuais</TableHead>
                      <TableHead className="font-bold text-white text-[11px] uppercase tracking-[0.04em] py-3 text-center min-w-[120px]">Apólice</TableHead>
                      <TableHead className="font-bold text-white text-[11px] uppercase tracking-[0.04em] py-3 text-right pr-6 min-w-[140px]">Depósito Judicial</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOperacionais.length > 0 ? (
                      currentOperacionais.map((item, idx) => (
                        <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors group">
                          <TableCell className="py-2.5 pl-6 font-mono text-[11px] font-bold text-slate-500">
                            {item.numero_processo}
                          </TableCell>
                          <TableCell className="py-2.5">
                            <span className="font-bold text-slate-900 text-[11px] uppercase tracking-tight">{formatLabel(item.reclamante)}</span>
                          </TableCell>
                          <TableCell className="py-2.5 text-right font-bold text-slate-700 text-[11px] tabular-nums">
                            {formatCurrency(item.deposito_recursal)}
                          </TableCell>
                          <TableCell className="py-2.5 text-right font-bold text-slate-700 text-[11px] tabular-nums">
                            {formatCurrency(item.custas_processuais)}
                          </TableCell>
                          <TableCell className="py-2.5 text-center">
                            {renderApolice(item.apolice)}
                          </TableCell>
                          <TableCell className="py-2.5 text-right pr-6 font-bold text-slate-700 text-[11px] tabular-nums">
                            {formatCurrency(item.deposito_judicial)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-40 text-center text-muted-foreground italic text-sm font-medium">
                          {emptyMessageOp || "Nenhum valor operacional disponível."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação Operacional */}
              {totalPagesOp > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 mt-4 pt-4 pb-4 px-6 gap-4">
                  <div className="text-sm text-slate-500 font-medium">
                    Mostrando <span className="font-bold text-slate-700">{startIndexOp + 1}</span> a <span className="font-bold text-slate-700">{Math.min(endIndexOp, filteredOperacionais.length)}</span> de <span className="font-bold text-slate-700">{filteredOperacionais.length}</span> registros
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPageOp(prev => Math.max(1, prev - 1))}
                      disabled={currentPageOp === 1}
                      className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-slate-600"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="text-sm font-semibold bg-slate-100 px-3 py-1.5 rounded-md text-slate-700">
                      Página {currentPageOp} de {totalPagesOp}
                    </div>
                    <button
                      onClick={() => setCurrentPageOp(prev => Math.min(totalPagesOp, prev + 1))}
                      disabled={currentPageOp === totalPagesOp}
                      className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-slate-600"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
