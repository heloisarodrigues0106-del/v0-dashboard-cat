"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { valoresRisco } from "@/lib/mock-data"
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
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

export function FinancialAnalysis() {
  // Transform data for stacked bar chart
  const chartData = valoresRisco.map((item) => ({
    periodo: `${item.trimestre}/${item.ano}`,
    Provável: item.principal_provavel + item.correcao_provavel + item.juros_provavel,
    Possível: item.principal_possivel + item.correcao_possivel + item.juros_possivel,
    Remoto: item.principal_remoto + item.correcao_remoto + item.juros_remoto
  }))

  // Current quarter breakdown (last item)
  const currentQuarter = valoresRisco[valoresRisco.length - 1]
  const breakdown = [
    {
      title: "Principal",
      icon: Banknote,
      value: currentQuarter.principal_provavel,
      color: "text-chart-1"
    },
    {
      title: "Correção",
      icon: TrendingUp,
      value: currentQuarter.correcao_provavel,
      color: "text-chart-2"
    },
    {
      title: "Juros",
      icon: Percent,
      value: currentQuarter.juros_provavel,
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
                Trimestre Atual ({currentQuarter.trimestre}/{currentQuarter.ano})
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
              <p className="text-sm font-medium text-muted-foreground">Total Provável (Trimestre)</p>
              <p className="mt-1 text-3xl font-bold text-card-foreground">
                {formatCurrency(
                  currentQuarter.principal_provavel + 
                  currentQuarter.correcao_provavel + 
                  currentQuarter.juros_provavel
                )}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Principal + Correção + Juros
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
