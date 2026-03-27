"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ProcessesTable } from "@/components/dashboard/processes-table"
import { MapeamentoTestemunhas } from "./mapeamento-testemunhas"

const PEDIDO_KEYS = [
  { key: "reintegracao", label: "Reintegração" },
  { key: "periculosidade", label: "Periculosidade" },
  { key: "insalubridade", label: "Insalubridade" },
  { key: "danos_morais", label: "Danos Morais" },
  { key: "horas_extras", label: "Horas Extras" },
  { key: "intrajornada", label: "Intrajornada" },
  { key: "horas_itinere", label: "Horas in Itinere" },
  { key: "acumulo_funcao", label: "Acúmulo de Função" },
  { key: "equip_salarial", label: "Equiparação Salarial" },
  { key: "rec_vinculo", label: "Vínculo Empregatício" },
  { key: "rescisao_indireta", label: "Rescisão Indireta" },
  { key: "danos_materiais", label: "Danos Materiais" },
  { key: "honorarios_advocaticios", label: "Honorários Advocatícios" },
]

function MobileBarChart({ data }: { data: any[] }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <div className="w-full mt-4 overflow-x-auto -mx-2 px-2" style={{ minHeight: isMobile ? 400 : 600 }}>
      <div style={{ width: isMobile ? "100%" : "100%", height: isMobile ? 400 : 600 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={isMobile ? { top: 0, right: 10, left: 0, bottom: 5 } : { top: 0, right: 30, left: 50, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="hsl(var(--border))" />
            <XAxis 
              type="number" 
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => value >= 1000000 ? `${(value/1000000).toFixed(1)}mi` : value >= 1000 ? `${(value/1000).toFixed(0)}k` : value.toString()}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={isMobile ? 90 : 180}
              stroke="hsl(var(--foreground))" 
              tick={{ fontSize: isMobile ? 10 : 12 }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
              contentStyle={{ backgroundColor: "#1f2937", color: "#fff", borderRadius: "8px", border: "none", fontSize: 12 }}
              labelStyle={{ color: "#9ca3af", marginBottom: "8px" }}
              itemStyle={{ paddingTop: "2px", paddingBottom: "2px" }}
            />
            <Legend verticalAlign="top" height={40} wrapperStyle={{ paddingBottom: "10px", fontSize: isMobile ? 11 : 14 }} />
            <Bar dataKey="Inicial" fill="#e77b63" radius={[0, 4, 4, 0]} barSize={isMobile ? 8 : 12} />
            <Bar dataKey="Sentença" fill="#10b981" radius={[0, 4, 4, 0]} barSize={isMobile ? 8 : 12} />
            <Bar dataKey="Acórdão" fill="#F6D000" radius={[0, 4, 4, 0]} barSize={isMobile ? 8 : 12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function ProcessosTab({ 
  processos, 
  pedidosInicial, 
  pedidosSentenca, 
  pedidosAcordao,
  laudos = []
}: { 
  processos: any[], 
  pedidosInicial: any[], 
  pedidosSentenca: any[], 
  pedidosAcordao: any[],
  laudos?: any[]
}) {
  
  // Aggregate data for the matrix chart
  const matrixData = useMemo(() => {
    return PEDIDO_KEYS.map((pedido) => {
      let inicialCount = 0
      let sentencaCount = 0
      let acordaoCount = 0

      // Contar na inicial
      pedidosInicial.forEach((row) => {
        if (row[pedido.key]) inicialCount++
      })

      // Contar na sentença
      pedidosSentenca.forEach((row) => {
        if (row[pedido.key]) sentencaCount++
      })

      // Contar no acórdão
      pedidosAcordao.forEach((row) => {
        if (row[pedido.key]) acordaoCount++
      })

      return {
        name: pedido.label,
        "Inicial": inicialCount,
        "Sentença": sentencaCount,
        "Acórdão": acordaoCount,
      }
    })
    // Filtrar apenas com valores para não poluir o gráfico
    .filter(item => item["Inicial"] > 0 || item["Sentença"] > 0 || item["Acórdão"] > 0)
    .sort((a, b) => b["Inicial"] - a["Inicial"]) // Ordenar por volume na inicial
  }, [pedidosInicial, pedidosSentenca, pedidosAcordao])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Volume de processos por pedidos <Badge variant="secondary" className="font-normal bg-amber-100 text-amber-700 hover:bg-amber-100">Total</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comparativo de ocorrências pleiteadas na Inicial vs procedentes na Sentença vs Acórdão
          </p>
        </CardHeader>
        <CardContent>
          <MobileBarChart data={matrixData} />
        </CardContent>
      </Card>

      {/* Relocar a tabela original de Processos para cá */}
      <ProcessesTable processos={processos} laudos={laudos} />

      {/* Seção Mapeamento de Testemunhas */}
      <MapeamentoTestemunhas processos={processos} />
    </div>
  )
}
