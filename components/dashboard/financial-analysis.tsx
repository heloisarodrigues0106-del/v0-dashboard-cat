"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { Banknote, TrendingUp, Percent } from "lucide-react"
import { ValorRisco } from "@/lib/mock-data"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const formatCompact = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}K`
  }
  return `R$ ${value}`
}

export function FinancialAnalysis({ valoresRisco }: { valoresRisco: ValorRisco[] }) {
  // Consolidação dos totais da carteira para os dois períodos
  const totals = valoresRisco.reduce((acc, item) => ({
    prevProvavel: acc.prevProvavel + (item.provavel_total_anterior || 0),
    currProvavel: acc.currProvavel + (item.provavel_total_atual || 0),
    currPossivel: acc.currPossivel + (item.possivel_total_atual || 0),
    currRemoto: acc.currRemoto + (item.remoto_total_atual || 0),
    // Breakdown do Quarter Atual
    currPrincipal: acc.currPrincipal + (item.provavel_principal_quarter_atual || 0),
    currCorrecao: acc.currCorrecao + (item.provavel_correcao_quarter_atual || 0),
    currJuros: acc.currJuros + (item.provavel_juros_quarter_atual || 0),
  }), {
    prevProvavel: 0, currProvavel: 0, currPossivel: 0, currRemoto: 0,
    currPrincipal: 0, currCorrecao: 0, currJuros: 0
  })

  const chartData = [
    {
      periodo: "Quarter Anterior",
      Provável: totals.prevProvavel,
      Possível: 0, // Não temos histórico anterior no banco para Possível
      Remoto: 0    // Não temos histórico anterior no banco para Remoto
    },
    {
      periodo: "Quarter Atual",
      Provável: totals.currProvavel,
      Possível: totals.currPossivel,
      Remoto: totals.currRemoto,
    }
  ]

  const breakdown = [
    {
      title: "Principal",
      icon: Banknote,
      value: totals.currPrincipal,
      color: "text-chart-1"
    },
    {
      title: "Correção",
      icon: TrendingUp,
      value: totals.currCorrecao,
      color: "text-chart-2"
    },
    {
      title: "Juros",
      icon: Percent,
      value: totals.currJuros,
      color: "text-chart-3"
    }
  ]

  return (
    <section className="px-6 py-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Análise Financeira de Risco</h2>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stacked Bar Chart */}
        <Card className="border border-border bg-card shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-card-foreground">
              Volume Financeiro por Trimestre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="periodo" 
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <YAxis 
                    tickFormatter={formatCompact}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px"
                    }}
                    labelStyle={{ color: "var(--card-foreground)" }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="Provável" 
                    stackId="a" 
                    fill="var(--chart-1)" 
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar 
                    dataKey="Possível" 
                    stackId="a" 
                    fill="var(--chart-2)" 
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar 
                    dataKey="Remoto" 
                    stackId="a" 
                    fill="var(--chart-3)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Cards */}
        <div className="flex flex-col gap-4">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fechamento Atual (Consolidado)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {breakdown.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-muted p-2">
                        <Icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <span className="text-sm font-medium text-card-foreground">{item.title}</span>
                    </div>
                    <span className="text-sm font-semibold text-card-foreground">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className="border border-border bg-card shadow-sm flex-1">
            <CardContent className="flex h-full flex-col justify-center p-5">
              <p className="text-sm font-medium text-muted-foreground">Total Provável (Carteira)</p>
              <p className="mt-1 text-3xl font-bold text-card-foreground">
                {formatCurrency(totals.currProvavel)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Volume total provisionado no Quarter atual
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
