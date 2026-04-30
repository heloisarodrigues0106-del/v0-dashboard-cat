"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, DollarSign, MapPin, Archive, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react"
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, PieChart, Pie, Cell, Legend, Label } from "recharts"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { scaleLinear } from "d3-scale"
import { ConcessoesLiminares } from "./concessoes-liminares"

const THEME = {
  azulProfundo: "#102A63",
  azulInstitucional: "#183B8C",
  azulMedio: "#4F6DB8",
  azulClaro: "#DCE6F8",
  favoravel: "#14B8A6",
  atencao: "#4F6DB8",
  critico: "#DC2626",
  neutro: "#94A3B8",
  apoio: "#CBD5E1",
  background: "#F8FAFC",
  border: "#E5E7EB",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
}

const geoUrl = "/brazil-states.geojson"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value || 0)
}

function getTopObj(mapRecord: Record<string, number>, top: number = 5) {
  return Object.entries(mapRecord)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top)
}

export function VisaoGeralTab({ processos, pedidos = [] }: { processos: any[], pedidos?: any[] }) {
  
  const [hoveredUF, setHoveredUF] = useState<{sigla: string, details: { count: number, valorTotal: number, comarcas: Record<string, number> }} | null>(null)

  const { kpis, ranks, mapData } = useMemo(() => {
    let valorTotal = 0
    let processCount = processos.length

    // Status groups as requested by user


    let processosAtivosCount = 0
    let processosArquivadosCount = 0

    const dictAdvogados: Record<string, number> = {}
    const dictFuncoes: Record<string, number> = {}
    const dictFases: Record<string, number> = {}
    const dictComarcas: Record<string, { count: number, uf: string, recent: number }> = {}
    
    let maxDateMs = 0;
    processos.forEach(p => {
       if (p.data_ajuizamento) {
         try {
           const time = new Date(p.data_ajuizamento).getTime()
           if (time > maxDateMs) maxDateMs = time
         } catch(e) {}
       }
    })

    const dictUF: Record<string, { count: number, valorTotal: number, comarcas: Record<string, number> }> = {}
    const dictAnos: Record<string, number> = {}
    const dictTipoAcao: Record<string, number> = {}
    const dictInstancias: Record<string, number> = {}
    const dictStatus: Record<string, number> = {}

    processos.forEach(p => {
      valorTotal += (p.valor_causa || 0)

      const statusVal = (p.status || p.status_processo || "").toUpperCase().trim()
      const instanciaVal = (p.instancia || "").toUpperCase().trim()
      
      // Regra: Se a instância é 'ARQUIVADO', conta como arquivado. Caso contrário, é ATIVO.
      if (instanciaVal === 'ARQUIVADO') {
        processosArquivadosCount++
      } else {
        processosAtivosCount++
      }

      if (p.advogado_reclamante) dictAdvogados[p.advogado_reclamante] = (dictAdvogados[p.advogado_reclamante] || 0) + 1
      if (p.funcao_reclamante) dictFuncoes[p.funcao_reclamante] = (dictFuncoes[p.funcao_reclamante] || 0) + 1
      
      const fase = p.fase_processual || p.fase_processo_atual
      if (fase) dictFases[fase] = (dictFases[fase] || 0) + 1
      
      if (p.comarca) {
        if (!dictComarcas[p.comarca]) {
           dictComarcas[p.comarca] = { count: 0, uf: p.uf?.toUpperCase()?.substring(0, 2) || "", recent: 0 }
        }
        dictComarcas[p.comarca].count += 1
        
        if (p.data_ajuizamento) {
          try {
            const time = new Date(p.data_ajuizamento).getTime();
            if (maxDateMs - time <= 90 * 24 * 60 * 60 * 1000) {
               dictComarcas[p.comarca].recent += 1;
            }
          } catch(e) {}
        }
      }
      
      if (p.data_ajuizamento) {
        try {
          const anoStr = typeof p.data_ajuizamento === 'string' ? p.data_ajuizamento.split('-')[0] : null;
          if (anoStr) {
            const ano = parseInt(anoStr, 10);
            if (!isNaN(ano)) {
              dictAnos[ano] = (dictAnos[ano] || 0) + 1
            }
          }
        } catch (e) {}
      }

      if (p.tipo_acao) dictTipoAcao[p.tipo_acao] = (dictTipoAcao[p.tipo_acao] || 0) + 1
      if (p.instancia) dictInstancias[p.instancia] = (dictInstancias[p.instancia] || 0) + 1

      if (statusVal) dictStatus[statusVal] = (dictStatus[statusVal] || 0) + 1

      let uf = p.uf?.toUpperCase()
      if (uf) {
        if (uf.length > 2) uf = uf.substring(0, 2)
        if (!dictUF[uf]) dictUF[uf] = { count: 0, valorTotal: 0, comarcas: {} }
        dictUF[uf].count += 1
        dictUF[uf].valorTotal += (p.valor_causa || 0)
        
        const comarcaVar = p.comarca ? p.comarca.trim() : "SEM COMARCA"
        dictUF[uf].comarcas[comarcaVar] = (dictUF[uf].comarcas[comarcaVar] || 0) + 1
      }
    })

    const topComarcasDetalhes = Object.entries(dictComarcas)
      .map(([name, data]) => {
         const trend = data.recent / data.count >= 0.1 ? "up" : "down";
         return { name, count: data.count, uf: data.uf, trend };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      kpis: {
        totalProcessos: processCount,
        processosAtivos: processosAtivosCount,
        processosArquivados: processosArquivadosCount,
        valorCausa: valorTotal,
        topComarcasString: topComarcasDetalhes.map(c => c.name).join(', ') || 'N/A',
        topComarcasDetalhes
      },
      ranks: {
        advogados: getTopObj(dictAdvogados, 5),
        funcoes: getTopObj(dictFuncoes, 5),
        fases: getTopObj(dictFases, 10).sort((a, b) => b.count - a.count),
        tiposAcao: getTopObj(dictTipoAcao, 8).sort((a, b) => b.count - a.count),
        anos: Object.entries(dictAnos).map(([name, count]) => ({ name, count })).sort((a, b) => Number(a.name) - Number(b.name)),
        instancias: Object.entries(dictInstancias).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        status: Object.entries(dictStatus).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
      },
      mapData: dictUF
    }
  }, [processos])

  // Configuração da escala de cores para o Mapa de Calor (Azul muito claro a Azul escuro)
  const maxUfCount = Math.max(...Object.values(mapData).map(d => d.count), 1)
  const colorScale = scaleLinear<string>()
    .domain([0, maxUfCount])
    .range([THEME.azulClaro, THEME.azulProfundo])

  return (
    <div className="space-y-6">
      
      {/* 1. KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">Total de Processos</CardTitle>
            <div className="bg-slate-100 p-2 rounded-lg">
              <FileText className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-[32px] font-bold text-slate-800 tracking-tight leading-none">{kpis.totalProcessos}</div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">Processos Ativos</CardTitle>
            <div className="bg-blue-50 p-2 rounded-lg">
              <Activity className="h-4 w-4 text-[#183B8C]" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-[32px] font-bold text-[#183B8C] tracking-tight leading-none">{kpis.processosAtivos}</div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">Processos Arquivados</CardTitle>
            <div className="bg-slate-50 p-2 rounded-lg">
              <Archive className="h-4 w-4 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-[32px] font-bold text-slate-500 tracking-tight leading-none">{kpis.processosArquivados}</div>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">Valor em Risco (Causa)</CardTitle>
            <div className="bg-emerald-50 p-2 rounded-lg">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-[32px] font-bold text-emerald-600 tracking-tight leading-none">{formatCurrency(kpis.valorCausa)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 2a. Top 5 Localidades Ranking */}
        <Card className="flex flex-col border-border shadow-sm md:col-span-1">
          <CardHeader className="border-b bg-slate-50/50 pt-4 px-5 pb-3">
            <CardTitle className="text-[16px] font-bold flex items-center gap-2 text-slate-800">
              <MapPin className="h-4 w-4 text-[#183B8C]" />
              Concentração de Ajuizamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4 space-y-3 bg-white">
            {kpis.topComarcasDetalhes.map((city, idx) => {
              const maxCount = Math.max(...kpis.topComarcasDetalhes.map(c => c.count))
              const widthPerc = Math.max(10, (city.count / maxCount) * 100)
              return (
                <div 
                  key={idx} 
                  className="relative p-3 rounded-lg border border-slate-100 bg-background shadow-sm overflow-hidden group cursor-pointer hover:border-blue-200 transition-colors"
                  onMouseEnter={() => {
                    if (city.uf && mapData[city.uf]) {
                      setHoveredUF({ sigla: city.uf, details: mapData[city.uf] })
                    }
                  }}
                  onMouseLeave={() => setHoveredUF(null)}
                >
                  {/* Fundo de barra de progresso */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-blue-50/50 transition-all duration-500 ease-in-out" 
                    style={{ width: `${widthPerc}%`, zIndex: 0 }}
                  />
                  
                  <div className="relative flex justify-between items-center z-10 text-sm">
                    <div className="flex items-center gap-2 font-bold text-slate-700 truncate">
                      <span className="text-slate-400 min-w-[16px] font-medium">{idx + 1}º</span>
                      <span className="truncate max-w-[140px]" title={city.name}>{city.name}</span>
                      {city.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-red-500 flex-shrink-0" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2 font-black shrink-0 bg-white border-slate-200 text-[#183B8C]">
                      {city.count.toLocaleString('pt-BR')}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

         {/* 2b. Mapa do Brasil (Heatmap por UF) */}
        <Card className="relative overflow-hidden border-border shadow-sm md:col-span-2">
          <CardHeader className="border-b bg-slate-50/50 pt-4 px-5 pb-3">
            <CardTitle className="text-[#102A63] text-[16px] font-bold uppercase tracking-tight">Mapa de Calor: Processos por UF</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[550px] relative p-0 bg-white">
            
            {/* Pop-up Hover Card */}
            {hoveredUF && (
              <div 
                className="absolute top-6 right-6 z-10 w-64 p-5 bg-background border border-slate-200 rounded-xl shadow-2xl animate-in fade-in-50 zoom-in-95 pointer-events-none"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3">
                  <MapPin className="h-5 w-5 text-[#183B8C]" />
                  <h4 className="font-black text-lg text-slate-800 tracking-tight">{hoveredUF.sigla}</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Processos:</span>
                    <span className="font-black text-base text-[#183B8C]">
                      {hoveredUF.details.count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Valor Total:</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      {formatCurrency(hoveredUF.details.valorTotal)}
                    </span>
                  </div>

                  {hoveredUF.details.comarcas && Object.keys(hoveredUF.details.comarcas).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-2">Top Comarcas</span>
                      <div className="max-h-[120px] overflow-y-auto space-y-1.5 pr-1">
                        {Object.entries(hoveredUF.details.comarcas)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([cname, ccount]) => (
                            <div key={cname} className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-700 truncate max-w-[140px] font-bold" title={cname}>{cname}</span>
                              <span className="font-black text-[#183B8C]">{ccount}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <ComposableMap 
              projection="geoMercator" 
              projectionConfig={{ scale: 800, center: [-54, -15] }} 
              style={{ width: "100%", height: "100%" }}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }: any) =>
                  geographies.map((geo: any) => {
                    // Cuidado com a propriedade sigla no geojson do IBGE/click_that_hood
                    const stateSigla = geo.properties.sigla || geo.properties.id || geo.id // Depende do topojson exato
                    let mappedSigla = ""
                    if (typeof geo.id === "string" && geo.id.length === 2 && geo.id.toUpperCase() !== geo.id.toLowerCase()) {
                       mappedSigla = geo.id.toUpperCase() // Formato UF normal SC, SP
                    }
                    if (geo.properties?.sigla) {
                       mappedSigla = geo.properties.sigla.toUpperCase()
                    }

                    const d = mapData[mappedSigla]
                    const fillValue = d && d.count > 0 ? colorScale(d.count) : "#F1F5F9"
                    const isHovered = hoveredUF?.sigla === mappedSigla
                    const actualFill = isHovered ? THEME.azulMedio : fillValue
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={actualFill}
                        stroke="#fff"
                        strokeWidth={1}
                        onMouseEnter={() => {
                          if (d) setHoveredUF({ sigla: mappedSigla, details: d })
                        }}
                        onMouseLeave={() => {
                          setHoveredUF(null)
                        }}
                        style={{
                          default: { outline: "none", transition: "all 250ms" },
                          hover: { fill: THEME.azulMedio, outline: "none", cursor: "pointer", transition: "all 250ms" },
                          pressed: { outline: "none" },
                        }}
                      />
                    )
                  })
                }
              </Geographies>
            </ComposableMap>
          </CardContent>
        </Card>

      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* 3. Fases Processuais (Gráfico Barras Horizontal) */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pt-4 px-5 pb-3">
            <CardTitle className="flex items-center justify-between text-[#102A63] text-[16px] font-bold uppercase tracking-tight">
              Processos Ativos por Fase 
              <Badge variant="secondary" className="bg-[#DCE6F8] text-[#183B8C] font-bold text-[10px] uppercase tracking-[0.04em]">Total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ranks.fases} layout="vertical" margin={{ top: 20, right: 60, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke={THEME.border} opacity={0.4} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={110} axisLine={false} tickLine={false} stroke={THEME.textPrimary} tick={{fontSize: 11, fontWeight: 700}} />
                  <Tooltip 
                    cursor={{ fill: THEME.azulClaro, opacity: 0.3 }} 
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }}
                    itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                  />
                  <Bar dataKey="count" radius={[0, 50, 50, 0]} barSize={24} isAnimationActive={true}>
                    {ranks.fases.map((entry: any, index: number) => {
                      let barColor = THEME.azulInstitucional;
                      const name = String(entry.name).toUpperCase();
                      if (name.includes("CONHECIMENTO")) barColor = "#183B8C";
                      else if (name.includes("RECURSAL")) barColor = "#4F6DB8";
                      else if (name.includes("EXECUÇÃO") || name.includes("EXECUCAO")) barColor = "#94A3B8";
                      return <Cell key={`cell-${index}`} fill={barColor} />;
                    })}
                    <LabelList dataKey="count" position="right" formatter={(val: number) => val.toLocaleString('pt-BR')} style={{ fill: THEME.textPrimary, fontSize: 13, fontWeight: 900 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 4. Distribuição por Tipo de Ação */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pt-4 px-5 pb-3">
            <CardTitle className="text-[#102A63] text-[16px] font-bold uppercase tracking-tight">Distribuição por Tipo de Ação</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ranks.tiposAcao} layout="vertical" margin={{ top: 20, right: 60, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke={THEME.border} opacity={0.4} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={110} axisLine={false} tickLine={false} stroke={THEME.textPrimary} tick={{fontSize: 11, fontWeight: 700}} />
                  <Tooltip 
                    cursor={{ fill: THEME.azulClaro, opacity: 0.3 }} 
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }}
                    formatter={(value: number) => [`${value.toLocaleString('pt-BR')} proc. (${((value / Math.max(kpis.totalProcessos, 1)) * 100).toFixed(1)}%)`, 'Total']}
                  />
                  <Bar dataKey="count" fill={THEME.azulProfundo} radius={[0, 50, 50, 0]} barSize={24} isAnimationActive={true}>
                    <LabelList dataKey="count" position="right" formatter={(val: number) => val.toLocaleString('pt-BR')} style={{ fill: THEME.textPrimary, fontSize: 13, fontWeight: 900 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Instâncias (Gráfico de Pizza) */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pt-4 px-5 pb-3">
            <CardTitle className="text-[#102A63] text-[16px] font-bold uppercase tracking-tight">Volumetria por instância</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {ranks.instancias.length > 0 ? (
              <div className="h-[350px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ranks.instancias}
                      cx="50%"
                      cy="50%"
                      innerRadius={85}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                      isAnimationActive={true}
                    >
                      {ranks.instancias.map((entry, index) => {
                         let cellColor = THEME.azulMedio;
                         const name = String(entry.name).toUpperCase();
                         if (name.includes("PRIMEIRA")) cellColor = "#183B8C";
                         else if (name.includes("SEGUNDA")) cellColor = "#94A3B8";
                         else if (name.includes("TERCEIRA")) cellColor = "#4B5563";
                         else if (name.includes("ARQUIVADO")) cellColor = "#CBD5E1";
                         return <Cell key={`cell-${index}`} fill={cellColor} className="hover:opacity-80 transition-opacity duration-300" />;
                      })}
                      <Label
                        value={kpis.totalProcessos.toLocaleString("pt-BR")}
                        position="center"
                        className="text-4xl font-black fill-slate-800"
                      />
                      <Label
                        value="PROCESSOS"
                        position="center"
                        dy={25}
                        className="text-[10px] font-black fill-slate-400 uppercase tracking-widest"
                      />
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }}
                       formatter={(value: number, name: string) => {
                         const percentage = ((value / Math.max(kpis.totalProcessos, 1)) * 100).toFixed(1);
                         return [<span className="font-bold text-slate-700">{`${value.toLocaleString('pt-BR')} proc. (${percentage}%)`}</span>, name];
                       }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div className="flex h-[350px] items-center justify-center text-muted-foreground text-sm">Sem dados suficientes da coluna `instancia`</div>
            )}
          </CardContent>
        </Card>

        {/* Status (Gráfico de Pizza) */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pt-4 px-5 pb-3">
            <CardTitle className="text-[#102A63] text-[16px] font-bold uppercase tracking-tight">Volumetria por desfecho</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {ranks.status.length > 0 ? (
              <div className="h-[480px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ranks.status}
                      cx="50%"
                      cy="45%"
                      innerRadius={75}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                      isAnimationActive={true}
                    >
                      {ranks.status.map((entry, index) => {
                         let cellColor = THEME.neutro;
                         const name = String(entry.name).toUpperCase();
                         
                         if (name.includes("IMPROCEDENTE")) cellColor = THEME.favoravel;
                         else if (name.includes("PARCIALMENTE")) cellColor = THEME.atencao;
                         else if (name.includes("PROCEDENTE")) cellColor = THEME.critico;
                         else if (name.includes("AGUARDANDO")) cellColor = THEME.neutro;
                         else if (name.includes("ACORDO")) cellColor = THEME.azulInstitucional;
                         else if (name.includes("SOBRESTADO")) cellColor = THEME.apoio;
                         else if (name.includes("ARQUIVADO")) cellColor = THEME.neutro;
                         else if (name.includes("EXTINTO SEM RESOLUÇÃO")) cellColor = THEME.azulMedio;
                         else if (name.includes("EXTINTO COM RESOLUÇÃO")) cellColor = THEME.azulProfundo;
                         
                         return <Cell key={`cell-${index}`} fill={cellColor} className="hover:opacity-80 transition-opacity duration-300" />;
                      })}
                      <Label
                        value={kpis.totalProcessos.toLocaleString("pt-BR")}
                        position="center"
                        className="text-4xl font-black fill-slate-800"
                      />
                      <Label
                        value="PROCESSOS"
                        position="center"
                        dy={25}
                        className="text-[10px] font-black fill-slate-400 uppercase tracking-widest"
                      />
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }}
                       formatter={(value: number, name: string) => {
                         const percentage = ((value / Math.max(kpis.totalProcessos, 1)) * 100).toFixed(1);
                         return [<span className="font-bold text-slate-700">{`${value.toLocaleString('pt-BR')} proc. (${percentage}%)`}</span>, name];
                       }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ paddingTop: "20px" }}
                      formatter={(value) => <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter px-0.5">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div className="flex h-[350px] items-center justify-center text-muted-foreground text-sm">Sem dados suficientes da coluna `status` ou `status_processo`</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
         <ConcessoesLiminares processos={processos} />
      </div>

      {/* 5. Volume de Processos Distribuídos por Ano */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pt-4 px-5 pb-3">
          <CardTitle className="flex items-center justify-between text-[#102A63] text-[16px] font-bold uppercase tracking-tight">
            Volume de processos distribuídos 
            <Badge variant="secondary" className="bg-[#DCE6F8] text-[#183B8C] font-bold text-[10px] uppercase tracking-[0.04em]">Anual</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ranks.anos} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorBlueArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.azulInstitucional} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={THEME.azulInstitucional} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.border} opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: THEME.textSecondary }} dy={10} />
                <YAxis 
                   stroke={THEME.textSecondary} 
                   tickLine={false} 
                   axisLine={false}
                   tickFormatter={(value) => value >= 1000000 ? `${(value/1000000).toFixed(1)}mi` : value >= 1000 ? `${(value/1000).toFixed(0)}k` : value.toString()}
                   tick={{fontSize: 11, fontWeight: 700}}
                />
                <Tooltip 
                  cursor={{ stroke: THEME.azulInstitucional, strokeWidth: 1, strokeDasharray: "4 4" }} 
                  contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }}
                  itemStyle={{ color: THEME.azulProfundo, fontWeight: 900 }}
                  formatter={(value: number) => [`${value.toLocaleString('pt-BR')} processos`, 'Volume']}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke={THEME.azulInstitucional} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorBlueArea)" 
                  isAnimationActive={true}
                >
                  <LabelList 
                    dataKey="count" 
                    position="top" 
                    formatter={(val: number) => val.toLocaleString('pt-BR')} 
                    style={{ fill: THEME.textPrimary, fontSize: 11, fontWeight: 900 }} 
                  />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 4. Rankings Inferiores */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* Advogados */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pt-4 px-5 pb-3">
            <CardTitle className="text-[#102A63] text-[16px] font-bold flex items-center justify-between uppercase tracking-tight">
              Ranking Advogado Adverso 
              <Badge variant="secondary" className="bg-[#DCE6F8] text-[#183B8C] font-bold text-[10px] uppercase tracking-[0.04em]">Top 5</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ranks.advogados} layout="vertical" margin={{ top: 20, right: 60, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke={THEME.border} opacity={0.4} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={180} 
                    axisLine={false} 
                    tickLine={false} 
                    stroke={THEME.textPrimary} 
                    tick={{fontSize: 11, fontWeight: 700}} 
                    tickFormatter={(val) => val.length > 25 ? val.substring(0, 25) + '...' : val}
                  />
                  <Tooltip 
                    cursor={{ fill: THEME.azulClaro, opacity: 0.3 }} 
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }}
                  />
                  <Bar dataKey="count" radius={[0, 50, 50, 0]} barSize={24} isAnimationActive={true}>
                    {ranks.advogados.map((entry: any, index: number) => {
                       const colors = [THEME.azulProfundo, THEME.azulInstitucional, THEME.azulMedio, THEME.neutro, THEME.neutro];
                       return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                    <LabelList dataKey="count" position="right" formatter={(val: number) => val.toLocaleString('pt-BR')} style={{ fill: THEME.textPrimary, fontSize: 13, fontWeight: 900 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

         {/* Funções */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pt-4 px-5 pb-3">
            <CardTitle className="text-[#102A63] text-[16px] font-bold flex items-center justify-between uppercase tracking-tight">
              Ajuizamento por Cargo 
              <Badge variant="secondary" className="bg-[#DCE6F8] text-[#183B8C] font-bold text-[10px] uppercase tracking-[0.04em]">Top 5</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ranks.funcoes} layout="vertical" margin={{ top: 20, right: 60, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke={THEME.border} opacity={0.4} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={180} 
                    axisLine={false} 
                    tickLine={false} 
                    stroke={THEME.textPrimary} 
                    tick={{fontSize: 11, fontWeight: 700}} 
                    tickFormatter={(val) => val.length > 25 ? val.substring(0, 25) + '...' : val}
                  />
                  <Tooltip 
                    cursor={{ fill: THEME.azulClaro, opacity: 0.3 }} 
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }}
                  />
                  <Bar dataKey="count" radius={[0, 50, 50, 0]} barSize={24} isAnimationActive={true}>
                    {ranks.funcoes.map((entry: any, index: number) => {
                       const colors = [THEME.azulProfundo, THEME.azulInstitucional, THEME.azulMedio, THEME.neutro, THEME.neutro];
                       return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                    <LabelList dataKey="count" position="right" formatter={(val: number) => val.toLocaleString('pt-BR')} style={{ fill: THEME.textPrimary, fontSize: 13, fontWeight: 900 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
