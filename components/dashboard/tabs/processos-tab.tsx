"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ProcessesTable } from "@/components/dashboard/processes-table"
import { MapeamentoTestemunhas } from "./mapeamento-testemunhas"
import { Check, X, Search, HeartPulse, ShieldCheck, Activity, Stethoscope, Scale, FileText, Landmark, ShieldAlert, AlertTriangle, UserSearch, Link as LinkIcon, ExternalLink } from "lucide-react"

const PEDIDO_KEYS = [
  { key: "do_at", label: "Doença/Acidente" },
  { key: "estabilidade", label: "Estabilidade" },
  { key: "plano_saude", label: "Plano de Saúde" },
  { key: "reintegracao", label: "Reintegração" },
  { key: "pensao", label: "Pensão" },
  { key: "ppp", label: "PPP" },
  { key: "danos_morais", label: "Danos Morais" },
  { key: "danos_materiais", label: "Danos Materiais" },
  { key: "insalubridade", label: "Insalubridade" },
  { key: "periculosidade", label: "Periculosidade" },
  { key: "horas_extras", label: "Horas Extras" },
  { key: "intrajornada", label: "Intrajornada" },
  { key: "horas_itinere", label: "Horas in Itinere" },
  { key: "acumulo_funcao", label: "Acúmulo de Função" },
  { key: "equip_salarial", label: "Equiparação Salarial" },
  { key: "rec_vinculo", label: "Vínculo Empregatício" },
  { key: "rescisao_indireta", label: "Rescisão Indireta" },
  { key: "honorarios_advocaticios", label: "Honorários Advocatícios" },
]

