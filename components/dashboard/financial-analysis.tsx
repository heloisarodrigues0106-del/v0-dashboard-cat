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
import { provisionamentoConfig, toNumber } from "@/lib/config"

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

export function FinancialAnalysis({ valoresRisco }: { valoresRisco: any[] }) {
  // Consolidação dos totais da carteira para os dois períodos usando toNumber
  const totals = valoresRisco.reduce((acc, item) => {
    const prevProvavel = toNumber(item.provavel_total_anterior)
    const prevPossivel = toNumber(item.possivel_total_anterior)
    const prevRemoto = toNumber(item.remoto_total_anterior)

    const currProvavel = toNumber(item.provavel_total_atual)
    const currPossivel = toNumber(item.possivel_total_atual)
    const currRemoto = toNumber(item.remoto_total_atual)

    // Current quarter breakdown columns
    const provPrincipal = toNumber(item.provavel_principal_quarter_atual)
    const possPrincipal = toNumber(item.possivel_principal_quarter_atual)
    const remPrincipal = toNumber(item.remoto_principal_quarter_atual)

    const provCorrecao = toNumber(item.provavel_correcao_quarter_atual)
    const possCorrecao = toNumber(item.possivel_correcao_quarter_atual)
    const remCorrecao = toNumber(item.remoto_correcao_quarter_atual)

    const provJuros = toNumber(item.provavel_juros_quarter_atual)
    const possJuros = toNumber(item.possivel_juros_quarter_atual)
    const remJuros = toNumber(item.remoto_juros_quarter_atual)

    return {
      prevProvavel: acc.prevProvavel + prevProvavel,
      prevPossivel: acc.prevPossivel + prevPossivel,
      prevRemoto: acc.prevRemoto + prevRemoto,
      currProvavel: acc.currProvavel + currProvavel,
      currPossivel: acc.currPossivel + currPossivel,
      currRemoto: acc.currRemoto + currRemoto,
      // Consolidated current values (provavel + possivel + remoto)
      currPrincipal: acc.currPrincipal + provPrincipal + possPrincipal + remPrincipal,
      currCorrecao: acc.currCorrecao + provCorrecao + possCorrecao + remCorrecao,
      currJuros: acc.currJuros + provJuros + possJuros + remJuros,
    }
  }, {
    prevProvavel: 0, prevPossivel: 0, prevRemoto: 0,
    currProvavel: 0, currPossivel: 0, currRemoto: 0,
    currPrincipal: 0, currCorrecao: 0, currJuros: 0
  })

  const chartData = [
    {
      periodo: provisionamentoConfig.quarterAnterior,
      Provável: totals.prevProvavel,
      Possível: totals.prevPossivel,
      Remoto: totals.prevRemoto
    },
    {
      periodo: provisionamentoConfig.quarterAtual,
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
      color: "text-[#183B8C]"
    },
    {
      title: "Correção",
      icon: TrendingUp,
      value: totals.currCorrecao,
      color: "text-amber-600"
    },
    {
      title: "Juros",
      icon: Percent,
      value: totals.currJuros,
      color: "text-emerald-600"
    }
  ]

  return (
    <section className="px-6 py-6">
      <h2 className="mb-4 text-lg font-bold text-foreground">Análise Financeira de Risco</h2>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stacked Bar Chart */}
        <Card className="border border-border bg-card shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-card-foreground">
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
                    fill="#183B8C" 
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar 
                    dataKey="Possível" 
                    stackId="a" 
                    fill="#4F6DB8" 
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar 
                    dataKey="Remoto" 
                    stackId="a" 
                    fill="#94A3B8" 
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
              <CardTitle className="text-sm font-bold text-muted-foreground">
                Fechamento {provisionamentoConfig.quarterAtual} — Consolidado
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
              <p className="text-sm font-bold text-muted-foreground">Total Provável — Carteira ({provisionamentoConfig.quarterAtual})</p>
              <p className="mt-1 text-3xl font-bold text-card-foreground">
                {formatCurrency(totals.currProvavel)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Volume total provisionado no quarter atual
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
