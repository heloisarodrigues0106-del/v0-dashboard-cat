"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, DollarSign, MapPin, Archive, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, PieChart, Pie, Cell, Legend, Label } from "recharts"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { scaleLinear } from "d3-scale"
import { ConcessoesLiminares } from "./concessoes-liminares"

const geoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson"

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
    const statusAtivos = ['PROCEDENTE', 'PARCIALMENTE PROCEDENTE', 'SOBRESTADO', 'IMPROCEDENTE', 'ACORDO']
    const statusArquivados = ['ARQUIVADO', 'EXTINTO SEM MÉRITO']

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
      
      // Update Active/Archived count based on status
      if (statusAtivos.includes(statusVal)) {
        processosAtivosCount++
      } else if (statusArquivados.includes(statusVal)) {
        processosArquivadosCount++
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
      .slice(0, 5);

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
    .range(["#fefce8", "#b45309"]) // yellow-50 to amber-700

  return (
    <div className="space-y-6">
      
      {/* 1. KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total de Processos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalProcessos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Processos Ativos</CardTitle>
            <Activity className="h-4 w-4 text-[#F6D000]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F6D000]">{kpis.processosAtivos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Processos Arquivados</CardTitle>
            <Archive className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{kpis.processosArquivados}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Valor Total das Causas</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(kpis.valorCausa)}</div>
          </CardContent>
        </Card>

      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 2a. Top 5 Localidades Ranking */}
        <Card className="flex flex-col border-2 border-muted md:col-span-1">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-500" />
              Comarcas com maior volume de ajuizamento
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4 space-y-3 bg-[#f8fafc]/50">
            {kpis.topComarcasDetalhes.map((city, idx) => {
              const maxCount = Math.max(...kpis.topComarcasDetalhes.map(c => c.count))
              const widthPerc = Math.max(10, (city.count / maxCount) * 100)
              return (
                <div 
                  key={idx} 
                  className="relative p-3 rounded-lg border bg-background shadow-sm overflow-hidden group cursor-pointer hover:border-amber-300 transition-colors"
                  onMouseEnter={() => {
                    if (city.uf && mapData[city.uf]) {
                      setHoveredUF({ sigla: city.uf, details: mapData[city.uf] })
                    }
                  }}
                  onMouseLeave={() => setHoveredUF(null)}
                >
                  {/* Fundo de barra de progresso */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-amber-100/30 transition-all duration-500 ease-in-out" 
                    style={{ width: `${widthPerc}%`, zIndex: 0 }}
                  />
                  
                  <div className="relative flex justify-between items-center z-10 text-sm">
                    <div className="flex items-center gap-2 font-medium truncate">
                      <span className="text-muted-foreground min-w-[16px]">{idx + 1}º</span>
                      <span className="truncate max-w-[140px]" title={city.name}>{city.name}</span>
                      {city.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-red-500 flex-shrink-0" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2 font-bold shrink-0 bg-white/60">
                      {city.count.toLocaleString('pt-BR')}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

         {/* 2b. Mapa do Brasil (Heatmap por UF) */}
        <Card className="relative overflow-hidden border-2 border-muted md:col-span-2">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle>Mapa de Processos Ativos por UF</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[550px] relative p-0 bg-[#f8fafc]/50">
            
            {/* Pop-up Hover Card */}
            {hoveredUF && (
              <div 
                className="absolute top-6 right-6 z-10 w-64 p-5 bg-background border rounded-lg shadow-xl animate-in fade-in-50 zoom-in-95 pointer-events-none"
              >
                <div className="flex items-center gap-3 border-b pb-3 mb-3">
                  <MapPin className="h-5 w-5 text-amber-600" />
                  <h4 className="font-bold text-lg text-foreground">{hoveredUF.sigla}</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm font-medium">Processos:</span>
                    <span className="font-bold text-base bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                      {hoveredUF.details.count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm font-medium">Valor Total:</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      {formatCurrency(hoveredUF.details.valorTotal)}
                    </span>
                  </div>
                  {hoveredUF.details.comarcas && Object.keys(hoveredUF.details.comarcas).length > 0 && (
                     <div className="mt-3 pt-3 border-t">
                       <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block mb-2">Por Comarca</span>
                       <div className="max-h-[120px] overflow-y-auto space-y-1.5 pr-1">
                         {Object.entries(hoveredUF.details.comarcas)
                           .sort((a, b) => b[1] - a[1])
                           .slice(0, 5) // top 5 comarcas in this uf
                           .map(([cname, ccount]) => (
                             <div key={cname} className="flex justify-between items-center text-xs">
                               <span className="text-slate-700 truncate max-w-[140px]" title={cname}>{cname}</span>
                               <span className="font-medium bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{ccount}</span>
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
                    const fillValue = d && d.count > 0 ? colorScale(d.count) : "#e2e8f0"
                    const isHovered = hoveredUF?.sigla === mappedSigla
                    const actualFill = isHovered ? "#F6D000" : fillValue
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={actualFill}
                        stroke="#cbd5e1"
                        strokeWidth={0.7}
                        onMouseEnter={() => {
                          if (d) setHoveredUF({ sigla: mappedSigla, details: d })
                        }}
                        onMouseLeave={() => {
                          setHoveredUF(null)
                        }}
                        style={{
                          default: { outline: "none", transition: "all 250ms" },
                          hover: { fill: "#F6D000", outline: "none", cursor: "pointer", transition: "all 250ms" },
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
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Processos Ativos por Fase <Badge variant="secondary" className="font-normal bg-amber-100 text-amber-700">Total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ranks.fases} layout="vertical" margin={{ top: 20, right: 60, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorFases" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F6D000" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#d97706" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={110} axisLine={false} tickLine={false} stroke="hsl(var(--foreground))" tick={{fontSize: 12, fontWeight: 500}} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                  <Bar dataKey="count" fill="url(#colorFases)" radius={[50, 50, 50, 50]} barSize={24} isAnimationActive={true}>
                    <LabelList dataKey="count" position="right" formatter={(val: number) => val.toLocaleString('pt-BR')} style={{ fill: "hsl(var(--foreground))", fontSize: 13, fontWeight: 700 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 4. Distribuição por Tipo de Ação */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Distribuição por Tipo de Ação
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ranks.tiposAcao} layout="vertical" margin={{ top: 20, right: 60, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorTiposAcao" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#111111" stopOpacity={0.85}/>
                      <stop offset="100%" stopColor="#333333" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={110} axisLine={false} tickLine={false} stroke="hsl(var(--foreground))" tick={{fontSize: 12, fontWeight: 500}} />
                  <Tooltip 
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }} 
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(value: number) => [`${value.toLocaleString('pt-BR')} proc. (${((value / Math.max(kpis.totalProcessos, 1)) * 100).toFixed(1)}%)`, 'Total']}
                  />
                  <Bar dataKey="count" fill="url(#colorTiposAcao)" radius={[50, 50, 50, 50]} barSize={24} isAnimationActive={true}>
                    <LabelList dataKey="count" position="right" formatter={(val: number) => val.toLocaleString('pt-BR')} style={{ fill: "hsl(var(--foreground))", fontSize: 13, fontWeight: 700 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Instâncias (Gráfico de Pizza) */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Volumetria por instância</CardTitle>
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
                      innerRadius={90}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={true}
                    >
                      {ranks.instancias.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#F6D000', '#111111', '#d97706', '#78716c', '#b45309'][index % 5]} className="hover:opacity-80 transition-opacity duration-300 outline-none" style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))" }} />
                      ))}
                      <Label
                        value={kpis.totalProcessos.toLocaleString("pt-BR")}
                        position="center"
                        className="text-4xl font-extrabold fill-foreground"
                      />
                      <Label
                        value="Processos"
                        position="center"
                        dy={25}
                        className="text-sm font-medium fill-muted-foreground"
                      />
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                       formatter={(value: number) => [<span className="font-semibold">{`${value.toLocaleString('pt-BR')} proc.`}</span>, 'Total']}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      content={(props) => {
                        const { payload } = props;
                        return (
                          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
                            {payload?.map((entry: any, index: number) => {
                              const percentage = ((entry.payload.value / Math.max(kpis.totalProcessos, 1)) * 100).toFixed(1);
                              return (
                                <div key={`item-${index}`} className="flex items-center gap-2 text-xs font-semibold">
                                  <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                                  <span className="text-muted-foreground uppercase">{entry.value} ({percentage}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }}
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
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Volumetria por desfecho</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {ranks.status.length > 0 ? (
              <div className="h-[350px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ranks.status}
                      cx="50%"
                      cy="50%"
                      innerRadius={90}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={true}
                    >
                      {ranks.status.map((entry, index) => {
                        let fColor = "#94a3b8";
                        const nm = entry.name.toUpperCase();
                        if (nm.includes("PARCIALMENTE PROCEDENTE")) fColor = "#10b981";
                        else if (nm.includes("PROCEDENTE")) fColor = "#F6D000";
                        else if (nm.includes("ACORDO")) fColor = "#f97316";
                        else if (nm.includes("ARQUIVADO")) fColor = "#86efac";
                        else if (nm.includes("IMPROCEDENTE")) fColor = "#ef4444";
                        
                        return <Cell key={`cell-${index}`} fill={fColor} className="hover:opacity-80 transition-opacity duration-300 outline-none" style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))" }} />
                      })}
                      <Label
                        value={kpis.totalProcessos.toLocaleString("pt-BR")}
                        position="center"
                        className="text-4xl font-extrabold fill-foreground"
                      />
                      <Label
                        value="Processos"
                        position="center"
                        dy={25}
                        className="text-sm font-medium fill-muted-foreground"
                      />
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                       formatter={(value: number) => [<span className="font-semibold">{`${value.toLocaleString('pt-BR')} proc.`}</span>, 'Total']}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      content={(props) => {
                        const { payload } = props;
                        return (
                          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
                            {payload?.map((entry: any, index: number) => {
                              const percentage = ((entry.payload.value / Math.max(kpis.totalProcessos, 1)) * 100).toFixed(1);
                              return (
                                <div key={`item-${index}`} className="flex items-center gap-2 text-xs font-semibold">
                                  <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                                  <span className="text-muted-foreground uppercase truncate max-w-[120px]" title={entry.value}>{entry.value} ({percentage}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }}
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Volume de processos distribuídos <Badge variant="secondary" className="font-normal bg-amber-100 text-amber-700 hover:bg-amber-100">Total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ranks.anos} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis 
                   stroke="hsl(var(--muted-foreground))" 
                   tickLine={false} 
                   axisLine={false}
                   tickFormatter={(value) => value >= 1000000 ? `${(value/1000000).toFixed(1)}mi` : value >= 1000 ? `${(value/1000).toFixed(0)}k` : value.toString()}
                />
                <Tooltip 
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }} 
                  contentStyle={{ backgroundColor: "#1f2937", color: "#fff", borderRadius: "8px", border: "none" }}
                  formatter={(value: number) => [<span className="font-medium">{`${value.toLocaleString('pt-BR')} processos`}</span>, '']}
                  labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
                />
                <Bar dataKey="count" fill="#F6D000" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  <LabelList 
                    dataKey="count" 
                    position="top" 
                    formatter={(val: number) => val.toLocaleString('pt-BR')} 
                    style={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 600, textDecoration: "underline" }} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 4. Rankings Inferiores */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* Advogados */}
        <Card className="flex flex-col shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="font-bold flex items-center gap-2 font-inter">
              Ranking Advogado Adverso <Badge variant="secondary" className="font-normal bg-amber-100 text-amber-700">Total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ranks.advogados} layout="vertical" margin={{ top: 20, right: 60, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorAdvogados" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F6D000" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#d97706" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={180} 
                    axisLine={false} 
                    tickLine={false} 
                    stroke="hsl(var(--foreground))" 
                    tick={{fontSize: 11, fontWeight: 500}} 
                    tickFormatter={(val) => val.length > 25 ? val.substring(0, 25) + '...' : val}
                  />
                  <Tooltip 
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }} 
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} 
                  />
                  <Bar dataKey="count" fill="url(#colorAdvogados)" radius={[50, 50, 50, 50]} barSize={24} isAnimationActive={true}>
                    <LabelList dataKey="count" position="right" formatter={(val: number) => val.toLocaleString('pt-BR')} style={{ fill: "hsl(var(--foreground))", fontSize: 13, fontWeight: 700 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

         {/* Funções */}
        <Card className="flex flex-col shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="font-bold flex items-center gap-2 font-inter">
              Ajuizamento por Cargo <Badge variant="secondary" className="font-normal bg-amber-100 text-amber-700">Total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ranks.funcoes} layout="vertical" margin={{ top: 20, right: 60, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorFuncoes" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F6D000" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#d97706" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={180} 
                    axisLine={false} 
                    tickLine={false} 
                    stroke="hsl(var(--foreground))" 
                    tick={{fontSize: 11, fontWeight: 500}} 
                    tickFormatter={(val) => val.length > 25 ? val.substring(0, 25) + '...' : val}
                  />
                  <Tooltip 
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }} 
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} 
                  />
                  <Bar dataKey="count" fill="url(#colorFuncoes)" radius={[50, 50, 50, 50]} barSize={24} isAnimationActive={true}>
                    <LabelList dataKey="count" position="right" formatter={(val: number) => val.toLocaleString('pt-BR')} style={{ fill: "hsl(var(--foreground))", fontSize: 13, fontWeight: 700 }} />
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
