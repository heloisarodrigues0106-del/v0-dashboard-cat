import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts"
import { AlertCircle, CheckCircle2, FileText, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const THEME = {
  azulProfundo: "#102A63",
  azulInstitucional: "#183B8C",
  azulClaro: "#DCE6F8",
  favoravel: "#14B8A6",
  intermediario: "#F59E0B",
  critico: "#DC2626",
  neutro: "#94A3B8",
  slate700: "#4B5563",
  background: "#F8FAFC",
  border: "#E5E7EB",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  amberLight: "#FEF3C7",
  tealLight: "#D9F3EF",
  slateLight: "#EEF2F7",
}

const CATEGORICAL_COLORS = {
  tecnica: "#183B8C",
  medicaGeral: "#94A3B8",
  medicaMental: "#F59E0B",
  ergonomica: "#4B5563"
}

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
    const hasValue = (val: any) => {
      const str = String(val).trim().toLowerCase();
      return str !== "" && str !== "null" && str !== "undefined" && str !== "nan" && str !== "false";
    }

    let total = 0
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
    let tiposLaudo: Record<string, number> = { 
      "Técnica": 0, 
      "Médica Geral": 0, 
      "Médica Mental": 0, 
      "Ergonômica": 0 
    }
    let nexos = { Causa: 0, Concausa: 0, "Incapacidade/Restrição": 0 }
    let medicaGeralStatus = { Causa: 0, Concausa: 0, "Sem Nexo": 0 }
    let ergoStatus = { Causa: 0, Concausa: 0, "Sem Nexo": 0 } 
    let mentalStatus = { Causa: 0, Concausa: 0, "Sem Nexo": 0 }
    let insalubridadeStatus = { Caracterizada: 0, "Não Caracterizada": 0 }
    let periculosidadeStatus = { Caracterizada: 0, "Não Caracterizada": 0 }
    let ergonomiaStatus = { Positivo: 0, Negativo: 0 }
    let grausInsalubridade = { "Mínimo (10%)": 0, "Médio (20%)": 0, "Máximo (40%)": 0 }

    laudos.forEach(laudo => {
      const hasTecnica = hasValue(laudo.insalubridade) || hasValue(laudo.periculosidade);
      const hasMedicaGeral = hasValue(laudo.do_medica_geral);
      const hasMental = hasValue(laudo.do_mental);
      const hasErgonomia = hasValue(laudo.ergonomia);

      const hasAnyMarking = hasTecnica || hasMedicaGeral || hasMental || hasErgonomia;
      if (!hasAnyMarking) return;

      total++;

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

      if (hasTecnica) tiposLaudo["Técnica"]++;
      if (hasMedicaGeral) tiposLaudo["Médica Geral"]++;
      if (hasMental) tiposLaudo["Médica Mental"]++;
      if (hasErgonomia) tiposLaudo["Ergonômica"]++;

      const mentalStr = String(laudo.do_mental || laudo.doenca_mental || "").trim().toLowerCase();

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

      // Nova Correlação de Peritos solicitada
      const processoRelacionado = processos.find(p => 
        String(p.numero_processo || '').trim() === String(laudo.numero_processo || '').trim()
      ) || {};

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
    
    return rawData.slice(0, 15)
  }, [stats.statsPerito, peritoFilter])

  const tiposData = [
    { name: "Técnica", value: stats.tiposLaudo["Técnica"], color: CATEGORICAL_COLORS.tecnica },
    { name: "Médica Geral", value: stats.tiposLaudo["Médica Geral"], color: CATEGORICAL_COLORS.medicaGeral },
    { name: "Médica Mental", value: stats.tiposLaudo["Médica Mental"], color: CATEGORICAL_COLORS.medicaMental },
    { name: "Ergonômica", value: stats.tiposLaudo["Ergonômica"], color: CATEGORICAL_COLORS.ergonomica },
  ].filter(d => d.value > 0)

  const nexosData = Object.entries(stats.nexos)
    .map(([name, Quantidade]) => ({ name, Quantidade, percent: stats.total > 0 ? ((Quantidade / stats.total) * 100).toFixed(1) : 0 }))

  const pieData = [
    { name: "Favoráveis", value: stats.favoraveis, color: THEME.favoravel }, 
    { name: "Desfavoráveis", value: stats.desfavoraveis, color: THEME.critico }, 
  ]

  const motivosData = Object.entries(stats.motivos)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, Quantidade: value }))
    .sort((a, b) => b.Quantidade - a.Quantidade)

  const medicaGeralData = [
    { name: "Causa", value: stats.medicaGeralStatus.Causa, color: THEME.critico },
    { name: "Concausa", value: stats.medicaGeralStatus.Concausa, color: THEME.intermediario },
    { name: "Sem Nexo", value: stats.medicaGeralStatus["Sem Nexo"], color: THEME.neutro }
  ].filter(d => d.value > 0)

  const mentalData = [
    { name: "Causa", value: stats.mentalStatus.Causa, color: THEME.critico },
    { name: "Concausa", value: stats.mentalStatus.Concausa, color: THEME.intermediario },
    { name: "Sem Nexo", value: stats.mentalStatus["Sem Nexo"], color: THEME.neutro }
  ].filter(d => d.value > 0)

  const insalubridadeData = [
    { name: "Caracterizada", value: stats.insalubridadeStatus.Caracterizada, color: THEME.critico },
    { name: "Não Caracterizada", value: stats.insalubridadeStatus["Não Caracterizada"], color: THEME.favoravel }
  ].filter(d => d.value > 0)

  const periculosidadeData = [
    { name: "Caracterizada", value: stats.periculosidadeStatus.Caracterizada, color: THEME.critico },
    { name: "Não Caracterizada", value: stats.periculosidadeStatus["Não Caracterizada"], color: THEME.favoravel }
  ].filter(d => d.value > 0)

  const ergonomiaData = [
    { name: "Favorável (S/ Risco)", value: stats.ergonomiaStatus.Positivo, color: THEME.favoravel },
    { name: "Desfavorável (C/ Risco)", value: stats.ergonomiaStatus.Negativo, color: THEME.critico }
  ].filter(d => d.value > 0)

  const grausInsalubridadeData = [
    { name: "Mínimo", value: stats.grausInsalubridade["Mínimo (10%)"], color: "#FBBF24" },
    { name: "Médio", value: stats.grausInsalubridade["Médio (20%)"], color: THEME.intermediario },
    { name: "Máximo", value: stats.grausInsalubridade["Máximo (40%)"], color: THEME.critico }
  ].filter(d => d.value > 0)

  // Subcomponent wrapper render logic for inner repetitive pies
  const renderMiniPie = (dataArray: any[], title: string, subtitle: string) => (
    <Card className="border-border shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-slate-800">{title}</CardTitle>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{subtitle}</p>
      </CardHeader>
      <CardContent>
          {dataArray.length > 0 && stats.total > 0 ? (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataArray}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {dataArray.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity duration-300" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }}
                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center" 
                    iconType="circle" 
                    iconSize={8}
                    formatter={(value) => <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-[11px] font-bold text-slate-300 uppercase">Sem amostragem</div>
          )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total de Laudos</CardTitle>
            <div className="bg-slate-100 p-2 rounded-lg">
              <FileText className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">{stats.total}</div>
            <p className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-tight">Perícias analisadas</p>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Favoráveis</CardTitle>
            <div className="bg-teal-50 p-2 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-teal-600">{stats.favoraveis}</div>
            <p className="text-[11px] font-bold text-teal-600/60 mt-1 uppercase tracking-tight">
              {stats.total > 0 ? ((stats.favoraveis / stats.total) * 100).toFixed(1) : 0}% de êxito
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Desfavoráveis</CardTitle>
            <div className="bg-red-50 p-2 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-red-600">{stats.desfavoraveis}</div>
            <p className="text-[11px] font-bold text-red-600/60 mt-1 uppercase tracking-tight">
              {stats.total > 0 ? ((stats.desfavoraveis / stats.total) * 100).toFixed(1) : 0}% de risco
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tipologia e Nexos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black text-slate-800 tracking-tight">Natureza da Perícia</CardTitle>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Distribuição por especialidade técnica</p>
          </CardHeader>
          <CardContent>
             {tiposData.length > 0 ? (
               <div className="h-[280px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={tiposData}
                       cx="50%"
                       cy="50%"
                       innerRadius={70}
                       outerRadius={95}
                       paddingAngle={5}
                       dataKey="value"
                       stroke="none"
                     >
                       {tiposData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity duration-300" />
                       ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }} 
                        itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                     />
                     <Legend 
                        verticalAlign="bottom" 
                        align="center" 
                        iconType="circle" 
                        iconSize={10}
                        formatter={(value) => <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-2">{value}</span>}
                     />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
             ) : (
                <div className="flex h-[280px] items-center justify-center text-[11px] font-black text-slate-300 uppercase tracking-widest">Sem dados de tipologia</div>
             )}
          </CardContent>
        </Card>

        {/* Distribuição Favorável vs Desfavorável */}
        <Card className="border-border shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black text-slate-800 tracking-tight">Taxa de Êxito em Perícias</CardTitle>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Equilíbrio entre êxito e risco jurídico</p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {stats.total > 0 ? (
               <div className="h-[280px] min-w-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity duration-300" />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }}
                       itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                    />
                    <Legend 
                       verticalAlign="bottom" 
                       align="center" 
                       iconType="circle" 
                       iconSize={10}
                       formatter={(value) => <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-2">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
                <div className="flex h-[280px] items-center justify-center text-[11px] font-black text-slate-300 uppercase tracking-widest">Sem amostragem suficiente</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
          <div className="h-[650px] w-full pt-4 overflow-x-auto">
            <div className="h-full min-w-[700px]">
            {peritosData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart  
                data={peritosData} 
                layout="vertical" 
                margin={{ top: 10, right: 120, left: 40, bottom: 20 }}
                barGap={0}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke={THEME.border} opacity={0.4} />
                <XAxis 
                  type="number" 
                  allowDecimals={false}
                  domain={[0, 'dataMax + 1']}
                  stroke={THEME.textSecondary} 
                  tick={{ fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={180} 
                  stroke={THEME.textPrimary} 
                  tick={{ fontSize: 12, fontWeight: 700, fill: THEME.textPrimary }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: THEME.slateLight, opacity: 0.5 }}
                  contentStyle={{ 
                    borderRadius: "12px", 
                    border: "1px solid #E5E7EB", 
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)",
                    padding: "12px"
                  }}
                  itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="center"
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ paddingBottom: "30px", paddingTop: "0px" }}
                  formatter={(value) => <span className="text-slate-600 font-bold px-2 text-xs uppercase tracking-wider">{value}</span>}
                />
                <Bar dataKey="Desfavorável" stackId="a" fill={THEME.critico} radius={[0, 0, 0, 0]} barSize={24}>
                  <LabelList 
                    dataKey="Desfavorável" 
                    position="center" 
                    fill="#fff" 
                    style={{ fontSize: '10px', fontWeight: 900 }}
                    formatter={(val: any) => val > 0 ? val : ""}
                  />
                </Bar>
                <Bar dataKey="Favorável" stackId="a" fill={THEME.favoravel} radius={[0, 4, 4, 0]} barSize={24}>
                  <LabelList 
                    dataKey="Favorável" 
                    position="center" 
                    fill="#fff" 
                    style={{ fontSize: '10px', fontWeight: 900 }} 
                    formatter={(val: any) => val > 0 ? val : ""}
                  />
                  <LabelList 
                    dataKey="Total" 
                    position="right" 
                    offset={15}
                    fill={THEME.textSecondary} 
                    style={{ fontSize: '11px', fontWeight: 800 }}
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
        </div>
      </CardContent>
      </Card>

      {/* Controle de Honorários Prévios */}
      <div className="space-y-6 pt-10 mt-10 border-t border-slate-100">
        
        {/* Novas Métricas de Destaque (Sem Tarja Azul) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Valor Principal - Destaque em Branco */}
          <Card className="md:col-span-6 bg-white border-slate-200 shadow-sm overflow-hidden flex flex-col justify-center p-8">
            <div className="text-sm font-black text-slate-400 uppercase tracking-[2px] mb-2">
              Investimento Consolidado em Honorários Prévios
            </div>
            <div className="text-4xl md:text-5xl font-black tracking-tighter text-[#102A63]">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(honorariosData.totalHonorarios)}
            </div>
          </Card>

          {/* Ticket Médio - Azul */}
          <Card className="md:col-span-3 bg-[#183B8C] border-none shadow-lg overflow-hidden flex flex-col items-center justify-center p-6 text-white transition-transform hover:scale-[1.02] duration-300">
            <div className="p-2 bg-white/10 rounded-lg mb-3">
              <TrendingUp className="h-5 w-5 text-blue-100" />
            </div>
            <div className="text-[22px] font-black tracking-tight">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(honorariosData.ticketMedio)}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">Ticket Médio</div>
          </Card>

          {/* Volume - Azul Profundo */}
          <Card className="md:col-span-3 bg-[#102A63] border-none shadow-lg overflow-hidden flex flex-col items-center justify-center p-6 text-white transition-transform hover:scale-[1.02] duration-300">
            <div className="p-2 bg-white/10 rounded-lg mb-3">
              <Users className="h-5 w-5 text-blue-100" />
            </div>
            <div className="text-[28px] font-black tracking-tight">{honorariosData.qtdProcessos}</div>
            <div className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">Volume de Processos</div>
          </Card>
        </div>

        {/* Lista com Paginação, Header e Busca */}
        <Card className="border border-border bg-card shadow-sm mt-4 overflow-hidden">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 bg-slate-50/50 border-b border-slate-100 px-8 py-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                Listagem Detalhada
              </CardTitle>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Relatório de honorários pagos por processo e reclamante</p>
            </div>
            
            <div className="relative w-full md:w-[400px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar por nº processo, reclamante ou perito..." 
                className="pl-11 bg-white border-slate-200 focus:border-[#183B8C] focus:ring-4 focus:ring-blue-50 transition-all text-sm h-12 rounded-xl"
                value={honorariosSearch}
                onChange={(e) => {
                   setHonorariosSearch(e.target.value)
                   setHonorariosPage(1)
                }}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0 px-8 pt-6">
            <div className="w-full overflow-x-auto pb-4">
              <div className="flex flex-col gap-4 min-w-[850px] pb-4">
              {paginatedHonorarios.map((item, idx) => {
                return (
                 <div key={`hon-${idx}`} className="flex flex-col p-6 bg-white border border-slate-100 rounded-2xl transition-all hover:border-slate-200 hover:shadow-xl group">
                    
                    {/* Camada Superior: Dados Principais */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-5 pb-5 border-b border-dashed border-slate-100">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-[#102A63] text-base tracking-tight">{item.numero}</span>
                          <div className="h-1 w-1 rounded-full bg-slate-300" />
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.reclamante}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <MapPin className="h-3 w-3 text-slate-300" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[1px]">
                             {item.vara ? `${item.vara} ` : ""}
                             {item.comarca ? `${item.vara ? '• ' : ''}${item.comarca}` : "Vara não informada"}
                           </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Pago</span>
                        <div className="text-2xl font-black text-[#102A63] tracking-tighter">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.valor)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Camada Inferior: Peritos (Com espaço total) */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[2px]">Peritos Nomeados</span>
                      <div className="flex flex-wrap gap-3">
                        {item.peritos.map((perito: any, pIdx: number) => {
                          const pType = perito.tipo?.toUpperCase() || "N/A";
                          let badgeStyles = "bg-slate-100 text-slate-600 border-slate-200";
                          
                          if (pType.includes("TÉCNICO")) badgeStyles = "bg-[#DCE6F8] text-[#183B8C] border-[#B8D1F3]";
                          else if (pType.includes("MÉDICO")) badgeStyles = "bg-[#EEF2F7] text-[#4B5563] border-[#D1D5DB]";
                          else if (pType.includes("ERGONÔMICO")) badgeStyles = "bg-[#D9F3EF] text-[#0F766E] border-[#A7F3D0]";
                          else if (pType.includes("MENTAL") || pType.includes("PSIQ")) badgeStyles = "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]";

                          return (
                            <div key={pIdx} className="flex items-center gap-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-colors">
                              <span className={cn("inline-flex items-center rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-tight border", badgeStyles)}>
                                {perito.tipo}
                              </span>
                              <span className="text-[13px] text-slate-700 font-black tracking-tight whitespace-normal break-words max-w-[400px]">
                                {perito.nome}
                              </span>
                            </div>
                          )
                        })}
                        {item.peritos.length === 0 && (
                          <span className="text-[11px] font-bold text-slate-300 italic">Nenhum perito listado</span>
                        )}
                      </div>
                    </div>
                 </div>
                )
              })}
          {honorariosData.lista.length === 0 && (
             <div className="p-8 bg-white border border-slate-200 rounded-md text-sm text-slate-500 text-center">
               Nenhum honorário pericial registrado.
             </div>
          )}
        </div>
      </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between pb-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Mostrando {honorariosData.lista.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, honorariosData.lista.length)} de {honorariosData.lista.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-500 disabled:opacity-30"
                onClick={() => setHonorariosPage(p => Math.max(1, p - 1))}
                disabled={honorariosPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
              <div className="bg-white px-4 h-9 flex items-center justify-center rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Página {honorariosPage} / {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-500 disabled:opacity-30"
                onClick={() => setHonorariosPage(p => Math.min(totalPages, p + 1))}
                disabled={honorariosPage >= totalPages}
              >
                Próximo <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
