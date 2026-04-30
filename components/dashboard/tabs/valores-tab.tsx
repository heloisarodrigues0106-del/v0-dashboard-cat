import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, DollarSign, WalletCards, Landmark, ShieldCheck, Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { FinancialAnalysis } from "../financial-analysis"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value || 0)
}

const ITEMS_PER_PAGE = 10

export function ValoresTab({ valores }: { valores: any[] }) {
  const [riscoAtivo, setRiscoAtivo] = useState("provavel")
  const [activeMainTab, setActiveMainTab] = useState("provisionamento")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  
  const { kpis, processosVariacao } = useMemo(() => {
    let kpiGeral = {
      custas: 0,
      depositoRecursal: 0,
      apolice: 0,
      depositoJudicial: 0
    }
    let kpiQuarter = {
      atual: 0,
      anterior: 0
    }

    const variacoes: any[] = []

    valores.forEach(v => {
      // Gerais
      kpiGeral.custas += (Number(v.custas_processuais) || 0)
      kpiGeral.depositoRecursal += (Number(v.deposito_recursal) || 0)
      if (v.apolice === true || String(v.apolice || "").toLowerCase().trim() === "true") kpiGeral.apolice++
      kpiGeral.depositoJudicial += (Number(v.deposito_judicial) || 0)

      // Usar os campos consolidados do Quarter Atual
      const totalAtual = Number(v[`${riscoAtivo}_total_atual`]) || 0
      const totalAnterior = Number(v[`${riscoAtivo}_total_anterior`]) || 0

      kpiQuarter.atual += totalAtual
      kpiQuarter.anterior += totalAnterior

      // Para o drill-down detalhado, ainda mantemos os campos individuais se existirem
      const principalAtual = Number(v[`${riscoAtivo}_principal_quarter_atual`]) || 0
      const correcaoAtual = Number(v[`${riscoAtivo}_correcao_quarter_atual`]) || 0
      const jurosAtual = Number(v[`${riscoAtivo}_juros_quarter_atual`]) || 0

      const principalAnterior = Number(v[`${riscoAtivo}_principal_quarter_anterior`]) || 0
      const correcaoAnterior = Number(v[`${riscoAtivo}_correcao_quarter_anterior`]) || 0
      const jurosAnterior = Number(v[`${riscoAtivo}_juros_quarter_anterior`]) || 0

      // Análise de Variação (Drill-Down Logic)
      if (totalAtual !== totalAnterior) {
        let diff = totalAtual - totalAnterior
        let percentual = totalAnterior > 0 ? (diff / totalAnterior) * 100 : 100

        variacoes.push({
          numero_processo: v.numero_processo,
          principalAnterior, principalAtual,
          correcaoAnterior, correcaoAtual,
          jurosAnterior, jurosAtual,
          totalAnterior, totalAtual,
          diferenca: diff,
          percentual: percentual,
          tipo: diff > 0 ? "Aumento de Provisão" : "Redução de Passivo",
          justificativa: v.justificativa_reavaliacao_quarter_atual || "Sem justificativa de campo"
        })
      }
    })

    // Ordenar variações (maiores diferenças absolutas primeiro)
    variacoes.sort((a, b) => Math.abs(b.diferenca) - Math.abs(a.diferenca))

    return { kpis: { geral: kpiGeral, quarter: kpiQuarter }, processosVariacao: variacoes }
  }, [valores, riscoAtivo])

  const filteredVariacoes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return processosVariacao

    return processosVariacao.filter((v) => 
      (v.numero_processo || "").toLowerCase().includes(query)
    )
  }, [processosVariacao, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredVariacoes.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentVariacoes = filteredVariacoes.slice(startIndex, endIndex)

  const diffQuarter = kpis.quarter.atual - kpis.quarter.anterior

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
          <FinancialAnalysis valoresRisco={valores} />
          
          <Tabs defaultValue="provavel" onValueChange={(val) => { setRiscoAtivo(val); setCurrentPage(1); setExpandedRow(null); }} className="w-full space-y-6">
          
          <TabsList className="w-full flex flex-wrap justify-start gap-3 bg-transparent border-none p-0 h-auto">
            <TabsTrigger value="provavel" className="px-5 py-2 text-xs md:text-sm font-semibold rounded-md transition-all text-slate-500 border-none data-[state=active]:bg-[#183B8C] data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700">Risco Provável</TabsTrigger>
            <TabsTrigger value="possivel" className="px-5 py-2 text-xs md:text-sm font-semibold rounded-md transition-all text-slate-500 border-none data-[state=active]:bg-[#183B8C] data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700">Risco Possível</TabsTrigger>
            <TabsTrigger value="remoto" className="px-5 py-2 text-xs md:text-sm font-semibold rounded-md transition-all text-slate-500 border-none data-[state=active]:bg-[#183B8C] data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700">Risco Remoto</TabsTrigger>
          </TabsList>

          <TabsContent value={riscoAtivo} className="space-y-6 mt-0">
            
            {/* Visões de Quarter Dinâmicas */}
            <h3 className="text-[16px] font-bold text-[#111111] tracking-tight">Comparativo trimestral - risco {riscoAtivo.charAt(0).toUpperCase() + riscoAtivo.slice(1)}</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">Total Quarter Anterior</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground/50" />
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="text-[32px] font-bold text-slate-400 tracking-tight leading-none">{formatCurrency(kpis.quarter.anterior)}</div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">Total Quarter Atual</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="text-[32px] font-bold text-slate-800 tracking-tight leading-none">{formatCurrency(kpis.quarter.atual)}</div>
                </CardContent>
              </Card>

              <Card className={`shadow-sm border-slate-200 ${diffQuarter > 0 ? "bg-destructive/5" : diffQuarter < 0 ? "bg-emerald-500/5" : "bg-muted/5"}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
                  <CardTitle className={`text-[11px] font-bold uppercase tracking-[0.04em] ${diffQuarter > 0 ? "text-destructive" : diffQuarter < 0 ? "text-emerald-600" : "text-slate-500"}`}>Variação do Período</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    <div className={`text-[32px] font-bold tracking-tight leading-none ${diffQuarter > 0 ? "text-destructive" : diffQuarter < 0 ? "text-emerald-600" : "text-slate-500"}`}>
                      {diffQuarter > 0 ? '+' : ''}{formatCurrency(diffQuarter)}
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
                    placeholder="Buscar por número do processo..." 
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
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-900 text-[13px] tracking-tight group-hover:text-[#183B8C] transition-colors">{item.numero_processo}</span>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Q. ANTERIOR: {formatCurrency(item.totalAnterior)}</span>
                              </div>
                              
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Q. ATUAL: {formatCurrency(item.totalAtual)}</span>
                              
                              <span className={`text-[11px] font-bold uppercase tracking-tight ${isAumento ? 'text-destructive' : 'text-emerald-600'}`}>
                                DIFERENÇA: {isAumento ? '+' : ''}{formatCurrency(item.diferenca)}
                              </span>
                            </div>
 
                            <div className="flex items-center gap-5 shrink-0 ml-auto">
                              <Badge variant="outline" className={`px-2.5 py-0.5 font-bold uppercase text-[10px] border-transparent shadow-none ${isAumento ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-600'}`}>
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
                                    <div className="font-medium mt-2 text-slate-500">Ant: {formatCurrency(item.principalAnterior)}</div>
                                    <div className="font-bold text-slate-900">Atu: {formatCurrency(item.principalAtual)}</div>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-[0.04em]">Correção</span>
                                    <div className="font-medium mt-2 text-slate-500">Ant: {formatCurrency(item.correcaoAnterior)}</div>
                                    <div className="font-bold text-slate-900">Atu: {formatCurrency(item.correcaoAtual)}</div>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-[0.04em]">Juros</span>
                                    <div className="font-medium mt-2 text-slate-500">Ant: {formatCurrency(item.jurosAnterior)}</div>
                                    <div className="font-bold text-slate-900">Atu: {formatCurrency(item.jurosAtual)}</div>
                                  </div>
                                  <div className="border-l border-slate-200 pl-4">
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-[0.04em]">Soma Total</span>
                                    <div className="font-medium mt-2 text-slate-500">Ant: {formatCurrency(item.totalAnterior)}</div>
                                    <div className="font-bold text-slate-900">Atu: {formatCurrency(item.totalAtual)}</div>
                                  </div>
                                </div>

                                {item.justificativa && (
                                  <div className="mt-4 bg-white border-l-4 border-l-[#183B8C] border-y border-r border-slate-200 rounded p-3 text-[11px] flex items-start gap-3 shadow-sm">
                                    <span className="font-bold text-[#111111] uppercase tracking-tight whitespace-nowrap pt-0.5">Justificativa:</span>
                                    <span className="italic text-slate-600 font-medium pt-0.5">{item.justificativa}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="py-12 text-center text-muted-foreground border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
                      Nenhum processo encontrado na busca ou variação registrada entre os trimestres.
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
              <CardContent className="px-5 pb-5">
                <div className="text-[32px] font-bold text-slate-800 tracking-tight leading-none">{formatCurrency(kpis.geral.custas)}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
                <CardTitle className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.04em]">Depósitos Recursais</CardTitle>
                <WalletCards className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="text-[32px] font-bold text-slate-800 tracking-tight leading-none">{formatCurrency(kpis.geral.depositoRecursal)}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
                <CardTitle className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.04em]">Depósitos Judiciais</CardTitle>
                <Landmark className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="text-[32px] font-bold text-slate-800 tracking-tight leading-none">{formatCurrency(kpis.geral.depositoJudicial)}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
                <CardTitle className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.04em]">Apolice/Seguro</CardTitle>
                <ShieldCheck className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="text-[32px] font-bold text-slate-800 tracking-tight leading-none">{kpis.geral.apolice}</div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-2">Registros ativos</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
