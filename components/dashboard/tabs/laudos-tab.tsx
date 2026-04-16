import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts"
import { AlertCircle, CheckCircle2, FileText, Search, ChevronLeft, ChevronRight } from "lucide-react"

export function LaudosTab({ laudos, processos = [] }: { laudos: any[], processos?: any[] }) {
  const [honorariosPage, setHonorariosPage] = useState(1);
  const [honorariosSearch, setHonorariosSearch] = useState("");
  const [peritoFilter, setPeritoFilter] = useState("Todos");

  const peritoClassificacaoMap = useMemo(() => {
    const map: Record<string, string> = {};
    processos.forEach(p => {
      if (p.perito_medico_psiquiatra) map[String(p.perito_medico_psiquiatra).trim().toUpperCase()] = "Médico Psiquiatra";
      if (p.perito_medico_geral) map[String(p.perito_medico_geral).trim().toUpperCase()] = "Médico";
      if (p.perito_ergonomico) map[String(p.perito_ergonomico).trim().toUpperCase()] = "Ergonômico";
      if (p.perito_tecnico) map[String(p.perito_tecnico).trim().toUpperCase()] = "Técnico";
    });
    return map;
  }, [processos]);
  
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
    let statsPerito: Record<string, { favoraveis: number, desfavoraveis: number, classificacao: string }> = {}
    let tiposLaudo: Record<string, number> = { "Técnica": 0, "Médica Ergonômica": 0, "Médica Mental": 0, "Outros/Não Especificado": 0 }
    let nexos = { Causa: 0, Concausa: 0, "Incapacidade/Restrição": 0 }
    let medicaGeralStatus = { Causa: 0, Concausa: 0, "Sem Nexo": 0 }
    let ergoStatus = { Causa: 0, Concausa: 0, "Sem Nexo": 0 } // Manter se for usar separadamente, mas para o gráfico principal vamos usar medicaGeralStatus
    let mentalStatus = { Causa: 0, Concausa: 0, "Sem Nexo": 0 }
    let insalubridadeStatus = { Caracterizada: 0, "Não Caracterizada": 0 }
    let periculosidadeStatus = { Caracterizada: 0, "Não Caracterizada": 0 }
    let ergonomiaStatus = { Positivo: 0, Negativo: 0 }
    let grausInsalubridade = { "Mínimo (10%)": 0, "Médio (20%)": 0, "Máximo (40%)": 0 }

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

      // Gráfico Específico para do_medica_geral 
      // Substitui o antigo de Doença Ergonômica conforme pedido
      const medicaVal = String(laudo.do_medica_geral || "").toLowerCase().trim()
      if (medicaVal.includes("concausa")) {
        medicaGeralStatus.Concausa++
      } else if (medicaVal.includes("causa")) {
        medicaGeralStatus.Causa++
      } else {
        medicaGeralStatus["Sem Nexo"]++
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

      // Gráfico Específico para Ergonomia (Riscos nas atividades)
      const ergonomiaVal = String(laudo.ergonomia || "").toUpperCase()
      if (ergonomiaVal === "POSITIVO") {
        ergonomiaStatus.Positivo++
      } else if (ergonomiaVal === "NEGATIVO") {
        ergonomiaStatus.Negativo++
      }

      // Nova Correlação de Peritos solicitada: Extração via tb_processo e validação de seus respectivos campos no laudo
      const processoRelacionado = processos.find(p => 
        String(p.numero_processo || '').trim() === String(laudo.numero_processo || '').trim()
      ) || {};

      const hasValue = (val: any) => {
         const str = String(val).trim().toLowerCase();
         return str !== "" && str !== "null" && str !== "undefined" && str !== "nan" && str !== "false";
      }

      // Além de identificar 'bad words', lidamos com caso o campo seja true
      const isBadForCompany = (val: any) => {
         if (val === true || val === "true") return true;
         if (!hasValue(val)) return false;
         const str = String(val).trim().toLowerCase();
         return ["true", "causa", "concausa", "incapaz", "restrição", "incapacidadeparcial", "desfavoravel", "desfavorável", "perda", "negativo", "caracterizada"].some(pc => str.includes(pc));
      }

      const registrarEstatisticaPerito = (nomePerito: any, classificacao: string, camposAvaliados: any[]) => {
         if (!nomePerito || hasValue(nomePerito) === false) return;
         
         const camposValidos = camposAvaliados.filter(f => hasValue(f) || f === true || f === false);
         if (camposValidos.length === 0) return; // Nenhuma avaliação dessa área neste laudo

         const isDesfav = camposValidos.some(f => isBadForCompany(f));
         const key = String(nomePerito).trim();

         if (!statsPerito[key]) {
            statsPerito[key] = { favoraveis: 0, desfavoraveis: 0, classificacao };
         }
         
         if (isDesfav) statsPerito[key].desfavoraveis++;
         else statsPerito[key].favoraveis++;
      }

      // 1. Psiquiatra
      registrarEstatisticaPerito(
         processoRelacionado.perito_medico_psiquiatra, 
         "Médico Psiquiatra", 
         [laudo.do_mental, laudo.doenca_mental]
      );

      // 2. Médico Geral
      registrarEstatisticaPerito(
         processoRelacionado.perito_medico_geral, 
         "Médico", 
         [laudo.do_medica_geral, laudo.doenca, laudo.acidente_trabalho, laudo.incapacidade]
      );

      // 3. Ergonômico
      registrarEstatisticaPerito(
         processoRelacionado.perito_ergonomico, 
         "Ergonômico", 
         [laudo.ergonomia, laudo.do_ergonomica, laudo.doenca_ergonomica]
      );

      // 4. Técnico
      registrarEstatisticaPerito(
         processoRelacionado.perito_tecnico, 
         "Técnico", 
         [laudo.insalubridade, laudo.periculosidade]
      );
    })

    // Agregação de Graus de Insalubridade de tb_laudo.grau_insalubridade
    laudos.forEach(laudo => {
      const grauRaw = laudo.grau_insalubridade || ""
      const grau = String(grauRaw).trim().toUpperCase().replace(',', '.')
      
      if (grau === "0.1" || grau.includes("10") || grau.includes("MÍNIMO")) {
          grausInsalubridade["Mínimo (10%)"]++
      } else if (grau === "0.2" || grau.includes("20") || grau.includes("MÉDIO")) {
          grausInsalubridade["Médio (20%)"]++
      } else if (grau === "0.4" || grau.includes("40") || grau.includes("MÁXIMO")) {
          grausInsalubridade["Máximo (40%)"]++
      }
    })

    return { 
      total, favoraveis, desfavoraveis, motivos, statsPerito, tiposLaudo, nexos, 
      medicaGeralStatus, ergoStatus, mentalStatus, insalubridadeStatus, periculosidadeStatus, ergonomiaStatus, grausInsalubridade
    }
  }, [laudos, processos, peritoClassificacaoMap])

  const honorariosData = useMemo(() => {
    let totalHonorarios = 0;
    const lista: any[] = [];
    const lowerSearch = honorariosSearch.toLowerCase();

    processos.forEach(p => {
      const valor = Number(p.honorario_pericia) || 0;
      if (valor > 0) {
        const num = p.numero_processo || "S/N";
        const rec = p.nome_reclamante || "Não informado";
        
        if (lowerSearch && 
            !num.toLowerCase().includes(lowerSearch) && 
            !rec.toLowerCase().includes(lowerSearch) &&
            !(p.funcao_reclamante || "").toLowerCase().includes(lowerSearch)
        ) {
            return;
        }

        totalHonorarios += valor;
        
        let peritosEncontrados = [];
        
        if (p.perito_tecnico) {
            peritosEncontrados.push({ nome: p.perito_tecnico, tipo: "Técnico" });
        }
        if (p.perito_ergonomico) {
            peritosEncontrados.push({ nome: p.perito_ergonomico, tipo: "Ergonômico" });
        }
        if (p.perito_medico_geral) {
            peritosEncontrados.push({ nome: p.perito_medico_geral, tipo: "Médico" });
        }
        if (p.perito_medico_psiquiatra) {
            peritosEncontrados.push({ nome: p.perito_medico_psiquiatra, tipo: "Médico Psiquiatra" });
        }

        lista.push({
          numero: num,
          reclamante: rec,
          vara: p.vara,
          comarca: p.comarca,
          valor: valor,
          peritos: peritosEncontrados.length > 0 ? peritosEncontrados : [{ nome: "Não informado", tipo: "N/A" }]
        });
      }
    });

    lista.sort((a, b) => b.valor - a.valor);
    
    return { 
      totalHonorarios, 
      qtdProcessos: lista.length, 
      ticketMedio: lista.length > 0 ? (totalHonorarios / lista.length) : 0, 
      lista 
    };
  }, [processos, honorariosSearch]);

  const itemsPerPage = 5;
  const paginatedHonorarios = honorariosData.lista.slice((honorariosPage - 1) * itemsPerPage, honorariosPage * itemsPerPage);
  const totalPages = Math.ceil(honorariosData.lista.length / itemsPerPage);
  const startIndex = (honorariosPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const peritosData = useMemo(() => {
    let rawData = Object.entries(stats.statsPerito)
      .map(([name, data]) => ({ 
        name, 
        classificacao: data.classificacao,
        Favorável: data.favoraveis, 
        Desfavorável: data.desfavoraveis, 
        Total: data.favoraveis + data.desfavoraveis 
      }));

    if (peritoFilter !== "Todos") {
        rawData = rawData.filter(d => d.classificacao === peritoFilter);
    }

    rawData = rawData.sort((a, b) => b.Desfavorável - a.Desfavorável) // Prioridade: Maior volume de desfavoráveis no topo
    
    // Se não houver dados reais na base, mostramos o demo, apenas se a base estiver VAZIA.
    if (stats.total === 0) {
      return [
        { name: "Dr. Carlos Silva", Desfavorável: 45, Favorável: 5, Total: 50 },
        { name: "Dra. Ana Pereira", Desfavorável: 40, Favorável: 10, Total: 50 },
        { name: "Eng. Marcos Souza", Desfavorável: 35, Favorável: 15, Total: 50 },
        { name: "Dr. Roberto Dias", Desfavorável: 30, Favorável: 20, Total: 50 },
        { name: "Dra. Juliana Lima", Desfavorável: 25, Favorável: 25, Total: 50 },
        { name: "Eng. Paulo Rocha", Desfavorável: 15, Favorável: 35, Total: 50 },
        { name: "Dr. Fernando Costa", Desfavorável: 10, Favorável: 40, Total: 50 },
        { name: "Dra. Beatriz Santos", Desfavorável: 5, Favorável: 45, Total: 50 },
        { name: "Eng. Ricardo Oliveira", Desfavorável: 2, Favorável: 48, Total: 50 },
        { name: "Dr. Sergio Martins", Desfavorável: 0, Favorável: 50, Total: 50 },
      ]
    }
    
    return rawData.slice(0, 15)
  }, [stats.statsPerito, peritoFilter])

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

  const medicaGeralData = [
    { name: "Causa", value: stats.medicaGeralStatus.Causa, color: "#eab308" },
    { name: "Concausa", value: stats.medicaGeralStatus.Concausa, color: "#f97316" },
    { name: "Sem Nexo", value: stats.medicaGeralStatus["Sem Nexo"], color: "#9ca3af" }
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

  const ergonomiaData = [
    { name: "Favorável (S/ Risco)", value: stats.ergonomiaStatus.Positivo, color: "#10b981" },
    { name: "Desfavorável (C/ Risco)", value: stats.ergonomiaStatus.Negativo, color: "#ef4444" }
  ].filter(d => d.value > 0)

  const grausInsalubridadeData = [
    { name: "Mínimo (10%)", value: stats.grausInsalubridade["Mínimo (10%)"], color: "#9ca3af" },
    { name: "Médio (20%)", value: stats.grausInsalubridade["Médio (20%)"], color: "#f97316" },
    { name: "Máximo (40%)", value: stats.grausInsalubridade["Máximo (40%)"], color: "#ef4444" }
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
        {renderMiniPie(medicaGeralData, "Resultados de Doença Médica Geral", "Distribuição de Causa, Concausa e Sem Nexo")}
        {renderMiniPie(mentalData, "Resultados de Doença Mental", "Distribuição de Causa, Concausa e Sem Nexo")}
        {renderMiniPie(insalubridadeData, "Resultados de Insalubridade", "Distribuição de Caracterizada e Não Caracterizada")}
        {renderMiniPie(grausInsalubridadeData, "Graus de Insalubridade", "Distribuição por intensidade aferida")}
        {renderMiniPie(periculosidadeData, "Resultados de Periculosidade", "Distribuição de Caracterizada e Não Caracterizada")}
        {renderMiniPie(ergonomiaData, "Resultados de Ergonomia", "Riscos ergonômicos reconhecidos nas atividades")}
      </div>

      {/* Gráfico de Peritos (Favorável vs Desfavorável) */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl font-bold text-slate-900">Ranking e Perfil Técnico de Peritos</CardTitle>
              <p className="text-sm text-slate-500 font-medium">Posicionamento detalhado dos peritos com maior volume de pareceres desfavoráveis.</p>
            </div>

            <div className="flex flex-wrap gap-2">
               {["Todos", "Médico Psiquiatra", "Médico", "Ergonômico", "Técnico"].map(f => (
                 <button
                    key={f}
                    onClick={() => setPeritoFilter(f)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors border ${peritoFilter === f ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                 >
                    {f}
                 </button>
               ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[650px] w-full pt-4">
            {peritosData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart  
                data={peritosData} 
                layout="vertical" 
                margin={{ top: 10, right: 120, left: 40, bottom: 20 }}
                barGap={0}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="hsl(var(--muted))" opacity={0.4} />
                <XAxis 
                  type="number" 
                  allowDecimals={false}
                  domain={[0, 'dataMax + 1']}
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fontSize: 13, fontWeight: 500 }}
                  axisLine={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={180} 
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fontSize: 13, fontWeight: 600, fill: '#334155' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                  contentStyle={{ 
                    borderRadius: "12px", 
                    border: "none", 
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    padding: "12px"
                  }}
                  itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="center"
                  iconType="rect"
                  iconSize={14}
                  wrapperStyle={{ paddingBottom: "30px", paddingTop: "0px" }}
                  formatter={(value) => <span className="text-slate-700 font-semibold px-2">{value}</span>}
                />
                <Bar 
                  dataKey="Desfavorável" 
                  stackId="a" 
                  fill="#ef4444" 
                  radius={[0, 0, 0, 0]}
                  barSize={32}
                >
                  <LabelList 
                    dataKey="Desfavorável" 
                    position="center" 
                    fill="#fff" 
                    style={{ fontSize: '12px', fontWeight: 700 }} 
                    formatter={(val: any) => val > 0 ? val : ""}
                  />
                </Bar>
                <Bar 
                  dataKey="Favorável" 
                  stackId="a" 
                  fill="#14b8a6" 
                  radius={[0, 8, 8, 0]}
                  barSize={32}
                >
                  <LabelList 
                    dataKey="Favorável" 
                    position="center" 
                    fill="#fff" 
                    style={{ fontSize: '12px', fontWeight: 700 }} 
                    formatter={(val: any) => val > 0 ? val : ""}
                  />
                  <LabelList 
                    dataKey="Total" 
                    position="right" 
                    offset={15}
                    fill="#64748b" 
                    style={{ fontSize: '12px', fontWeight: 700 }}
                    formatter={(val: any) => `Total: ${val}`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            ) : (
               <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                 <span className="font-semibold text-lg text-slate-500">Nenhum perito encontrado.</span>
                 <span className="text-sm">Tente selecionar outra classificação ou ajustar os filtros globais.</span>
               </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controle de Honorários Prévios */}
      <div className="space-y-4 pt-8 mt-8 border-t border-slate-100">
        
        {/* Banner de Métricas (Header) */}
        <Card className="bg-slate-50 border-slate-200 shadow-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <div className="text-3xl md:text-4xl font-black text-slate-800">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(honorariosData.totalHonorarios)}
                </div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                  Investimento Total em Honorários Prévios
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-white rounded-md p-4 border border-slate-200 flex flex-col items-center justify-center min-w-[140px]">
                  <span className="text-xl font-bold text-slate-800">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(honorariosData.ticketMedio)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Ticket Médio</span>
                </div>
                <div className="bg-white rounded-md p-4 border border-slate-200 flex flex-col items-center justify-center min-w-[140px]">
                  <span className="text-xl font-bold text-slate-800">{honorariosData.qtdProcessos}</span>
                  <span className="text-xs text-slate-500 font-medium">Qtd de Processos</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista com Paginação, Header e Busca */}
        <Card className="border border-border bg-card shadow-sm mt-4">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                Listagem Detalhada
              </CardTitle>
              <p className="text-sm text-muted-foreground">Relatório de honorários pagos por processo e reclamante</p>
            </div>
            
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nº processo, reclamante ou cargo..." 
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm h-10"
                value={honorariosSearch}
                onChange={(e) => {
                   setHonorariosSearch(e.target.value)
                   setHonorariosPage(1)
                }}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0 px-6">
            <div className="flex flex-col gap-2">
              {paginatedHonorarios.map((item, idx) => (
                 <div key={`hon-${idx}`} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white border border-slate-200 rounded-md transition-colors hover:bg-slate-50">
                    
                    {/* Esquerda: Número do Processo e Reclamante */}
                    <div className="w-full md:w-[30%] flex flex-col gap-1 mb-2 md:mb-0 shrink-0">
                      <span className="font-bold text-slate-900 text-sm tracking-tight">{item.numero}</span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase">{item.reclamante}</span>
                    </div>
                    
                    {/* Centro: Vara/Juízo e Peritos */}
                    <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-[55%] gap-2 shrink-0">
                  <span className="text-sm text-slate-500 shrink-0">
                    {item.vara ? `${item.vara} ` : ""}
                    {item.comarca ? `${item.vara ? '-' : ''} ${item.comarca}` : ""}
                  </span>
                  <span className="text-slate-300 hidden md:inline">|</span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 w-full">
                    {item.peritos.map((perito: any, pIdx: number) => (
                      <div key={pIdx} className="flex items-center gap-1.5 shrink-0">
                        <span className="text-sm rounded-sm text-slate-700 font-medium truncate" title={perito.nome}>
                           {perito.nome}
                        </span>
                        {perito.tipo !== "N/A" && (
                          <span className="inline-flex items-center rounded bg-slate-100 flex-shrink-0 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600 ring-1 ring-inset ring-slate-400/20">
                            {perito.tipo}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direita: Valor Pago */}
                <div className="w-full md:w-[15%] font-bold text-slate-900 text-right mt-2 md:mt-0 shrink-0 text-sm">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.valor)}
                </div>
             </div>
          ))}
          {honorariosData.lista.length === 0 && (
             <div className="p-8 bg-white border border-slate-200 rounded-md text-sm text-slate-500 text-center">
               Nenhum honorário pericial registrado.
             </div>
          )}
        </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between pb-6">
            <p className="text-xs md:text-sm text-muted-foreground">
              {honorariosData.lista.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, honorariosData.lista.length)} de {honorariosData.lista.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHonorariosPage((prev) => Math.max(prev - 1, 1))}
                disabled={honorariosPage === 1}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="hidden md:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={honorariosPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHonorariosPage(page)}
                    className={`h-8 w-8 p-0 ${honorariosPage === page ? 'bg-[#F6D000] text-[#111111] hover:bg-[#d97706]' : ''}`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHonorariosPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={honorariosPage === totalPages}
                className="gap-1.5"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  )
}
