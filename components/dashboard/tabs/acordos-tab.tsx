import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ScatterChart, Scatter, ComposedChart, Line, Legend, Cell
} from "recharts"
import { TrendingDown, Percent, CheckCircle2, Search, DollarSign, ArrowDownRight } from "lucide-react"

const CHART_COLORS = ['#102A63', '#183B8C', '#4F6DB8', '#94A3B8', '#14B8A6'];

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
              <div className="flex items-center text-emerald-700 font-bold gap-2 text-[12px] uppercase tracking-[0.04em]">
                <TrendingDown className="h-4 w-4" strokeWidth={3} />
                <span>Economia Total Gerada</span>
              </div>
              <div className="text-[48px] font-bold text-emerald-700 tracking-tighter leading-none">
                {formatCurrency(metrics.economiaTotal)}
              </div>
              <p className="text-emerald-700/80 text-[11px] font-bold uppercase tracking-tight">Diferença entre valor da causa e valor acordado</p>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100/50 flex flex-col items-center justify-center min-w-[140px]">
                <Percent className="h-5 w-5 text-emerald-600 mb-2" strokeWidth={3} />
                <span className="text-[32px] font-bold text-emerald-700 leading-none tracking-tight">{formatPercent(metrics.taxaEconomia)}</span>
                <span className="text-[10px] text-emerald-600/80 font-bold uppercase mt-2 tracking-tight">Taxa de Economia</span>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100/50 flex flex-col items-center justify-center min-w-[140px]">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mb-2" strokeWidth={3} />
                <span className="text-[32px] font-bold text-emerald-700 leading-none tracking-tight">{metrics.qtdAcordos}</span>
                <span className="text-[10px] text-emerald-600/80 font-bold uppercase mt-2 tracking-tight">Acordos Fechados</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3 Summary Cards */}
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">Valor Total da Causa</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-[32px] font-bold text-slate-800 tracking-tight leading-none">{formatCurrency(metrics.totalCausa)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">Valor Total Acordado</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-[32px] font-bold text-slate-800 tracking-tight leading-none">{formatCurrency(metrics.totalAcordado)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">Média de Desconto</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-[32px] font-bold text-amber-700 tracking-tight leading-none">{formatPercent(metrics.mediaDesconto)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Totais e Média */}
        <Card className="flex flex-col min-w-0">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-[16px] font-bold text-[#102A63] uppercase tracking-tight">Totais e Média por Acordo</CardTitle>
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
                  <Bar yAxisId="left" dataKey="total" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={150} />
                  <Line yAxisId="left" type="monotone" dataKey="media" stroke={CHART_COLORS[4]} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS[4] }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Scatter Causa vs Acordo */}
        <Card className="flex flex-col min-w-0">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-[16px] font-bold text-[#102A63] uppercase tracking-tight">Comparativo: Valor da Causa vs Valor do Acordo</CardTitle>
            <div className="flex gap-4 text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tight">
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
                  <Scatter name="Acordos" data={scatterData} fill={CHART_COLORS[4]} opacity={0.6}>
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Scatter>
                  <Legend verticalAlign="bottom" height={36} formatter={(val) => <span className="text-sm font-medium">Valor da Causa</span>}/>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
      {/* Detailed Agreement Table Card */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 pt-4 px-5">
          <div className="space-y-1">
            <CardTitle className="text-[18px] font-bold text-[#102A63] uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-7 bg-emerald-500 rounded-full"></span>
              Detalhamento de Acordos e Savings
            </CardTitle>
            <p className="text-[12px] text-slate-500 font-medium">Listagem técnica de negociações e economia gerada</p>
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
              <TableHeader className="sticky top-0 z-10 bg-[#111111] shadow-sm">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-white text-[11px] uppercase tracking-[0.04em] py-3 pl-6 w-[180px]">Processo</TableHead>
                  <TableHead className="font-bold text-white text-[11px] uppercase tracking-[0.04em] py-3 min-w-[180px]">Reclamante</TableHead>
                  <TableHead className="font-bold text-white text-[11px] uppercase tracking-[0.04em] py-3 min-w-[150px]">Função</TableHead>
                  <TableHead className="font-bold text-white text-[11px] uppercase tracking-[0.04em] py-3 min-w-[180px]">Juízo</TableHead>
                  <TableHead className="font-bold text-white text-[11px] uppercase tracking-[0.04em] py-3 min-w-[180px]">Advogado Adverso</TableHead>
                  <TableHead className="font-bold text-white text-[11px] uppercase tracking-[0.04em] py-3 text-right pr-6 min-w-[180px]">Financeiro (Saving)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listAcordos.length > 0 ? (
                  listAcordos.map((acordo, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <TableCell className="py-2.5 pl-6">
                        <span className="font-mono text-[11px] font-bold text-slate-500 block group-hover:text-slate-900 transition-colors">
                          {acordo.numero}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="font-bold text-slate-900 text-[11px] uppercase tracking-tight">{acordo.reclamante}</span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tight bg-slate-100 px-2 py-0.5 rounded-full">{acordo.funcao}</span>
                      </TableCell>
                      <TableCell className="py-2.5 text-slate-600 text-[11px] font-bold uppercase tracking-tight">
                        {acordo.juizo}
                      </TableCell>
                      <TableCell className="py-2.5 text-slate-600 text-[11px] font-bold uppercase tracking-tight">
                        {acordo.advogado}
                      </TableCell>
                      <TableCell className="py-2.5 text-right pr-6">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                             <span className="line-through">{formatCurrency(acordo.valorOriginal)}</span>
                             <ArrowDownRight className="h-3 w-3" />
                             <span className="text-slate-900 font-bold">{formatCurrency(acordo.valorAcordo)}</span>
                          </div>
                          <Badge className={`bg-emerald-500/10 text-emerald-700 border-emerald-200/50 hover:bg-emerald-500/20 gap-1 px-2 py-0 h-6 text-[10px] uppercase tracking-tight`}>
                            <TrendingDown className="h-3 w-3" />
                            <span className="font-bold">{formatPercent(acordo.savingPercent)}</span>
                            <span className="font-bold">({formatCurrency(acordo.savingValor)})</span>
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
