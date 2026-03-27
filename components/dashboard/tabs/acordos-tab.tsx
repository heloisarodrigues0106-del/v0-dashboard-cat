"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ScatterChart, Scatter, ComposedChart, Line, Legend
} from "recharts"
import { TrendingDown, Percent, CheckCircle2 } from "lucide-react"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value || 0)
}

function formatPercent(value: number) {
  return `${(value || 0).toFixed(1)}%`
}

export function AcordosTab({ processos = [] }: { processos: any[] }) {
  
  const { metrics, chartData, scatterData } = useMemo(() => {
    // Filtrar apenas processos com status ACORDO
    const acordos = processos.filter(p => p?.status?.toUpperCase() === 'ACORDO')
    
    let totalPedido = 0
    let totalAcordado = 0
    
    const validScatterData: any[] = []

    acordos.forEach(p => {
      // O usuário se referiu a "valor_acao", mas no banco é comum ser "valor_causa"
      const pedido = Number(p.valor_acao || p.valor_causa || 0)
      const acordado = Number(p.valor_acordo || 0)
      
      totalPedido += pedido
      totalAcordado += acordado
      
      if (pedido > 0 || acordado > 0) {
        validScatterData.push({
          x: pedido,
          y: acordado,
          economia: pedido - acordado
        })
      }
    })
    
    const economiaTotal = totalPedido - totalAcordado
    const taxaEconomia = totalPedido > 0 ? (economiaTotal / totalPedido) * 100 : 0
    const qtdAcordos = acordos.length
    
    const mediaPedido = qtdAcordos > 0 ? totalPedido / qtdAcordos : 0
    const mediaAcordado = qtdAcordos > 0 ? totalAcordado / qtdAcordos : 0
    const mediaEconomia = qtdAcordos > 0 ? economiaTotal / qtdAcordos : 0

    return {
      metrics: {
        totalPedido,
        totalAcordado,
        economiaTotal,
        taxaEconomia,
        qtdAcordos,
        mediaDesconto: taxaEconomia
      },
      chartData: [
        { name: "Valor Total Pedido", total: totalPedido, media: mediaPedido },
        { name: "Valor Total Acordado", total: totalAcordado, media: mediaAcordado },
        { name: "Economia Total Gerada", total: economiaTotal, media: mediaEconomia }
      ],
      scatterData: validScatterData
    }
  }, [processos])
  
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
              <p className="text-emerald-700/80 text-sm">Diferença entre valor pedido e valor acordado</p>
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{formatCurrency(metrics.totalPedido)}</div>
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
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Totais e Média */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Totais e Média por Acordo</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-[350px]">
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

        {/* Scatter Pedido vs Acordo */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Comparativo: Valor Pedido vs Valor do Acordo</CardTitle>
            <div className="flex gap-4 text-xs text-muted-foreground mt-1">
              <span>Eixo X: Valor Pedido</span>
              <span>Eixo Y: Valor do Acordo</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Valor Pedido"
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
                  <Scatter name="Valor Pedido" data={scatterData} fill="#F6D000" />
                  <Legend verticalAlign="bottom" height={36} formatter={(val) => <span className="text-sm font-medium">Valor Pedido</span>}/>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
