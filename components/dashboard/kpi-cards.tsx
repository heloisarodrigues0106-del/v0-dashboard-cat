"use client"

import { Card, CardContent } from "@/components/ui/card"
import { kpis } from "@/lib/mock-data"
import { FileText, DollarSign, MapPin, TrendingUp } from "lucide-react"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export function KpiCards() {
  const cards = [
    {
      title: "Total de Processos Ativos",
      value: kpis.totalProcessosAtivos.toString(),
      icon: FileText,
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      title: "Valor Total em Risco (Provável)",
      value: formatCurrency(kpis.valorTotalRiscoProvavel),
      icon: DollarSign,
      iconBg: "bg-chart-4/10",
      iconColor: "text-chart-4"
    },
    {
      title: "Top Comarca",
      value: kpis.topComarca,
      icon: MapPin,
      iconBg: "bg-chart-2/10",
      iconColor: "text-chart-2"
    },
    {
      title: "Processos Recebidos no Ano",
      value: kpis.processosRecebidosAno.toString(),
      icon: TrendingUp,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      trend: {
        value: kpis.crescimentoAnual,
        label: "vs. ano anterior"
      }
    }
  ]

  return (
    <section className="px-6 py-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Visão Geral</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="border border-border bg-card shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold tracking-tight text-card-foreground">
                      {card.value}
                    </p>
                    {card.trend && (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          +{card.trend.value}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {card.trend.label}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`rounded-full p-2.5 ${card.iconBg}`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
