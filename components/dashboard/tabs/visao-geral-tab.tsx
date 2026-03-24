"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, DollarSign, MapPin } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, PieChart, Pie, Cell, Legend } from "recharts"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { scaleLinear } from "d3-scale"

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

export function VisaoGeralTab({ processos }: { processos: any[] }) {
  
  const { kpis, ranks, mapData } = useMemo(() => {
    let valorTotal = 0
    let processCount = processos.length

    const dictAdvogados: Record<string, number> = {}
    const dictFuncoes: Record<string, number> = {}
    const dictFases: Record<string, number> = {}
    const dictComarcas: Record<string, number> = {}
    const dictUF: Record<string, number> = {}
    const dictAnos: Record<string, number> = {}
    const dictInstancias: Record<string, number> = {}
    const dictStatus: Record<string, number> = {}

    processos.forEach(p => {
      valorTotal += (p.valor_causa || 0)

      if (p.advogado_reclamante) dictAdvogados[p.advogado_reclamante] = (dictAdvogados[p.advogado_reclamante] || 0) + 1
      if (p.funcao_reclamante) dictFuncoes[p.funcao_reclamante] = (dictFuncoes[p.funcao_reclamante] || 0) + 1
      
      const fase = p.fase_processual || p.fase_processo_atual
      if (fase) dictFases[fase] = (dictFases[fase] || 0) + 1
      
      if (p.comarca) dictComarcas[p.comarca] = (dictComarcas[p.comarca] || 0) + 1
      
      if (p.data_ajuizamento) {
        try {
          const dt = new Date(p.data_ajuizamento)
          const ano = dt.getFullYear()
          if (!isNaN(ano)) {
            dictAnos[ano] = (dictAnos[ano] || 0) + 1
          }
        } catch (e) {}
      }

      if (p.instancia) dictInstancias[p.instancia] = (dictInstancias[p.instancia] || 0) + 1

      const statusVal = p.status || p.status_processo
      if (statusVal) dictStatus[statusVal] = (dictStatus[statusVal] || 0) + 1

      let uf = p.uf?.toUpperCase()
      if (uf) {
        if (uf.length > 2) uf = uf.substring(0, 2) // safety for "São Paulo" vs "SP" if any mixup
        dictUF[uf] = (dictUF[uf] || 0) + 1
      }
    })

    const topComarcas = getTopObj(dictComarcas, 5)

    return {
      kpis: {
        totalProcessos: processCount,
        valorCausa: valorTotal,
        topComarcasString: topComarcas.map(c => c.name).join(', ') || 'N/A'
      },
      ranks: {
        advogados: getTopObj(dictAdvogados, 5),
        funcoes: getTopObj(dictFuncoes, 5),
        fases: getTopObj(dictFases, 10).sort((a, b) => b.count - a.count),
        anos: Object.entries(dictAnos).map(([name, count]) => ({ name, count })).sort((a, b) => Number(a.name) - Number(b.name)),
        instancias: Object.entries(dictInstancias).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        status: Object.entries(dictStatus).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
      },
      mapData: dictUF
    }
  }, [processos])

  // Configuração da escala de cores para o Mapa de Calor (Azul muito claro a Azul escuro)
  const maxUfCount = Math.max(...Object.values(mapData), 1)
  const colorScale = scaleLinear<string>()
    .domain([0, maxUfCount])
    .range(["#eff6ff", "#1d4ed8"]) // blue-50 to blue-700

  return (
    <div className="space-y-6">
      
      {/* 1. KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Processos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalProcessos}</div>
            <p className="text-xs text-muted-foreground">Processos ativos na base</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total da Causa</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(kpis.valorCausa)}</div>
            <p className="text-xs text-muted-foreground">Somatória declarada baseada no SQL</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top 5 Localidades</CardTitle>
            <MapPin className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate" title={kpis.topComarcasString}>
              {kpis.topComarcasString}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Por distribuição das comarcas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
         {/* 2. Mapa do Brasil (Heatmap por UF) */}
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Processos Ativos por UF</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[350px]">
            <ComposableMap 
              projection="geoMercator" 
              projectionConfig={{ scale: 650, center: [-54, -15] }} 
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
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={d ? colorScale(d) : "#F5F4F6"}
                        stroke="#D6D6DA"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { fill: "#3b82f6", outline: "none" },
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

        {/* 3. Fases Processuais (Gráfico Barras Horizontal) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Processos ativos por fase <Badge variant="secondary" className="font-normal bg-blue-100 text-blue-700 hover:bg-blue-100">Total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ranks.fases} layout="vertical" margin={{ top: 20, right: 80, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    axisLine={false} 
                    tickLine={false} 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => value >= 1000000 ? `${(value/1000000).toFixed(0)}mi` : value >= 1000 ? `${(value/1000).toFixed(0)}k` : value} 
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    axisLine={false} 
                    tickLine={false} 
                    stroke="hsl(var(--foreground))" 
                    tick={{fontSize: 12}} 
                  />
                  <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }} contentStyle={{ borderRadius: "8px" }} />
                  <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={50}>
                    <LabelList 
                      dataKey="count" 
                      position="right" 
                      formatter={(val: number) => val.toLocaleString('pt-BR')} 
                      style={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 600 }} 
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Instâncias (Gráfico de Pizza) */}
        <Card>
          <CardHeader>
            <CardTitle>Porcentagem por Instância</CardTitle>
          </CardHeader>
          <CardContent>
            {ranks.instancias.length > 0 ? (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ranks.instancias}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {ranks.instancias.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                       formatter={(value: number) => [<span className="font-semibold">{`${value.toLocaleString('pt-BR')} proc.`}</span>, 'Total']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div className="flex h-[350px] items-center justify-center text-muted-foreground text-sm">Sem dados suficientes da coluna `instancia`</div>
            )}
          </CardContent>
        </Card>

        {/* Status (Gráfico de Pizza) */}
        <Card>
          <CardHeader>
            <CardTitle>Volume do Status de Ação</CardTitle>
          </CardHeader>
          <CardContent>
            {ranks.status.length > 0 ? (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ranks.status}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {ranks.status.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                       formatter={(value: number) => [<span className="font-semibold">{`${value.toLocaleString('pt-BR')} proc.`}</span>, 'Total']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div className="flex h-[350px] items-center justify-center text-muted-foreground text-sm">Sem dados suficientes da coluna `status` ou `status_processo`</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5. Volume de Processos Distribuídos por Ano */}
      <h3 className="text-lg font-medium mt-6 text-sidebar-foreground/70">Distribuição</h3>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Volume de processos distribuídos <Badge variant="secondary" className="font-normal bg-blue-100 text-blue-700 hover:bg-blue-100">Total</Badge>
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
                <Bar dataKey="count" fill="#e77b63" radius={[4, 4, 0, 0]} maxBarSize={50}>
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
      <div className="grid gap-4 md:grid-cols-2">
        {/* Advogados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold">Top Advogados (Reclamante)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ranks.advogados.map((item, i) => (
                 <div key={i} className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2 truncate">
                      <span className="text-muted-foreground w-4">{i+1}º</span>
                      <span className="truncate">{item.name}</span>
                   </div>
                   <span className="font-semibold">{item.count}</span>
                 </div>
              ))}
            </div>
          </CardContent>
        </Card>

         {/* Funções */}
         <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold">Top Funções (Reclamante)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ranks.funcoes.map((item, i) => (
                 <div key={i} className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2 truncate">
                      <span className="text-muted-foreground w-4">{i+1}º</span>
                      <span className="truncate">{item.name}</span>
                   </div>
                   <span className="font-semibold">{item.count}</span>
                 </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
