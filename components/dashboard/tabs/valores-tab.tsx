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
      <div className="flex items-center gap-8 border-b border-border/60">
        <button
          onClick={() => setActiveMainTab("provisionamento")}
          className={`pb-3 text-sm transition-all focus:outline-none ${activeMainTab === "provisionamento" ? "font-bold text-[#111111] border-b-[3px] border-[#FFCD00]" : "text-slate-500 font-medium hover:text-[#111111] border-b-[3px] border-transparent"}`}
        >
          Provisionamento
        </button>
        <button
          onClick={() => setActiveMainTab("preparo_recursal")}
          className={`pb-3 text-sm transition-all focus:outline-none ${activeMainTab === "preparo_recursal" ? "font-bold text-[#111111] border-b-[3px] border-[#FFCD00]" : "text-slate-500 font-medium hover:text-[#111111] border-b-[3px] border-transparent"}`}
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
            <TabsTrigger value="provavel" className="px-5 py-2 text-xs md:text-sm font-semibold rounded-md transition-all text-slate-500 border-none data-[state=active]:bg-[#FFCD00] data-[state=active]:text-[#111111] data-[state=active]:shadow-sm hover:text-slate-700">Risco Provável</TabsTrigger>
            <TabsTrigger value="possivel" className="px-5 py-2 text-xs md:text-sm font-semibold rounded-md transition-all text-slate-500 border-none data-[state=active]:bg-[#FFCD00] data-[state=active]:text-[#111111] data-[state=active]:shadow-sm hover:text-slate-700">Risco Possível</TabsTrigger>
            <TabsTrigger value="remoto" className="px-5 py-2 text-xs md:text-sm font-semibold rounded-md transition-all text-slate-500 border-none data-[state=active]:bg-[#FFCD00] data-[state=active]:text-[#111111] data-[state=active]:shadow-sm hover:text-slate-700">Risco Remoto</TabsTrigger>
          </TabsList>

          <TabsContent value={riscoAtivo} className="space-y-6 mt-0">
            
            {/* Visões de Quarter Dinâmicas */}
            <h3 className="text-lg font-medium">Comparativo Trimestral - Risco {riscoAtivo.charAt(0).toUpperCase() + riscoAtivo.slice(1)}</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Quarter Anterior</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground/50" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-muted-foreground">{formatCurrency(kpis.quarter.anterior)}</div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Quarter Atual</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{formatCurrency(kpis.quarter.atual)}</div>
                </CardContent>
              </Card>

              <Card className={`shadow-sm border-slate-200 ${diffQuarter > 0 ? "bg-destructive/5" : diffQuarter < 0 ? "bg-emerald-500/5" : "bg-muted/5"}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium ${diffQuarter > 0 ? "text-destructive" : diffQuarter < 0 ? "text-emerald-600" : "text-muted-foreground"}`}>Variação do Período</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-xl md:text-2xl font-bold ${diffQuarter > 0 ? "text-destructive" : diffQuarter < 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {diffQuarter > 0 ? '+' : ''}{formatCurrency(diffQuarter)}
                    </div>
                    <div className="text-xs mt-1 font-medium flex items-center gap-1 text-muted-foreground">
                      {diffQuarter > 0 ? <ArrowUpIcon className="h-3 w-3 text-destructive" /> : diffQuarter < 0 ? <ArrowDownIcon className="h-3 w-3 text-emerald-600" /> : <ArrowRightIcon className="h-3 w-3" />}
                      {diffQuarter > 0 ? "Aumento de Provisão" : diffQuarter < 0 ? "Redução de Passivo" : "Estável"}
                    </div>
                </CardContent>
              </Card>
            </div>

            {/* Análise de Processos Drill-down - NOVA VERSÃO (CARDS EXPANSÍVEIS) */}
            <Card className="shadow-sm border border-slate-200 mt-8 bg-card">
              <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6">
                <CardTitle className="text-xl font-bold text-card-foreground">
                  Detalhamento Individual da Variação
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
                            className="w-full flex flex-col md:flex-row justify-between items-start md:items-center pl-5 pr-6 py-4 transition-colors hover:bg-amber-50/30 gap-3 text-left cursor-pointer group"
                          >
                            <div className="w-full md:w-[30%] flex flex-col gap-0.5 shrink-0">
                              <span className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-amber-600 transition-colors">{item.numero_processo}</span>
                              <span className="text-[11px] font-bold text-slate-500 uppercase">Q. Anterior: {formatCurrency(item.totalAnterior)}</span>
                            </div>
                            
                            <div className="w-full md:w-[25%] shrink-0">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Q. Atual</span>
                              <span className="text-sm font-semibold text-slate-800">{formatCurrency(item.totalAtual)}</span>
                            </div>

                            <div className="w-full md:w-[20%] shrink-0">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Diferença</span>
                              <span className={`text-sm font-bold ${isAumento ? 'text-destructive' : 'text-emerald-500'}`}>
                                {isAumento ? '+' : ''}{formatCurrency(item.diferenca)}
                              </span>
                            </div>

                            <div className="flex items-center w-full md:flex-1 gap-5 justify-between md:justify-end shrink-0">
                              <Badge variant="outline" className={`px-2.5 py-0.5 font-bold uppercase text-[10px] border-transparent shadow-none ${isAumento ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                {item.tipo}
                              </Badge>
                              <div className="p-1 rounded-md text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-all">
                                <ChevronDown className={`h-6 w-6 transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-180 text-amber-500' : ''}`} />
                              </div>
                            </div>
                          </button>

                          {/* PAINEL EXPANDIDO — Layout Tabular Full-Width */}
                          {isExpanded && (
                            <div className="border-t border-slate-200 bg-white">
                              {/* Cabeçalho estilo Reintegração */}
                              <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-100 bg-slate-50">
                                <div className="w-1 h-8 bg-[#F6D000] rounded-full shrink-0" />
                                <div>
                                  <h3 className="text-base font-bold text-slate-900 leading-tight">{item.numero_processo}</h3>
                                  <p className="text-sm text-slate-500">
                                    Abertura de Valores do Quarter
                                  </p>
                                </div>
                              </div>

                              <div className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                  <div>
                                    <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wide">Principal</span>
                                    <div className="font-medium mt-2 text-slate-500">Ant: {formatCurrency(item.principalAnterior)}</div>
                                    <div className="font-bold text-slate-900">Atu: {formatCurrency(item.principalAtual)}</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wide">Correção</span>
                                    <div className="font-medium mt-2 text-slate-500">Ant: {formatCurrency(item.correcaoAnterior)}</div>
                                    <div className="font-bold text-slate-900">Atu: {formatCurrency(item.correcaoAtual)}</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wide">Juros</span>
                                    <div className="font-medium mt-2 text-slate-500">Ant: {formatCurrency(item.jurosAnterior)}</div>
                                    <div className="font-bold text-slate-900">Atu: {formatCurrency(item.jurosAtual)}</div>
                                  </div>
                                  <div className="border-l border-slate-200 pl-4">
                                    <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wide">Soma Total</span>
                                    <div className="font-medium mt-2 text-slate-500">Ant: {formatCurrency(item.totalAnterior)}</div>
                                    <div className="font-bold text-slate-900">Atu: {formatCurrency(item.totalAtual)}</div>
                                  </div>
                                </div>

                                {item.justificativa && (
                                  <div className="mt-4 bg-white border-l-4 border-l-[#FFCD00] border-y border-r border-slate-200 rounded p-3 text-sm flex items-start gap-3 shadow-sm">
                                    <span className="font-semibold text-[#111111] whitespace-nowrap pt-0.5">Justificativa:</span>
                                    <span className="italic text-slate-600 pt-0.5">{item.justificativa}</span>
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-widest">Custas Processuais</CardTitle>
                <Landmark className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-slate-800">{formatCurrency(kpis.geral.custas)}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-widest">Depósitos Recursais</CardTitle>
                <WalletCards className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-slate-800">{formatCurrency(kpis.geral.depositoRecursal)}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-widest">Depósitos Judiciais</CardTitle>
                <Landmark className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-slate-800">{formatCurrency(kpis.geral.depositoJudicial)}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-widest">Apolice/Seguro</CardTitle>
                <ShieldCheck className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-slate-800">{kpis.geral.apolice}</div>
                <p className="text-xs text-muted-foreground font-medium mt-1">Registros ativos</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