function BoolIcon({ value }: { value: boolean | null | undefined }) {
  if (value === true) return <Check className="h-4 w-4 text-emerald-500 mx-auto" strokeWidth={3} />
  if (value === false) return <X className="h-4 w-4 text-red-400 mx-auto" strokeWidth={3} />
  return <span className="text-slate-300 text-xs block text-center">—</span>
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
  const [activeInternalTab, setActiveInternalTab] = useState("detalhamento")
  const [selectedPedido, setSelectedPedido] = useState<{ key: string, label: string } | null>(null)

  // ... (useMemo logic remains same)
  // Index pedidos by numero_processo for fast lookup
  const pedidosInicialMap = useMemo(() => {
    const map: Record<string, any> = {}
    pedidosInicial.forEach(p => { if (p.numero_processo) map[String(p.numero_processo)] = p })
    return map
  }, [pedidosInicial])

  const pedidosSentencaMap = useMemo(() => {
    const map: Record<string, any> = {}
    pedidosSentenca.forEach(p => { if (p.numero_processo) map[String(p.numero_processo)] = p })
    return map
  }, [pedidosSentenca])

  const pedidosAcordaoMap = useMemo(() => {
    const map: Record<string, any> = {}
    pedidosAcordao.forEach(p => { if (p.numero_processo) map[String(p.numero_processo)] = p })
    return map
  }, [pedidosAcordao])

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
        key: pedido.key,
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

  const kpis = useMemo(() => {
    const total = processos.length
    const doAtInicial = pedidosInicial.filter(p => p.do_at === true).length
    const estabilidade = pedidosInicial.filter(p => p.estabilidade === true).length
    
    const nexoLaudo = laudos.filter(l => 
      (l.do_mental && !String(l.do_mental).toUpperCase().includes("AUSENTE") && !String(l.do_mental).toUpperCase().includes("NÃO")) || 
      (l.do_medica_geral && !String(l.do_medica_geral).toUpperCase().includes("AUSENTE") && !String(l.do_medica_geral).toUpperCase().includes("NÃO"))
    ).length
    
    const recSentenca = pedidosSentenca.filter(p => p.do_at === true).length
    const recAcordao = pedidosAcordao.filter(p => p.do_at === true).length
    
    return {
      total,
      doAtInicial,
      estabilidade,
      nexoLaudo,
      recSentenca,
      recAcordao
    }
  }, [processos, pedidosInicial, pedidosSentenca, pedidosAcordao, laudos])

  const rankingObrigacoes = useMemo(() => {
    return [
      { label: "Estabilidade", count: pedidosInicial.filter(p => p.estabilidade === true).length },
      { label: "Plano de Saúde", count: pedidosInicial.filter(p => p.plano_saude === true).length },
      { label: "Reintegração", count: pedidosInicial.filter(p => p.reintegracao === true).length },
      { label: "PPP", count: pedidosInicial.filter(p => p.ppp === true).length },
      { label: "Pensão", count: pedidosInicial.filter(p => p.pensao === true).length },
    ].sort((a, b) => b.count - a.count)
  }, [pedidosInicial])

  // Per-process detail for the selected pedido
  const detailRows = useMemo(() => {
    if (!selectedPedido) return []
    
    return processos.map(p => {
      const numProc = String(p.numero_processo)
      const ini = pedidosInicialMap[numProc]
      const sen = pedidosSentencaMap[numProc]
      const aco = pedidosAcordaoMap[numProc]

      const inicialVal = ini ? ini[selectedPedido.key] : undefined
      const sentencaVal = sen ? sen[selectedPedido.key] : undefined
      const acordaoVal = aco ? aco[selectedPedido.key] : undefined

      const hasData = inicialVal !== undefined || sentencaVal !== undefined || acordaoVal !== undefined

      return {
        numero: numProc,
        reclamante: p.nome_reclamante || "—",
        status: p.status || "—",
        inicial: inicialVal ?? null,
        sentenca: sentencaVal ?? null,
        acordao: acordaoVal ?? null,
        hasData,
      }
    }).filter(r => r.hasData)
  }, [selectedPedido, processos, pedidosInicialMap, pedidosSentencaMap, pedidosAcordaoMap])

  const renderCell = (data: { deferido: number, indeferido: number, total: number }) => {
    if (data.total === 0) {
      return <span className="text-slate-300 text-xs">—</span>
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
      {/* Navegação Interna Horizontal */}
      <div className="flex items-center gap-8 border-b border-border/60 mb-2">
        <button
          onClick={() => setActiveInternalTab("detalhamento")}
          className={`pb-3 text-sm transition-all focus:outline-none ${activeInternalTab === "detalhamento" ? "font-bold text-[#111111] border-b-[3px] border-[#F6D000]" : "text-slate-500 font-medium hover:text-[#111111] border-b-[3px] border-transparent"}`}
        >
          Detalhamento dos Processos
        </button>
        <button
          onClick={() => setActiveInternalTab("analise")}
          className={`pb-3 text-sm transition-all focus:outline-none ${activeInternalTab === "analise" ? "font-bold text-[#111111] border-b-[3px] border-[#F6D000]" : "text-slate-500 font-medium hover:text-[#111111] border-b-[3px] border-transparent"}`}
        >
          Análise de Pedidos
        </button>
        <button
          onClick={() => setActiveInternalTab("mapeamento")}
          className={`pb-3 text-sm transition-all focus:outline-none ${activeInternalTab === "mapeamento" ? "font-bold text-[#111111] border-b-[3px] border-[#F6D000]" : "text-slate-500 font-medium hover:text-[#111111] border-b-[3px] border-transparent"}`}
        >
          Mapeamento de Testemunhas
        </button>
      </div>

      <div className="animate-in fade-in-50 duration-300">
        {/* Tab 1: Detalhamento dos Processos */}
        {activeInternalTab === "detalhamento" && (
          <ProcessesTable 
            processos={processos} 
            laudos={laudos} 
            pedidosInicial={pedidosInicial}
            pedidosSentenca={pedidosSentenca}
            pedidosAcordao={pedidosAcordao}
          />
        )}

        {/* Tab 2: Análise de Pedidos */}
        {activeInternalTab === "analise" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#183B8C]/10" />
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-blue-50 rounded-full">
                    <FileText className="h-4 w-4 text-[#183B8C]" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Processos Mapeados</span>
                </div>
                <div className="text-2xl font-bold text-[#183B8C]">{kpis.total}</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400/20" />
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-yellow-50 rounded-full">
                    <HeartPulse className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Doença na Inicial</span>
                </div>
                <div className="text-2xl font-bold text-[#183B8C]">{kpis.doAtInicial}</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#F6D000]/30" />
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-yellow-50 rounded-full">
                    <ShieldCheck className="h-4 w-4 text-[#F6D000]" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estabilidade</span>
                </div>
                <div className="text-2xl font-bold text-[#183B8C]">{kpis.estabilidade}</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500/10" />
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-emerald-50 rounded-full">
                    <Scale className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nexo no Laudo</span>
                </div>
                <div className="text-2xl font-bold text-[#183B8C]">{kpis.nexoLaudo}</div>
                <span className="text-[9px] text-emerald-600 font-medium">casos com nexo técnico</span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#183B8C]/20" />
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-blue-50 rounded-full">
                    <Scale className="h-4 w-4 text-[#183B8C]" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sentença</span>
                </div>
                <div className="text-2xl font-bold text-[#183B8C]">{kpis.recSentenca}</div>
                <span className="text-[9px] text-blue-600 font-medium">materialização jurídica</span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#F6D000]/40" />
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-yellow-50 rounded-full">
                    <Scale className="h-4 w-4 text-[#183B8C]" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Acórdão</span>
                </div>
                <div className="text-2xl font-bold text-[#183B8C]">{kpis.recAcordao}</div>
                <span className="text-[9px] text-[#183B8C] font-medium">mantidos ou reconhecidos</span>
              </div>
            </div>

            {/* Painéis Estratégicos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-[#183B8C] uppercase tracking-wider">Pedidos Sensíveis — Doença e Estabilidade</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="relative flex items-center justify-between w-full">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10" />
                    {[
                      { label: "Mapeados", value: kpis.total, percent: "100%" },
                      { label: "Inicial", value: kpis.doAtInicial, percent: Math.round(kpis.doAtInicial/kpis.total*100) + "%" },
                      { label: "Laudo (Nexo)", value: kpis.nexoLaudo, percent: Math.round(kpis.nexoLaudo/kpis.total*100) + "%" },
                      { label: "Sentença", value: kpis.recSentenca, percent: Math.round(kpis.recSentenca/kpis.total*100) + "%" },
                      { label: "Acórdão", value: kpis.recAcordao, percent: Math.round(kpis.recAcordao/kpis.total*100) + "%" }
                    ].map((step, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 bg-white px-2">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i === 0 ? 'bg-[#183B8C] text-white border-[#183B8C]' : 'bg-white text-[#183B8C] border-slate-200'}`}>
                          {i + 1}
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{step.label}</span>
                          <span className="text-sm font-bold text-[#183B8C]">{step.value}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{step.percent}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-[#183B8C] uppercase tracking-wider">Obrigações Sensíveis</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {rankingObrigacoes.map((item, i) => {
                    const max = Math.max(...rankingObrigacoes.map(x => x.count))
                    const percent = max > 0 ? (item.count / max * 100) : 0
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-600">{item.label}</span>
                          <span className="text-[#183B8C]">{item.count}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#183B8C] rounded-full transition-all duration-1000" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Análise de Pedidos — Matriz de Deferimento <Badge variant="secondary" className="font-normal bg-[#DCE6F8] text-[#183B8C] hover:bg-[#DCE6F8]">Inicial → Sentença → Acórdão</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Visualização do resultado de cada pedido ao longo das fases processuais. Clique em <Search className="inline h-3.5 w-3.5" /> para ver o detalhe por processo.
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-border w-full shadow-sm" style={{ boxSizing: 'border-box' }}>
                  <table className="w-full text-sm table-auto border-collapse min-w-[800px]">
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
                        <th className="text-center px-4 py-3 font-semibold border-r border-slate-700 min-w-[120px]">
                          <div className="flex flex-col items-center gap-0.5">
                            <span>Acórdão</span>
                            <span className="text-[10px] text-slate-400 font-normal">Deferido?</span>
                          </div>
                        </th>
                        <th className="text-center px-3 py-3 font-semibold w-[60px]">
                          <span className="text-[10px] text-slate-400 font-normal">Detalhe</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrixData.map((row, idx) => (
                        <tr 
                          key={idx} 
                          className={`border-b border-border transition-colors hover:bg-blue-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                        >
                          <td className="px-4 py-3 font-medium text-slate-800 border-r border-border">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-6 rounded-full bg-[#183B8C] shrink-0"></span>
                              {row.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center border-r border-border">
                            {renderCell(row.inicial)}
                          </td>
                          <td className="px-4 py-3 text-center border-r border-border">
                            {renderCell(row.sentenca)}
                          </td>
                          <td className="px-4 py-3 text-center border-r border-border">
                            {renderCell(row.acordao)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() => setSelectedPedido({ key: row.key, label: row.name })}
                              className="p-1.5 rounded-md bg-blue-50 hover:bg-[#183B8C] text-slate-600 hover:text-white transition-all duration-200 hover:shadow-sm"
                              title={`Ver detalhe de "${row.name}" por processo`}
                            >
                              <Search className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Per-Process Detail Dialog */}
            <Dialog open={!!selectedPedido} onOpenChange={(open) => { if (!open) setSelectedPedido(null) }}>
              <DialogContent className="sm:max-w-[95vw] sm:w-[95vw] w-[98vw] max-h-[95vh] overflow-hidden bg-white p-0 !max-w-none">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                  <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <span className="w-2 h-8 rounded-full bg-[#183B8C] shrink-0"></span>
                    {selectedPedido?.label}
                    <Badge className="bg-[#DCE6F8] text-[#183B8C] font-normal hover:bg-[#DCE6F8]">
                      {detailRows.length} processo(s)
                    </Badge>
                  </DialogTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Movimentação do pedido por processo individual — da Inicial ao Acórdão
                  </p>
                </DialogHeader>

                <ScrollArea className="max-h-[65vh]">
                  <div className="px-6 py-4">
                    <div className="overflow-x-auto rounded-lg border border-border bg-white">
                      <table className="w-full text-sm table-auto border-collapse">
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-[#111111] text-white">
                            <th className="text-left px-4 py-3 font-semibold min-w-[180px] border-r border-slate-700">Nº Processo</th>
                            <th className="text-left px-4 py-3 font-semibold min-w-[250px] border-r border-slate-700">Reclamante</th>
                            <th className="text-center px-2 py-3 font-semibold border-r border-slate-700 w-[110px]">Inicial</th>
                            <th className="text-center px-2 py-3 font-semibold border-r border-slate-700 w-[110px]">Sentença</th>
                            <th className="text-center px-2 py-3 font-semibold w-[110px]">Acórdão</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailRows.map((row, idx) => (
                            <tr 
                              key={idx} 
                              className={`border-b border-border transition-colors hover:bg-blue-50/30 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-100/20'}`}
                            >
                              <td className="px-4 py-2.5 font-mono text-[11px] text-slate-700 border-r border-border truncate">
                                {row.numero}
                              </td>
                              <td className="px-4 py-2.5 text-slate-700 text-xs font-medium truncate border-r border-border" title={row.reclamante}>
                                {row.reclamante}
                              </td>
                              <td className="px-4 py-2.5 border-r border-border">
                                <BoolIcon value={row.inicial} />
                              </td>
                              <td className="px-4 py-2.5 border-r border-border">
                                <BoolIcon value={row.sentenca} />
                              </td>
                              <td className="px-4 py-2.5">
                                <BoolIcon value={row.acordao} />
                              </td>
                            </tr>
                          ))}
                          {detailRows.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                                Nenhum processo encontrado para este pedido.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </ScrollArea>

                {/* Summary Footer */}
                {detailRows.length > 0 && (
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                      <span className="text-slate-600">
                        Inicial: <strong className="text-emerald-600">{detailRows.filter(r => r.inicial === true).length}</strong> deferidos
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                      <span className="text-slate-600">
                        Sentença: <strong className="text-emerald-600">{detailRows.filter(r => r.sentenca === true).length}</strong> deferidos
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                      <span className="text-slate-600">
                        Acórdão: <strong className="text-emerald-600">{detailRows.filter(r => r.acordao === true).length}</strong> deferidos
                      </span>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Tab 3: Mapeamento de Testemunhas */}
        {activeInternalTab === "mapeamento" && (
          <MapeamentoTestemunhas processos={processos} />
        )}
      </div>
    </div>
  )
}
