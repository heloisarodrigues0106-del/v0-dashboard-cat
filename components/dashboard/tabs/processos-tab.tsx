"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProcessesTable } from "@/components/dashboard/processes-table"
import { MapeamentoTestemunhas } from "./mapeamento-testemunhas"
import { Check, X } from "lucide-react"

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
  
  // Aggregate data for the matrix table
  const matrixData = useMemo(() => {
    return PEDIDO_KEYS.map((pedido) => {
      let inicialTrue = 0, inicialFalse = 0
      let sentencaTrue = 0, sentencaFalse = 0
      let acordaoTrue = 0, acordaoFalse = 0

      pedidosInicial.forEach((row) => {
        if (row[pedido.key] === true) inicialTrue++
        else if (row[pedido.key] === false) inicialFalse++
      })

      pedidosSentenca.forEach((row) => {
        if (row[pedido.key] === true) sentencaTrue++
        else if (row[pedido.key] === false) sentencaFalse++
      })

      pedidosAcordao.forEach((row) => {
        if (row[pedido.key] === true) acordaoTrue++
        else if (row[pedido.key] === false) acordaoFalse++
      })

      const inicialTotal = inicialTrue + inicialFalse
      const sentencaTotal = sentencaTrue + sentencaFalse
      const acordaoTotal = acordaoTrue + acordaoFalse

      return {
        name: pedido.label,
        inicial: { deferido: inicialTrue, indeferido: inicialFalse, total: inicialTotal },
        sentenca: { deferido: sentencaTrue, indeferido: sentencaFalse, total: sentencaTotal },
        acordao: { deferido: acordaoTrue, indeferido: acordaoFalse, total: acordaoTotal },
        totalPedidos: inicialTotal,
      }
    })
    .filter(item => item.totalPedidos > 0)
    .sort((a, b) => b.totalPedidos - a.totalPedidos)
  }, [pedidosInicial, pedidosSentenca, pedidosAcordao])

  const renderCell = (data: { deferido: number, indeferido: number, total: number }) => {
    if (data.total === 0) {
      return (
        <span className="text-slate-300 text-xs">—</span>
      )
    }
    const rate = data.total > 0 ? (data.deferido / data.total * 100).toFixed(0) : "0"
    const isDeferido = data.deferido > data.indeferido
    return (
      <div className="flex flex-col items-center gap-0.5">
        {isDeferido ? (
          <Check className="h-5 w-5 text-emerald-500" strokeWidth={3} />
        ) : (
          <X className="h-5 w-5 text-red-400" strokeWidth={3} />
        )}
        <span className={`text-[10px] font-semibold ${isDeferido ? 'text-emerald-600' : 'text-red-400'}`}>
          {data.deferido}/{data.total}
        </span>
        <span className="text-[9px] text-slate-400">
          ({rate}%)
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Análise de Pedidos — Matriz de Deferimento <Badge variant="secondary" className="font-normal bg-amber-100 text-amber-700 hover:bg-amber-100">Inicial → Sentença → Acórdão</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Visualização do resultado de cada pedido ao longo das fases processuais. ✓ = Deferido (maioria) | ✗ = Indeferido (maioria)
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#111111] text-white">
                  <th className="text-left px-4 py-3 font-semibold min-w-[200px] border-r border-slate-700">Pedido</th>
                  <th className="text-center px-4 py-3 font-semibold border-r border-slate-700 min-w-[120px]">
                    <div className="flex flex-col items-center gap-0.5">
                      <span>Inicial</span>
                      <span className="text-[10px] text-slate-400 font-normal">Pleiteado</span>
                    </div>
                  </th>
                  <th className="text-center px-4 py-3 font-semibold border-r border-slate-700 min-w-[120px]">
                    <div className="flex flex-col items-center gap-0.5">
                      <span>Sentença</span>
                      <span className="text-[10px] text-slate-400 font-normal">Deferido?</span>
                    </div>
                  </th>
                  <th className="text-center px-4 py-3 font-semibold min-w-[120px]">
                    <div className="flex flex-col items-center gap-0.5">
                      <span>Acórdão</span>
                      <span className="text-[10px] text-slate-400 font-normal">Deferido?</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {matrixData.map((row, idx) => (
                  <tr 
                    key={idx} 
                    className={`border-b border-border transition-colors hover:bg-amber-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-800 border-r border-border">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-6 rounded-full bg-[#F6D000] shrink-0"></span>
                        {row.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center border-r border-border">
                      {renderCell(row.inicial)}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-border">
                      {renderCell(row.sentenca)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {renderCell(row.acordao)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Processos */}
      <ProcessesTable processos={processos} laudos={laudos} />

      {/* Seção Mapeamento de Testemunhas */}
      <MapeamentoTestemunhas processos={processos} />
    </div>
  )
}
