"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { UserSearch, Link as LinkIcon, ExternalLink, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function MapeamentoTestemunhas({ processos = [] }: { processos: any[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [abaTestemunha, setAbaTestemunha] = useState<"reclamante" | "reclamada">("reclamante")
  
  const { ranking, cruzamentos, detailsMap } = useMemo(() => {
    const testemunhasMap: Record<string, string[]> = {}
    const reclamantesMap: Record<string, string[]> = {}
    const detailsMap: Record<string, any> = {}

    processos.forEach(p => {
      const procNum = p.numero_processo || "S/N"
      detailsMap[procNum] = p
      
      // Captura Testemunhas (pode haver mais de uma se separada por vírgula, mas assumimos string inteira ou array)
      const test = abaTestemunha === "reclamante" ? p.testemunha_reclamante : p.testemunha_reclamada
      if (test && typeof test === "string" && test.trim() !== "") {
        const nomesTestemunhas = test.split(",").map(t => t.trim().toUpperCase()).filter(Boolean)
        nomesTestemunhas.forEach(nome => {
          if (!testemunhasMap[nome]) testemunhasMap[nome] = []
          testemunhasMap[nome].push(procNum)
        })
      }

      // Captura Reclamante
      const recl = p.nome_reclamante
      if (recl && typeof recl === "string" && recl.trim() !== "") {
        const nomeReclamante = recl.trim().toUpperCase()
        if (!reclamantesMap[nomeReclamante]) reclamantesMap[nomeReclamante] = []
        reclamantesMap[nomeReclamante].push(procNum)
      }
    })

    // 1. Ranking de Testemunhas Recorrentes
    const rankingArray = Object.entries(testemunhasMap)
      .map(([nome, processosList]) => ({
        nome,
        count: processosList.length,
        processos: Array.from(new Set(processosList)).sort()
      }))
      .sort((a, b) => b.count - a.count)

    // 2. Cruzamento: Testemunha que também é Reclamante
    const cruzamentosArray = []
    for (const testNome in testemunhasMap) {
      if (reclamantesMap[testNome]) {
        cruzamentosArray.push({
          nome: testNome,
          processosTestemunha: Array.from(new Set(testemunhasMap[testNome])).sort(),
          processosReclamante: Array.from(new Set(reclamantesMap[testNome])).sort()
        })
      }
    }
    
    // Sort cruzamentos por total de ocorrências
    cruzamentosArray.sort((a, b) => 
      (b.processosTestemunha.length + b.processosReclamante.length) - 
      (a.processosTestemunha.length + a.processosReclamante.length)
    )

    // 3. Aplicação do Filtro de Pesquisa
    const query = searchQuery.toLowerCase().trim()
    
    const filteredRanking = rankingArray.filter(item => {
      if (!query) return true
      const matchNome = item.nome.toLowerCase().includes(query)
      const matchProc = item.processos.some(p => p.toLowerCase().includes(query))
      const matchRecl = item.processos.some(p => {
        const recl = detailsMap[p]?.nome_reclamante || ""
        return recl.toLowerCase().includes(query)
      })
      return matchNome || matchProc || matchRecl
    })

    const filteredCruzamentos = cruzamentosArray.filter(item => {
      if (!query) return true
      const matchNome = item.nome.toLowerCase().includes(query)
      const matchProc = [...item.processosTestemunha, ...item.processosReclamante].some(p => p.toLowerCase().includes(query))
      const matchRecl = [...item.processosTestemunha, ...item.processosReclamante].some(p => {
        const recl = detailsMap[p]?.nome_reclamante || ""
        return recl.toLowerCase().includes(query)
      })
      return matchNome || matchProc || matchRecl
    })

    return { ranking: filteredRanking, cruzamentos: filteredCruzamentos, detailsMap }
  }, [processos, searchQuery, abaTestemunha])

  const renderProcessInfo = (proc: string) => {
    const pData = detailsMap[proc] || {}
    const ufStr = pData.uf ? ` (${pData.uf})` : ""
    const localidade = pData.vara && pData.comarca 
      ? `${pData.vara} - ${pData.comarca}${ufStr}`
      : pData.vara || pData.comarca || "Não informada"
      
    // Tratar o valor null ou string no formater
    const valor = typeof pData.valor_causa === "number" ? pData.valor_causa : Number(pData.valor_causa) || 0
    const valorFormatado = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)

    return (
      <HoverCard openDelay={0} closeDelay={150}>
        <HoverCardTrigger asChild>
          <div 
            className="text-[11px] bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded cursor-pointer hover:bg-amber-50 hover:text-[#111111] flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            {proc}
          </div>
        </HoverCardTrigger>
        <HoverCardContent side="top" className="w-[340px] bg-white rounded-xl shadow-lg border border-slate-200 p-4 animate-in fade-in zoom-in duration-150 z-50">
          <div className="flex flex-col gap-3">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Processo</span>
              <p className="font-mono text-sm font-bold text-[#111111] mt-0.5">{proc}</p>
            </div>
            <div className="grid gap-2.5 text-sm">
              <div className="grid grid-cols-[100px_1fr] gap-2 items-start">
                <span className="text-slate-500 font-medium text-xs uppercase pt-0.5">Reclamante</span>
                <span className="text-slate-800 font-semibold leading-tight">{pData.nome_reclamante || "Não informado"}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 items-start">
                <span className="text-slate-500 font-medium text-xs uppercase pt-0.5">Advogado(a)</span>
                <span className="text-slate-800 leading-tight">{pData.advogado_reclamante || "Não informado"}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 items-start">
                <span className="text-slate-500 font-medium text-xs uppercase pt-0.5">Localidade</span>
                <span className="text-slate-800 leading-tight">{localidade}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 items-start">
                <span className="text-slate-500 font-medium text-xs uppercase pt-0.5">Fase Atual</span>
                <span className="text-slate-800 leading-tight">{pData.fase_processual || "Não informada"}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 items-center pt-2 border-t border-slate-100 mt-1">
                <span className="text-slate-500 font-medium text-xs uppercase">Valor Causa</span>
                <span className="text-emerald-600 font-bold text-base">
                  {valorFormatado}
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    )
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold text-[#111111] flex items-center gap-2">
            <UserSearch className="h-6 w-6 text-[#F6D000]" />
            Mapeamento de Testemunhas
          </CardTitle>
          <CardDescription className="text-slate-500 max-w-2xl">
            Análise de recorrência e cruzamento de dados de testemunhas com o polo ativo (Reclamantes) para identificação de padrões.
          </CardDescription>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar testemunha, reclamante ou número..." 
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Tabs defaultValue="ranking" className="w-full">
          <TabsList className="mb-4 bg-slate-100/50 p-1 w-full max-w-md grid grid-cols-2">
            <TabsTrigger 
              value="ranking" 
              className="data-[state=active]:bg-white data-[state=active]:text-[#111111] data-[state=active]:shadow-sm font-medium"
            >
              <UserSearch className="h-4 w-4 mr-2" />
              Ranking de Recorrência
            </TabsTrigger>
            <TabsTrigger 
              value="cruzamento"
              className="data-[state=active]:bg-white data-[state=active]:text-[#111111] data-[state=active]:shadow-sm font-medium"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Cruzamento de Nomes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ranking" className="space-y-4">
            <div className="flex border border-slate-200 rounded-md p-1 w-fit bg-slate-100/50 mb-4">
              <button 
                onClick={() => setAbaTestemunha('reclamante')}
                className={`px-6 py-1.5 text-xs font-semibold rounded-sm transition-all ${abaTestemunha === 'reclamante' ? 'bg-white shadow-sm text-[#111111]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Reclamante
              </button>
              <button 
                onClick={() => setAbaTestemunha('reclamada')}
                className={`px-6 py-1.5 text-xs font-semibold rounded-sm transition-all ${abaTestemunha === 'reclamada' ? 'bg-white shadow-sm text-[#111111]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Reclamada
              </button>
            </div>

            {ranking.length === 0 ? (
              <div className="flex items-center justify-center p-8 border border-dashed rounded-lg text-slate-400">
                Nenhuma testemunha registrada para a opção selecionada.
              </div>
            ) : (
              <ScrollArea className="h-[400px] w-full rounded-md border border-slate-200">
                <div className="p-4 space-y-4">
                  {ranking.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center bg-[#F6D000] text-[#111111] font-bold text-xs h-6 w-6 rounded-md">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800 text-sm md:text-base">
                            {item.nome}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500 font-medium">
                          Aparece em {item.count} processo(s)
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 sm:max-w-md justify-end">
                        {item.processos.map((proc, i) => (
                          <div key={i}>{renderProcessInfo(proc)}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="cruzamento" className="space-y-4">
            {cruzamentos.length === 0 ? (
              <div className="flex items-center justify-center p-8 border border-dashed rounded-lg text-slate-400">
                Nenhum cruzamento de nomes encontrado entre Testemunhas e Reclamantes.
              </div>
            ) : (
              <ScrollArea className="h-[400px] w-full rounded-md border border-slate-200">
                <div className="p-4 space-y-4">
                  {cruzamentos.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col gap-4">
                      
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-5 w-5 text-[#F6D000]" />
                          <span className="font-bold text-slate-800 text-sm md:text-base">
                            {item.nome}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          Atenção: Nome Coincidente
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            Atua como Testemunha
                          </h4>
                          <div className="flex flex-col gap-2">
                            {item.processosTestemunha.map((proc, i) => (
                              <div key={i} className="flex flex-col bg-slate-50 border border-slate-100 p-2 rounded shadow-sm hover:shadow transition-shadow">
                                <span className="text-[11px] text-slate-500 font-medium mb-1">Processo</span>
                                {renderProcessInfo(proc)}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#111111]"></span>
                            Figura como Reclamante
                          </h4>
                          <div className="flex flex-col gap-2">
                             {item.processosReclamante.map((proc, i) => (
                              <div key={i} className="flex flex-col bg-slate-50 border border-slate-100 p-2 rounded shadow-sm hover:shadow transition-shadow">
                                <span className="text-[11px] text-slate-500 font-medium mb-1">Processo</span>
                                {renderProcessInfo(proc)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
