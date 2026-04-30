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
  { 
    label: "Doença Médica Geral", 
    key: "do_medica_geral" 
  },
  { 
    label: "Acidente de Trabalho", 
    inicialKey: "do_at", 
    sentencaKey: "acidente_trabalho", 
    acordaoKey: "acidente_trabalho",
    key: "acidente_trabalho" // fallback key
  },
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

function FunnelCard({ title, subtitle, icon, initial, sentenca, acordao }: { 
  title: string, 
  subtitle: string, 
  icon: React.ReactNode, 
  initial: number, 
  sentenca: number, 
  acordao: number 
}) {
  const convSent = initial > 0 ? (sentenca / initial * 100).toFixed(1) : "0.0"
  const manutAco = sentenca > 0 ? (acordao / sentenca * 100).toFixed(1) : "0.0"
  const retFinal = initial > 0 ? (acordao / initial * 100).toFixed(1) : "0.0"

  const stages = [
    { label: "Inicial", value: initial, percent: "100%", color: "bg-[#183B8C]" },
    { label: "Sentença", value: sentenca, percent: initial > 0 ? Math.round(sentenca/initial*100) + "%" : "0%", color: "bg-[#4F6DB8]" },
    { label: "Acórdão", value: acordao, percent: initial > 0 ? Math.round(acordao/initial*100) + "%" : "0%", color: "bg-[#94A3B8]" },
  ]

  return (
    <Card className="border border-border bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">{icon}</div>
          <div>
            <CardTitle className="text-[15px] font-bold text-[#111111] tracking-tight">{title}</CardTitle>
            <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-4">
        <div className="flex flex-col gap-6">
          {/* Visual Funnel Components */}
          <div className="space-y-3">
            {stages.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-16 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{s.label}</div>
                <div className="flex-1 h-8 bg-slate-50 rounded-md overflow-hidden relative border border-slate-100/50">
                  <div 
                    className={`h-full ${s.color} transition-all duration-1000 ease-out flex items-center justify-end px-3`} 
                    style={{ width: s.percent }}
                  >
                    <span className="text-[12px] font-black text-white">{s.value}</span>
                  </div>
                </div>
                <div className="w-10 text-[11px] font-bold text-[#183B8C] text-right">{s.percent}</div>
              </div>
            ))}
          </div>

          {/* Indicators Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Conversão I→S</span>
              <span className="text-[13px] font-black text-emerald-600">{convSent}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Manutenção S→A</span>
              <span className="text-[13px] font-black text-blue-600">{manutAco}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Retenção Final</span>
              <span className="text-[13px] font-black text-[#183B8C]">{retFinal}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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

  // Helper to check if a value is positive (true, "Sim", "Deferido", etc.)
  const isPositiveValue = (val: any) => {
    if (val === null || val === undefined || val === "") return false
    if (val === true) return true
    const s = String(val).toUpperCase()
    return s === "SIM" || s === "DEFERIDO" || s === "RECONHECIDO" || s === "MANTIDO" || s === "TRUE"
  }

  // Helper to check if a value is negative (false, "Não", "Indeferido", etc.)
  const isNegativeValue = (val: any) => {
    if (val === null || val === undefined || val === "") return false
    if (val === false) return true
    const s = String(val).toUpperCase()
    return s === "NÃO" || s === "INDEFERIDO" || s === "FALSO" || s === "FALSE"
  }

  // Aggregate data for the matrix table
  const matrixData = useMemo(() => {
    return PEDIDO_KEYS.map((pedido: any) => {
      let inicialTrue = 0, inicialFalse = 0
      let sentencaTrue = 0, sentencaFalse = 0
      let acordaoTrue = 0, acordaoFalse = 0

      // Get specific keys for each phase or fallback to global key
      const kIni = pedido.inicialKey || pedido.key
      const kSen = pedido.sentencaKey || pedido.key
      const kAco = pedido.acordaoKey || pedido.key

      pedidosInicial.forEach((row) => {
        if (isPositiveValue(row[kIni])) inicialTrue++
        else if (isNegativeValue(row[kIni])) inicialFalse++
      })

      pedidosSentenca.forEach((row) => {
        if (isPositiveValue(row[kSen])) sentencaTrue++
        else if (isNegativeValue(row[kSen])) sentencaFalse++
      })

      pedidosAcordao.forEach((row) => {
        if (isPositiveValue(row[kAco])) acordaoTrue++
        else if (isNegativeValue(row[kAco])) acordaoFalse++
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
        totalPedidos: inicialTotal || sentencaTotal || acordaoTotal, // Show if it appears in any phase
      }
    })
    .filter(item => item.totalPedidos > 0)
    .sort((a, b) => b.totalPedidos - a.totalPedidos)
  }, [pedidosInicial, pedidosSentenca, pedidosAcordao])

  const kpis = useMemo(() => {
    const total = processos.length
    // KPI Doença voltando a usar pedidosInicial pois a coluna não existe na tb_processo
    const doAtInicial = pedidosInicial.filter(p => isPositiveValue(p.do_at)).length
    const estabilidade = pedidosInicial.filter(p => isPositiveValue(p.estabilidade)).length
    
    // KPI Nexo no laudo agora filtra especificamente por CAUSA ou CONCAUSA
    const nexoLaudo = laudos.filter(l => {
      const mental = String(l.do_mental || "").toUpperCase()
      const medica = String(l.do_medica_geral || "").toUpperCase()
      return mental.includes("CAUSA") || mental.includes("CONCAUSA") || 
             medica.includes("CAUSA") || medica.includes("CONCAUSA")
    }).length
    
    const recSentenca = pedidosSentenca.filter(p => isPositiveValue(p.do_at)).length
    const recAcordao = pedidosAcordao.filter(p => isPositiveValue(p.do_at)).length
    
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
    // Obrigações sensíveis agora usam os dados da tb_pedidos_sentenca
    return [
      { label: "Estabilidade", count: pedidosSentenca.filter(p => isPositiveValue(p.estabilidade)).length },
      { label: "Plano de Saúde", count: pedidosSentenca.filter(p => isPositiveValue(p.plano_saude)).length },
      { label: "Reintegração", count: pedidosSentenca.filter(p => isPositiveValue(p.reintegracao)).length },
      { label: "PPP", count: pedidosSentenca.filter(p => isPositiveValue(p.ppp)).length },
      { label: "Pensão", count: pedidosSentenca.filter(p => isPositiveValue(p.pensao)).length },
    ].sort((a, b) => b.count - a.count)
  }, [pedidosSentenca])

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
      <div className="flex items-center gap-8 border-b border-border/60 mb-2 font-sans">
        <button
          onClick={() => setActiveInternalTab("detalhamento")}
          className={`pb-3 text-[14px] transition-all focus:outline-none ${activeInternalTab === "detalhamento" ? "font-bold text-[#111111] border-b-[3px] border-[#F6D000]" : "text-slate-500 font-medium hover:text-[#111111] border-b-[3px] border-transparent"}`}
        >
          Detalhamento dos Processos
        </button>
        <button
          onClick={() => setActiveInternalTab("analise")}
          className={`pb-3 text-[14px] transition-all focus:outline-none ${activeInternalTab === "analise" ? "font-bold text-[#111111] border-b-[3px] border-[#F6D000]" : "text-slate-500 font-medium hover:text-[#111111] border-b-[3px] border-transparent"}`}
        >
          Análise de Pedidos
        </button>
        <button
          onClick={() => setActiveInternalTab("mapeamento")}
          className={`pb-3 text-[14px] transition-all focus:outline-none ${activeInternalTab === "mapeamento" ? "font-bold text-[#111111] border-b-[3px] border-[#F6D000]" : "text-slate-500 font-medium hover:text-[#111111] border-b-[3px] border-transparent"}`}
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
            {/* SEÇÃO 1 — MATRIZ DE DEFERIMENTO */}
            <Card className="border border-border bg-card shadow-sm overflow-hidden">
              <CardHeader className="pt-4 px-5 pb-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-[18px] font-bold text-[#111111] flex items-center gap-3 tracking-tight">
                      Análise de pedidos — matriz de deferimento
                      <Badge variant="secondary" className="font-bold bg-[#DCE6F8] text-[#183B8C] hover:bg-[#DCE6F8] text-[10px] uppercase tracking-[0.06em] px-2.5 py-0.5">
                        Inicial → Sentença → Acórdão
                      </Badge>
                    </CardTitle>
                    <p className="text-[12px] text-slate-500 font-medium mt-1">
                      Visualização do resultado de cada pedido ao longo das fases processuais. Clique em detalhes para ver o processo individual.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="overflow-x-auto rounded-lg border border-border w-full shadow-sm">
                  <table className="w-full text-[12px] table-auto border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#183B8C] text-white">
                        <th className="text-left px-5 py-4 font-bold text-[11px] uppercase tracking-[0.04em] min-w-[200px] border-r border-white/10">Pedido</th>
                        <th className="text-center px-4 py-4 font-bold text-[11px] uppercase tracking-[0.04em] border-r border-white/10 min-w-[140px]">
                          <div className="flex flex-col items-center gap-0.5">
                            <span>Inicial</span>
                            <span className="text-[10px] text-blue-200/70 font-bold tracking-tight">Pleiteado</span>
                          </div>
                        </th>
                        <th className="text-center px-4 py-4 font-bold text-[11px] uppercase tracking-[0.04em] border-r border-white/10 min-w-[140px]">
                          <div className="flex flex-col items-center gap-0.5">
                            <span>Sentença</span>
                            <span className="text-[10px] text-blue-200/70 font-bold tracking-tight">Deferido?</span>
                          </div>
                        </th>
                        <th className="text-center px-4 py-4 font-bold text-[11px] uppercase tracking-[0.04em] border-r border-white/10 min-w-[140px]">
                          <div className="flex flex-col items-center gap-0.5">
                            <span>Acórdão</span>
                            <span className="text-[10px] text-blue-200/70 font-bold tracking-tight">Deferido / Mantido?</span>
                          </div>
                        </th>
                        <th className="text-center px-3 py-4 font-bold text-[11px] uppercase tracking-[0.04em] w-[80px]">
                          <span className="text-[10px] text-blue-200/70 font-bold">Detalhe</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrixData.map((row, idx) => (
                        <tr 
                          key={idx} 
                          className={`border-b border-border transition-colors hover:bg-blue-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                        >
                          <td className="px-5 py-3.5 font-bold text-slate-800 border-r border-border text-[11px] uppercase tracking-tight">
                            <div className="flex items-center gap-2.5">
                              <span className="w-1.5 h-6 rounded-full bg-[#183B8C] shrink-0 opacity-80"></span>
                              {row.name}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center border-r border-border">
                            {renderCell(row.inicial)}
                          </td>
                          <td className="px-4 py-3.5 text-center border-r border-border">
                            {renderCell(row.sentenca)}
                          </td>
                          <td className="px-4 py-3.5 text-center border-r border-border">
                            {renderCell(row.acordao)}
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <button
                              onClick={() => setSelectedPedido({ key: row.key, label: row.name })}
                              className="p-2 rounded-lg bg-blue-50 hover:bg-[#183B8C] text-[#183B8C] hover:text-white transition-all duration-200 shadow-sm border border-blue-100/50"
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

            {/* SEÇÃO 2 — EVOLUÇÃO DOS PEDIDOS ESTRATÉGICOS */}
            <div className="space-y-4 pt-2">
              <div className="px-1">
                <h3 className="text-[18px] font-bold text-[#111111] tracking-tight">Evolução dos pedidos estratégicos</h3>
                <p className="text-[12px] text-slate-500 font-medium">Acompanhamento da trajetória dos pedidos mais sensíveis ao longo das fases processuais.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FunnelCard 
                  title="Funil de Doença" 
                  subtitle="Pedidos de doença médica geral"
                  icon={<HeartPulse className="h-5 w-5 text-[#183B8C]" />}
                  initial={pedidosInicial.filter(p => isPositiveValue(p.do_medica_geral)).length}
                  sentenca={pedidosSentenca.filter(p => isPositiveValue(p.do_medica_geral)).length}
                  acordao={pedidosAcordao.filter(p => isPositiveValue(p.do_medica_geral)).length}
                />
                <FunnelCard 
                  title="Funil de Acidente de Trabalho" 
                  subtitle="Pedidos vinculados a acidentes típicos"
                  icon={<ShieldAlert className="h-5 w-5 text-[#183B8C]" />}
                  initial={pedidosInicial.filter(p => isPositiveValue(p.do_at)).length}
                  sentenca={pedidosSentenca.filter(p => isPositiveValue(p.acidente_trabalho)).length}
                  acordao={pedidosAcordao.filter(p => isPositiveValue(p.acidente_trabalho)).length}
                />
                <FunnelCard 
                  title="Funil de Estabilidade" 
                  subtitle="Garantia de emprego e indenizações substitutivas"
                  icon={<ShieldCheck className="h-5 w-5 text-[#183B8C]" />}
                  initial={pedidosInicial.filter(p => isPositiveValue(p.estabilidade)).length}
                  sentenca={pedidosSentenca.filter(p => isPositiveValue(p.estabilidade)).length}
                  acordao={pedidosAcordao.filter(p => isPositiveValue(p.estabilidade)).length}
                />
                <FunnelCard 
                  title="Funil de Reintegração" 
                  subtitle="Pedidos de retorno ao posto de trabalho"
                  icon={<Landmark className="h-5 w-5 text-[#183B8C]" />}
                  initial={pedidosInicial.filter(p => isPositiveValue(p.reintegracao)).length}
                  sentenca={pedidosSentenca.filter(p => isPositiveValue(p.reintegracao)).length}
                  acordao={pedidosAcordao.filter(p => isPositiveValue(p.reintegracao)).length}
                />
              </div>
            </div>

            {/* Per-Process Detail Dialog */}
            <Dialog open={!!selectedPedido} onOpenChange={(open) => { if (!open) setSelectedPedido(null) }}>
              <DialogContent className="sm:max-w-[95vw] sm:w-[95vw] w-[98vw] max-h-[95vh] overflow-hidden bg-white p-0 !max-w-none">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                  <DialogTitle className="text-[20px] font-bold text-[#111111] flex items-center gap-3">
                    <span className="w-2 h-8 rounded-full bg-[#183B8C] shrink-0"></span>
                    {selectedPedido?.label}
                    <Badge className="bg-[#DCE6F8] text-[#183B8C] font-bold hover:bg-[#DCE6F8] text-[11px] uppercase tracking-[0.04em]">
                      {detailRows.length} processo(s)
                    </Badge>
                  </DialogTitle>
                  <p className="text-[12px] text-slate-500 mt-1 font-medium">
                    Movimentação do pedido por processo individual — da Inicial ao Acórdão
                  </p>
                </DialogHeader>

                <ScrollArea className="max-h-[65vh]">
                  <div className="px-6 py-4">
                    <div className="overflow-x-auto rounded-lg border border-border bg-white shadow-sm">
                      <table className="w-full text-sm table-auto border-collapse">
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-[#183B8C] text-white">
                            <th className="text-left px-4 py-3 font-bold text-[11px] uppercase tracking-[0.04em] min-w-[180px] border-r border-white/10">Nº Processo</th>
                            <th className="text-left px-4 py-3 font-bold text-[11px] uppercase tracking-[0.04em] min-w-[250px] border-r border-white/10">Reclamante</th>
                            <th className="text-center px-2 py-3 font-bold text-[11px] uppercase tracking-[0.04em] border-r border-white/10 w-[110px]">Inicial</th>
                            <th className="text-center px-2 py-3 font-bold text-[11px] uppercase tracking-[0.04em] border-r border-white/10 w-[110px]">Sentença</th>
                            <th className="text-center px-2 py-3 font-bold text-[11px] uppercase tracking-[0.04em] w-[110px]">Acórdão</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailRows.map((row, idx) => (
                            <tr 
                              key={idx} 
                              className={`border-b border-border transition-colors hover:bg-blue-50/30 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                            >
                              <td className="px-4 py-2.5 font-mono text-[11px] font-bold text-slate-700 border-r border-border truncate">
                                {row.numero}
                              </td>
                              <td className="px-4 py-2.5 text-slate-700 text-[11px] font-bold uppercase tracking-tight truncate border-r border-border" title={row.reclamante}>
                                {row.reclamante}
                              </td>
                              <td className="px-4 py-2.5 border-r border-border text-center">
                                <BoolIcon value={row.inicial} />
                              </td>
                              <td className="px-4 py-2.5 border-r border-border text-center">
                                <BoolIcon value={row.sentenca} />
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <BoolIcon value={row.acordao} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </ScrollArea>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-6 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                    <span className="text-slate-600 font-bold uppercase tracking-tight">
                      Inicial: <strong className="text-emerald-600">{detailRows.filter(r => r.inicial === true).length}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                    <span className="text-slate-600 font-bold uppercase tracking-tight">
                      Sentença: <strong className="text-emerald-600">{detailRows.filter(r => r.sentenca === true).length}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                    <span className="text-slate-600 font-bold uppercase tracking-tight">
                      Acórdão: <strong className="text-emerald-600">{detailRows.filter(r => r.acordao === true).length}</strong>
                    </span>
                  </div>
                </div>
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
