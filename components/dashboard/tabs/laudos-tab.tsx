import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { AlertCircle, CheckCircle2, FileText, XCircle } from "lucide-react"

export function LaudosTab({ laudos }: { laudos: any[] }) {
  
  const stats = useMemo(() => {
    let total = laudos.length
    let favoraveis = 0
    let desfavoraveis = 0
    let motivos = {
      Insalubridade: 0,
      Periculosidade: 0,
      "Doença Ergonômica": 0,
      "Doença Mental": 0,
      "Outros": 0
    }
    let statsPerito: Record<string, { favoraveis: number, desfavoraveis: number }> = {}
    let tiposLaudo: Record<string, number> = { "Técnica": 0, "Médica Ergonômica": 0, "Médica Mental": 0, "Outros/Não Especificado": 0 }
    let nexos = { Causa: 0, Concausa: 0, "Incapacidade/Restrição": 0 }
    let ergoStatus = { Causa: 0, Concausa: 0, "Sem Nexo": 0 }
    let mentalStatus = { Causa: 0, Concausa: 0, "Sem Nexo": 0 }
    let insalubridadeStatus = { Caracterizada: 0, "Não Caracterizada": 0 }
    let periculosidadeStatus = { Caracterizada: 0, "Não Caracterizada": 0 }

    laudos.forEach(laudo => {
      // Checar se há risco/desfavorabilidade nas colunas críticas
      const valores = [
        laudo.doenca,
        laudo.acidente_trabalho,
        laudo.periculosidade,
        laudo.insalubridade,
        laudo.doenca_ergonomica,
        laudo.doenca_mental,
        laudo.resultado,
        laudo.motivo_perda
      ].map(v => String(v).toLowerCase().trim())

      const palavrasCriticas = ["true", "causa", "concausa", "incapaz", "incapacidadeparcial", "desfavoravel", "desfavorável", "perda"]
      
      const isDesfavoravel = 
        laudo.desfavoravel === true || 
        valores.some(v => palavrasCriticas.some(pc => v.includes(pc)))

      if (isDesfavoravel) {
        desfavoraveis++
        
        // Mapear motivos
        const motivoStr = (laudo.motivo_perda || laudo.tipo_pericia || "").toLowerCase()
        if (motivoStr.includes("insalubridade") || laudo.insalubridade === "Desfavorável") motivos.Insalubridade++
        else if (motivoStr.includes("periculosidade") || laudo.periculosidade === "Desfavorável") motivos.Periculosidade++
        else if (motivoStr.includes("ergonômica") || motivoStr.includes("ergonomica") || laudo.doenca_ergonomica) motivos["Doença Ergonômica"]++
        else if (motivoStr.includes("mental") || laudo.doenca_mental) motivos["Doença Mental"]++
        else motivos.Outros++
      } else {
        favoraveis++
      }

      // Tipologia de Perícia Atualizada
      const isTecnica = laudo.insalubridade === true || String(laudo.insalubridade).toLowerCase() === "true" ||
                        laudo.periculosidade === true || String(laudo.periculosidade).toLowerCase() === "true";
      
      const ergoStr = String(laudo.do_ergonomica || laudo.doenca_ergonomica || "").trim().toLowerCase();
      const isErgonomica = ergoStr !== "" && ergoStr !== "null" && ergoStr !== "false" && ergoStr !== "undefined";
      
      const mentalStr = String(laudo.do_mental || laudo.doenca_mental || "").trim().toLowerCase();
      const isMental = laudo.do_mental === true || (mentalStr !== "" && mentalStr !== "null" && mentalStr !== "false" && mentalStr !== "undefined");

      if (isTecnica) tiposLaudo["Técnica"]++;
      if (isErgonomica) tiposLaudo["Médica Ergonômica"]++;
      if (isMental) tiposLaudo["Médica Mental"]++;
      if (!isTecnica && !isErgonomica && !isMental) tiposLaudo["Outros/Não Especificado"]++;

      // Nexo e Capacidade
      const joinedValores = valores.join(" ")
      if (joinedValores.includes("concausa")) {
        nexos.Concausa++
      } else if (joinedValores.includes("causa")) {
        nexos.Causa++
      }

      if (joinedValores.includes("incapaz") || joinedValores.includes("incapacidade") || joinedValores.includes("restrição") || joinedValores.includes("capacidade")) {
        nexos["Incapacidade/Restrição"]++
      }

      // Gráfico Específico para do_ergonomica
      // Considera a coluna 'do_ergonomica' ou 'doenca_ergonomica', nulls entram como 'Sem Nexo'
      const ergoVal = String(laudo.do_ergonomica || laudo.doenca_ergonomica || "").toLowerCase().trim()
      if (ergoVal.includes("concausa")) {
        ergoStatus.Concausa++
      } else if (ergoVal.includes("causa")) {
        ergoStatus.Causa++
      } else {
        ergoStatus["Sem Nexo"]++
      }

      // Gráfico Específico para do_mental
      if (mentalStr.includes("concausa")) {
        mentalStatus.Concausa++
      } else if (mentalStr.includes("causa") || laudo.do_mental === true || String(laudo.do_mental).toLowerCase() === "true") {
        mentalStatus.Causa++
      } else {
        mentalStatus["Sem Nexo"]++
      }

      // Gráficos Específicos para Insalubridade e Periculosidade
      if (laudo.insalubridade === true || String(laudo.insalubridade).toLowerCase() === "true") {
        insalubridadeStatus.Caracterizada++
      } else {
        insalubridadeStatus["Não Caracterizada"]++
      }

      if (laudo.periculosidade === true || String(laudo.periculosidade).toLowerCase() === "true") {
        periculosidadeStatus.Caracterizada++
      } else {
        periculosidadeStatus["Não Caracterizada"]++
      }

      // Correlacionar com o Perito
      const nomePerito = laudo.perito || "Perito Não Informado"
      if (!statsPerito[nomePerito]) statsPerito[nomePerito] = { favoraveis: 0, desfavoraveis: 0 }
      
      if (isDesfavoravel) {
        statsPerito[nomePerito].desfavoraveis++
      } else {
        statsPerito[nomePerito].favoraveis++
      }
    })

    return { 
      total, favoraveis, desfavoraveis, motivos, statsPerito, tiposLaudo, nexos, 
      ergoStatus, mentalStatus, insalubridadeStatus, periculosidadeStatus 
    }
  }, [laudos])

  const peritosData = Object.entries(stats.statsPerito)
    .map(([name, data]) => ({ name, Favorável: data.favoraveis, Desfavorável: data.desfavoraveis, Total: data.favoraveis + data.desfavoraveis }))
    .sort((a, b) => b.Desfavorável - a.Desfavorável || b.Total - a.Total) // Ordenar por quem mais condena (desfavorável) primeiro
    .slice(0, 15) // Limitar top 15

  const tiposData = Object.entries(stats.tiposLaudo)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))

  const nexosData = Object.entries(stats.nexos)
    .map(([name, Quantidade]) => ({ name, Quantidade, percent: stats.total > 0 ? ((Quantidade / stats.total) * 100).toFixed(1) : 0 }))

  const pieData = [
    { name: "Favoráveis", value: stats.favoraveis, color: "#10b981" },
    { name: "Desfavoráveis", value: stats.desfavoraveis, color: "#ef4444" },
  ]

  const motivosData = Object.entries(stats.motivos)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, Quantidade: value }))
    .sort((a, b) => b.Quantidade - a.Quantidade)

  const ergoData = [
    { name: "Causa", value: stats.ergoStatus.Causa, color: "#eab308" },
    { name: "Concausa", value: stats.ergoStatus.Concausa, color: "#f97316" },
    { name: "Sem Nexo", value: stats.ergoStatus["Sem Nexo"], color: "#9ca3af" }
  ].filter(d => d.value > 0)

  const mentalData = [
    { name: "Causa", value: stats.mentalStatus.Causa, color: "#F6D000" },
    { name: "Concausa", value: stats.mentalStatus.Concausa, color: "#d97706" },
    { name: "Sem Nexo", value: stats.mentalStatus["Sem Nexo"], color: "#9ca3af" }
  ].filter(d => d.value > 0)

  const insalubridadeData = [
    { name: "Caracterizada", value: stats.insalubridadeStatus.Caracterizada, color: "#ef4444" },
    { name: "Não Caracterizada", value: stats.insalubridadeStatus["Não Caracterizada"], color: "#9ca3af" }
  ].filter(d => d.value > 0)

  const periculosidadeData = [
    { name: "Caracterizada", value: stats.periculosidadeStatus.Caracterizada, color: "#ef4444" },
    { name: "Não Caracterizada", value: stats.periculosidadeStatus["Não Caracterizada"], color: "#9ca3af" }
  ].filter(d => d.value > 0)

  // Subcomponent wrapper render logic for inner repetitive pies
  const renderMiniPie = (dataArray: any[], title: string, subtitle: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
          {dataArray.length > 0 && stats.total > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataArray}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataArray.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-muted-foreground">Sem dados</div>
          )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Laudos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Laudos registrados na base</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laudos Favoráveis</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.favoraveis}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.favoraveis / stats.total) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laudos Desfavoráveis</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.desfavoraveis}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.desfavoraveis / stats.total) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tipologia e Nexos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Natureza da Perícia</CardTitle>
          </CardHeader>
          <CardContent>
             {tiposData.length > 0 ? (
               <div className="h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={tiposData}
                       cx="50%"
                       cy="50%"
                       innerRadius={50}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {tiposData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={['#F6D000', '#d97706', '#9ca3af'][index % 3]} />
                       ))}
                     </Pie>
                     <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                     <Legend />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
             ) : (
                <div className="flex h-[250px] items-center justify-center text-muted-foreground">Sem dados de tipologia</div>
             )}
          </CardContent>
        </Card>

        {/* Distribuição Favorável vs Desfavorável */}
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Êxito em Perícias</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.total > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div className="flex h-[300px] items-center justify-center text-muted-foreground">Sem dados suficientes</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {renderMiniPie(ergoData, "Resultados de Doença Ergonômica", "Distribuição de Causa, Concausa e Sem Nexo")}
        {renderMiniPie(mentalData, "Resultados de Doença Mental", "Distribuição de Causa, Concausa e Sem Nexo")}
        {renderMiniPie(insalubridadeData, "Resultados de Insalubridade", "Distribuição de Caracterizada e Não Caracterizada")}
        {renderMiniPie(periculosidadeData, "Resultados de Periculosidade", "Distribuição de Caracterizada e Não Caracterizada")}
      </div>

      {/* Gráfico de Peritos (Favorável vs Desfavorável) */}
      <Card>
        <CardHeader>
          <CardTitle>Peritos por Volume de Condenações (Desfavoráveis)</CardTitle>
          <p className="text-sm text-muted-foreground">Ranking dos peritos que mais emitem pareceres desfavoráveis à empresa</p>
        </CardHeader>
        <CardContent>
          {peritosData.length > 0 ? (
            <div className="h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peritosData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={150} 
                    stroke="hsl(var(--muted-foreground))" 
                    tick={{fontSize: 12}} 
                  />
                  <Tooltip 
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="Desfavorável" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Favorável" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[450px] items-center justify-center text-muted-foreground">Sem dados de peritos correlacionados</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
