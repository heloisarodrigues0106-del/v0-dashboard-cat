import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ScatterChart, Scatter, ComposedChart, Line, Legend
} from "recharts"
import { TrendingDown, Percent, CheckCircle2, Search, DollarSign, ArrowDownRight } from "lucide-react"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value || 0)
}

function formatPercent(value: number) {
  return `${(value || 0).toFixed(1)}%`
}

export function AcordosTab({ processos = [], valores = [] }: { processos: any[], valores?: any[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const { metrics, chartData, scatterData, listAcordos } = useMemo(() => {
    // Filtrar apenas processos com status ACORDO (independente de maiúsculo/minúsculo)
    const acordos = processos.filter(p => {
      const status = String(p?.status || "").toUpperCase();
      return status === 'ACORDO' || status.includes('ACORDO CELEBRADO') || status.includes('ACORDO JUDICIAL');
    })
    
    // Mapear valores por numero_processo para acesso rápido
    const valoresMap = new Map()
    if (valores) {
      valores.forEach(v => {
        valoresMap.set(v.numero_processo, v)
      })
    }
    
    let totalCausa = 0
    let totalAcordado = 0
    
    const validScatterData: any[] = []
    const mappedAcordos: any[] = []

    acordos.forEach(p => {
      // 1. Identificar o valor base de risco. 
      // Busca a provisão anterior, se não tiver usa a atual, se não tiver usa o valor da causa bruto
      const valorRecord = valoresMap.get(p.numero_processo)
      let riscoProvavel = 0
      
      if (valorRecord) {
        riscoProvavel = Number(valorRecord.provavel_total_anterior) || Number(valorRecord.provavel_total_atual) || 0
      }
      
      const causa = riscoProvavel > 0 ? riscoProvavel : Number(p.valor_causa || p.valor_acao || 0)
      const acordado = Number(p.valor_acordo || 0)
      
      // Apenas somamos para a métrica de ECONOMIA se houver um valor base para comparar
      if (causa > 0) {
        totalCausa += causa
        totalAcordado += acordado
      }
      
      // Cálculo de economia individual para a lista
      const savingVal = causa - acordado
      const savingPerc = causa > 0 ? (savingVal / causa) * 100 : 0
      
      if (causa > 0 || acordado > 0) {
        validScatterData.push({
          x: causa,
          y: acordado,
          economia: savingVal
        })
      }

      mappedAcordos.push({
        numero: p.numero_processo,
        reclamante: p.nome_reclamante || "Não informado",
        juizo: `${p.vara || "?"} VARA DE ${p.comarca || "?"}`.toUpperCase(),
        advogado: p.advogado_reclamante || "Não informado",
        valorOriginal: causa,
        valorAcordo: acordado,
        savingValor: savingVal,
        savingPercent: savingPerc,
        funcao: p.funcao_reclamante || "Não informada",
        usouRiscoProvavel: riscoProvavel > 0
      })
    })

    // Filter by search query
    const filteredAcordos = mappedAcordos.filter(a => 
      a.reclamante.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.advogado.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.funcao.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    const economiaTotal = totalCausa - totalAcordado
    const taxaEconomia = totalCausa > 0 ? (economiaTotal / totalCausa) * 100 : 0
    const qtdAcordos = acordos.length
    
    const mediaCausa = qtdAcordos > 0 ? totalCausa / qtdAcordos : 0
    const mediaAcordado = qtdAcordos > 0 ? totalAcordado / qtdAcordos : 0
    const mediaEconomia = qtdAcordos > 0 ? economiaTotal / qtdAcordos : 0

    return {
      metrics: {
        totalCausa,
        totalAcordado,
        economiaTotal,
        taxaEconomia,
        qtdAcordos,
        mediaDesconto: taxaEconomia
      },
      chartData: [
        { name: "Valor Total da Causa", total: totalCausa, media: mediaCausa },
        { name: "Valor Total Acordado", total: totalAcordado, media: mediaAcordado },
        { name: "Economia Total Gerada", total: economiaTotal, media: mediaEconomia }
      ],
      scatterData: validScatterData,
      listAcordos: filteredAcordos
    }
  }, [processos, valores, searchQuery])
  
  return (
    <div className="space-y-6">
      
      {/* Big Green Banner */}
      <Card className="bg-emerald-50 border-emerald-100 overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-emerald-100/50 to-transparent pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center text-emerald-700 font-semibold gap-2">
                <TrendingDown className="h-5 w-5" />
                <span>Economia Total Gerada</span>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-emerald-700">
                {formatCurrency(metrics.economiaTotal)}
              </div>
              <p className="text-emerald-700/80 text-sm">Diferença entre valor da causa e valor acordado</p>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100/50 flex flex-col items-center justify-center min-w-[120px]">
                <Percent className="h-6 w-6 text-emerald-600 mb-2" />
                <span className="text-2xl font-bold text-emerald-700">{formatPercent(metrics.taxaEconomia)}</span>
                <span className="text-xs text-emerald-600/80 font-medium">Taxa de Economia</span>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100/50 flex flex-col items-center justify-center min-w-[120px]">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mb-2" />
                <span className="text-2xl font-bold text-emerald-700">{metrics.qtdAcordos}</span>
                <span className="text-xs text-emerald-600/80 font-medium">Acordos Fechados</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3 Summary Cards */}
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total da Causa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{formatCurrency(metrics.totalCausa)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total Acordado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{formatCurrency(metrics.totalAcordado)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Média de Desconto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{formatPercent(metrics.mediaDesconto)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Totais e Média */}
        <Card className="flex flex-col min-w-0">
          <CardHeader>
            <CardTitle className="text-base">Totais e Média por Acordo</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-x-auto">
            <div className="h-[350px] min-w-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                  <YAxis 
                    yAxisId="left"
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name === 'total' ? 'Total' : 'Média']}
                  />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-sm font-medium capitalize">{value}</span>} />
                  <Bar yAxisId="left" dataKey="total" fill="#F6D000" radius={[4, 4, 0, 0]} maxBarSize={150} />
                  <Line yAxisId="left" type="monotone" dataKey="media" stroke="#0f172a" strokeWidth={2} dot={{ r: 4, fill: "#0f172a" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Scatter Causa vs Acordo */}
        <Card className="flex flex-col min-w-0">
          <CardHeader>
            <CardTitle className="text-base">Comparativo: Valor da Causa vs Valor do Acordo</CardTitle>
            <div className="flex gap-4 text-xs text-muted-foreground mt-1">
              <span>Eixo X: Valor da Causa</span>
              <span>Eixo Y: Valor do Acordo</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-x-auto">
            <div className="h-[350px] min-w-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Valor da Causa"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}K` : val}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Valor do Acordo"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}K` : val}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <RechartsTooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  />
                  <Scatter name="Valor da Causa" data={scatterData} fill="#F6D000" />
                  <Legend verticalAlign="bottom" height={36} formatter={(val) => <span className="text-sm font-medium">Valor da Causa</span>}/>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
      {/* Detailed Agreement Table Card */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-7 bg-emerald-500 rounded-full"></span>
              Detalhamento de Acordos e Savings
            </CardTitle>
            <p className="text-sm text-muted-foreground">Listagem técnica de negociações e economia gerada</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar reclamante, advogado ou cargo..." 
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[1100px] p-0">
              <Table>
              <TableHeader className="sticky top-0 z-10 bg-slate-50 border-b shadow-sm">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-slate-800 py-3 pl-6 w-[180px]">Processo</TableHead>
                  <TableHead className="font-bold text-slate-800 py-3 min-w-[180px]">Reclamante</TableHead>
                  <TableHead className="font-bold text-slate-800 py-3 min-w-[150px]">Função</TableHead>
                  <TableHead className="font-bold text-slate-800 py-3 min-w-[180px]">Juízo</TableHead>
                  <TableHead className="font-bold text-slate-800 py-3 min-w-[180px]">Advogado Adverso</TableHead>
                  <TableHead className="font-bold text-slate-800 py-3 text-right pr-6 min-w-[180px]">Financeiro (Saving)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listAcordos.length > 0 ? (
                  listAcordos.map((acordo, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <TableCell className="py-2.5 pl-6">
                        <span className="font-mono text-[11px] text-slate-500 block group-hover:text-slate-900 transition-colors">
                          {acordo.numero}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="font-bold text-slate-900 text-sm">{acordo.reclamante}</span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-[12px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-full">{acordo.funcao}</span>
                      </TableCell>
                      <TableCell className="py-2.5 text-slate-600 text-[13px]">
                        {acordo.juizo}
                      </TableCell>
                      <TableCell className="py-2.5 text-slate-600 text-[13px]">
                        {acordo.advogado}
                      </TableCell>
                      <TableCell className="py-2.5 text-right pr-6">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                             <span className="line-through">{formatCurrency(acordo.valorOriginal)}</span>
                             <ArrowDownRight className="h-3 w-3" />
                             <span className="text-slate-900 font-bold">{formatCurrency(acordo.valorAcordo)}</span>
                          </div>
                          <Badge className={`bg-emerald-500/10 text-emerald-700 border-emerald-200/50 hover:bg-emerald-500/20 gap-1 px-2 py-0 h-6`}>
                            <TrendingDown className="h-3 w-3" />
                            <span className="font-bold">{formatPercent(acordo.savingPercent)}</span>
                            <span className="font-medium">({formatCurrency(acordo.savingValor)})</span>
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                     <TableCell colSpan={6} className="h-40 text-center text-muted-foreground italic">
                        Nenhum acordo encontrado com os filtros atuais.
                     </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  )
}
