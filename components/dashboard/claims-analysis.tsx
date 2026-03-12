"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { pedidosComparativos, topPedidos } from "@/lib/mock-data"
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

export function ClaimsAnalysis() {
  // Use top 5 claims for the chart
  const chartData = pedidosComparativos.slice(0, 5)

  return (
    <section className="px-6 py-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Análise de Pedidos: Inicial vs. Sentença</h2>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Grouped Bar Chart */}
        <Card className="border border-border bg-card shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-card-foreground">
              Comparativo de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    type="number"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="tipo"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                    width={90}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px"
                    }}
                    labelStyle={{ color: "var(--card-foreground)" }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="inicial" 
                    name="Pedido Inicial"
                    fill="var(--chart-1)" 
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  />
                  <Bar 
                    dataKey="sentenca" 
                    name="Deferido em Sentença"
                    fill="var(--chart-2)" 
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Recurring Claims */}
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-card-foreground">
              Top 5 Pedidos Recorrentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {topPedidos.map((pedido, index) => (
              <div key={pedido.tipo} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-card-foreground">{pedido.tipo}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{pedido.total} casos</span>
                </div>
                <Progress value={pedido.percentual} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
