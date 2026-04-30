import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts"
import { AlertCircle, CheckCircle2, FileText, Search, ChevronLeft, ChevronRight, TrendingUp, Users, MapPin, User, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const THEME = {
  azulProfundo: "#102A63",
  azulInstitucional: "#183B8C",
  azulClaro: "#DCE6F8",
  favoravel: "#14B8A6",
  intermediario: "#4F6DB8",
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
  medicaMental: "#4F6DB8",
  ergonomica: "#4B5563"
}

export function LaudosTab({ laudos, processos = [] }: { laudos: any[], processos?: any[] }) {
  const [honorariosPage, setHonorariosPage] = useState(1);
  const [honorariosSearch, setHonorariosSearch] = useState("");
  const [peritoFilter, setPeritoFilter] = useState("Todos");
  const [assistenteFilter, setAssistenteFilter] = useState("Médico");

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

    let total = 0, favoraveis = 0, desfavoraveis = 0, incapacidadeCount = 0, acidenteTrabalhoCount = 0
    let motivos: Record<string, number> = { 
      "Doença Mental": 0, 
      "Doença Geral": 0, 
      "Insalubridade": 0, 
      "Periculosidade": 0,
      "Ergonomia": 0,
      "Outros": 0
    }
    let statsPerito: Record<string, { favoraveis: number, desfavoraveis: number, classificacao: string }> = {}
    let statsAssistenteMedico: Record<string, { favoraveis: number, desfavoraveis: number }> = {}
    let statsAssistenteTecnico: Record<string, { favoraveis: number, desfavoraveis: number }> = {}
    
    let matrizNexoIncapacidade: Record<string, Record<string, number>> = {
       "CAUSA": { "CAPAZ": 0, "INCAPAZ": 0, "TOTAL": 0 },
       "CONCAUSA": { "CAPAZ": 0, "INCAPAZ": 0, "TOTAL": 0 },
       "SEM NEXO": { "CAPAZ": 0, "INCAPAZ": 0, "TOTAL": 0 },
       "TOTAL": { "CAPAZ": 0, "INCAPAZ": 0, "TOTAL": 0 }
    }

    let composicaoDesfavoraveis = {
       "Causa / Concausa": 0,
       "Incapacidade": 0,
       "Acidente de Trabalho": 0,
       "Insalubridade": 0,
       "Periculosidade": 0,
       "Ergonomia": 0
    }

    let tiposLaudo: Record<string, number> = { "Técnica": 0, "Médica Geral": 0, "Médica Mental": 0, "Ergonômica": 0 }
    let nexos = { Concausa: 0, Causa: 0, "Incapacidade/Restrição": 0 }
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

      if (!hasTecnica && !hasMedicaGeral && !hasMental && !hasErgonomia) return;

      total++;

      const medicaVal = String(laudo.do_medica_geral || "").trim().toUpperCase()
      const incapacidadeVal = String(laudo.incapacidade || "").trim().toUpperCase()
      const acidenteVal = String(laudo.acidente_trabalho || "").trim().toUpperCase()

      if (incapacidadeVal === "INCAPAZ") incapacidadeCount++;
      if (acidenteVal === "TRUE" || laudo.acidente_trabalho === true) acidenteTrabalhoCount++;

      // Matriz Nexo x Incapacidade
      const nexoRow = ["CAUSA", "CONCAUSA"].includes(medicaVal) ? medicaVal : "SEM NEXO"
      const incapacidadeCol = incapacidadeVal === "INCAPAZ" ? "INCAPAZ" : (incapacidadeVal === "CAPAZ" ? "CAPAZ" : null)
      if (incapacidadeCol) {
         matrizNexoIncapacidade[nexoRow][incapacidadeCol]++;
         matrizNexoIncapacidade[nexoRow]["TOTAL"]++;
         matrizNexoIncapacidade["TOTAL"][incapacidadeCol]++;
         matrizNexoIncapacidade["TOTAL"]["TOTAL"]++;
      }

      const isBadForCompany = (val: any) => {
         if (val === true || val === "true") return true;
         if (!hasValue(val)) return false;
         const str = String(val).trim().toLowerCase();
         return ["true", "causa", "concausa", "incapaz", "restrição", "incapacidadeparcial", "desfavoravel", "desfavorável", "perda", "negativo", "caracterizada"].some(pc => str.includes(pc));
      }

      const isDesfavoravel = isBadForCompany(laudo.do_medica_geral) || isBadForCompany(laudo.incapacidade) || isBadForCompany(laudo.acidente_trabalho) || isBadForCompany(laudo.insalubridade) || isBadForCompany(laudo.periculosidade) || String(laudo.ergonomia).toUpperCase() === "NEGATIVO";

      if (isDesfavoravel) {
         desfavoraveis++;
         if (medicaVal === "CAUSA" || medicaVal === "CONCAUSA") composicaoDesfavoraveis["Causa / Concausa"]++;
         if (incapacidadeVal === "INCAPAZ") composicaoDesfavoraveis["Incapacidade"]++;
         if (acidenteVal === "TRUE" || laudo.acidente_trabalho === true) composicaoDesfavoraveis["Acidente de Trabalho"]++;
         if (String(laudo.insalubridade).toUpperCase() === "TRUE" || laudo.insalubridade === true) composicaoDesfavoraveis["Insalubridade"]++;
         if (String(laudo.periculosidade).toUpperCase() === "TRUE" || laudo.periculosidade === true) composicaoDesfavoraveis["Periculosidade"]++;
         if (String(laudo.ergonomia).toUpperCase() === "NEGATIVO") composicaoDesfavoraveis["Ergonomia"]++;
      } else {
         favoraveis++;
      }

      if (hasTecnica) tiposLaudo["Técnica"]++;
      if (hasMedicaGeral) tiposLaudo["Médica Geral"]++;
      if (hasMental) tiposLaudo["Médica Mental"]++;
      if (hasErgonomia) tiposLaudo["Ergonômica"]++;

      if (medicaVal === "CAUSA") medicaGeralStatus.Causa++;
      else if (medicaVal === "CONCAUSA") medicaGeralStatus.Concausa++;
      else medicaGeralStatus["Sem Nexo"]++;

      const mentalStr = String(laudo.do_mental || "").toLowerCase();
      if (mentalStr.includes("causa")) mentalStatus.Causa++;
      else if (mentalStr.includes("concausa")) mentalStatus.Concausa++;
      else mentalStatus["Sem Nexo"]++;

      if (String(laudo.insalubridade).toUpperCase() === "TRUE") insalubridadeStatus.Caracterizada++; else insalubridadeStatus["Não Caracterizada"]++;
      if (String(laudo.periculosidade).toUpperCase() === "TRUE") periculosidadeStatus.Caracterizada++; else periculosidadeStatus["Não Caracterizada"]++;
      
      const ergoVal = String(laudo.ergonomia || "").toUpperCase();
      if (ergoVal === "POSITIVO") ergonomiaStatus.Positivo++; else if (ergoVal === "NEGATIVO") ergonomiaStatus.Negativo++;

      const processoRelacionado = processos.find(p => String(p.numero_processo || '').trim() === String(laudo.numero_processo || '').trim()) || {};
      
      const registrarPerito = (nome: any, classif: string, campos: any[]) => {
         if (!nome || hasValue(nome) === false) return;
         const isDesfav = campos.some(f => isBadForCompany(f));
         const key = String(nome).trim();
         if (!statsPerito[key]) statsPerito[key] = { favoraveis: 0, desfavoraveis: 0, classificacao: classif };
         if (isDesfav) statsPerito[key].desfavoraveis++; else statsPerito[key].favoraveis++;
      }
      registrarPerito(processoRelacionado.perito_medico_psiquiatra, "Médico Psiquiatra", [laudo.do_mental]);
      registrarPerito(processoRelacionado.perito_medico_geral, "Médico", [laudo.do_medica_geral, laudo.incapacidade, laudo.acidente_trabalho]);
      registrarPerito(processoRelacionado.perito_ergonomico, "Ergonômico", [laudo.ergonomia]);
      registrarPerito(processoRelacionado.perito_tecnico, "Técnico", [laudo.insalubridade, laudo.periculosidade]);

      const registrarAssistente = (nome: any, obj: any, campos: any[]) => {
         if (!nome || hasValue(nome) === false) return;
         const isDesfav = campos.some(f => isBadForCompany(f));
         const key = String(nome).trim();
         if (!obj[key]) obj[key] = { favoraveis: 0, desfavoraveis: 0 };
         if (isDesfav) obj[key].desfavoraveis++; else obj[key].favoraveis++;
      }
      registrarAssistente(processoRelacionado.assistente_medico, statsAssistenteMedico, [laudo.do_medica_geral, laudo.incapacidade]);
      registrarAssistente(processoRelacionado.assistente_tecnico, statsAssistenteTecnico, [laudo.insalubridade, laudo.periculosidade]);
    })

    return { 
      total, favoraveis, desfavoraveis, incapacidadeCount, acidenteTrabalhoCount, matrizNexoIncapacidade, composicaoDesfavoraveis,
      statsPerito, statsAssistenteMedico, statsAssistenteTecnico, tiposLaudo, medicaGeralStatus, mentalStatus, insalubridadeStatus, periculosidadeStatus, ergonomiaStatus,
      totalValidos: total
    }
  }, [laudos, processos]);

  const KpiCard = ({ title, value, icon, subtext, percentage, color = "text-slate-800" }: any) => (
    <Card className="border border-border shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-slate-100 p-2 rounded-lg">{icon}</div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{percentage}</span>
      </div>
      <div className={`text-3xl font-black ${color} tracking-tighter`}>{value}</div>
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight mt-1 leading-none">{title}</div>
      <p className="text-[10px] text-slate-400 mt-2 font-medium">{subtext}</p>
    </Card>
  )

  const honorariosData = useMemo(() => {
    let totalHonorarios = 0;
    const lista: any[] = [];
    processos.forEach(p => {
      const valor = Number(p.honorario_pericia) || 0;
      if (valor > 0) {
        totalHonorarios += valor;
        const peritos = [];
        if (p.perito_tecnico) peritos.push({ nome: p.perito_tecnico, tipo: "Técnico" });
        if (p.perito_medico_geral) peritos.push({ nome: p.perito_medico_geral, tipo: "Médico" });
        if (p.perito_ergonomico) peritos.push({ nome: p.perito_ergonomico, tipo: "Ergonômico" });
        if (p.perito_medico_psiquiatra) peritos.push({ nome: p.perito_medico_psiquiatra, tipo: "Médico Psiquiatra" });
        lista.push({ numero: p.numero_processo, reclamante: p.nome_reclamante, vara: p.vara, comarca: p.comarca, valor, peritos });
      }
    });
    return { totalHonorarios, ticketMedio: lista.length > 0 ? totalHonorarios / lista.length : 0, lista };
  }, [processos]);

  const paginatedHonorarios = honorariosData.lista.slice((honorariosPage - 1) * 5, honorariosPage * 5);
  const totalPages = Math.ceil(honorariosData.lista.length / 5);

  const peritosData = useMemo(() => {
    let raw = Object.entries(stats.statsPerito).map(([name, data]) => ({ name, classificacao: data.classificacao, Favorável: data.favoraveis, Desfavorável: data.desfavoraveis, Total: data.favoraveis + data.desfavoraveis }));
    if (peritoFilter !== "Todos") raw = raw.filter(d => d.classificacao === peritoFilter);
    return raw.sort((a, b) => b.Desfavorável - a.Desfavorável).slice(0, 15);
  }, [stats.statsPerito, peritoFilter]);

  const assistentesData = useMemo(() => {
    const source = assistenteFilter === "Médico" ? stats.statsAssistenteMedico : stats.statsAssistenteTecnico;
    return Object.entries(source).map(([name, data]) => ({ name, Favorável: data.favoraveis, Desfavorável: data.desfavoraveis, Total: data.favoraveis + data.desfavoraveis })).sort((a, b) => b.Favorável - a.Favorável).slice(0, 15);
  }, [stats.statsAssistenteMedico, stats.statsAssistenteTecnico, assistenteFilter]);

  const tiposData = useMemo(() => [
    { name: "Técnica", value: stats.tiposLaudo["Técnica"], color: CATEGORICAL_COLORS.tecnica },
    { name: "Médica Geral", value: stats.tiposLaudo["Médica Geral"], color: CATEGORICAL_COLORS.medicaGeral },
    { name: "Médica Mental", value: stats.tiposLaudo["Médica Mental"], color: CATEGORICAL_COLORS.medicaMental },
    { name: "Ergonômica", value: stats.tiposLaudo["Ergonômica"], color: CATEGORICAL_COLORS.ergonomica },
  ].filter(d => d.value > 0), [stats.tiposLaudo]);

  const medicaGeralData = [{ name: "Causa", value: stats.medicaGeralStatus.Causa, color: THEME.critico }, { name: "Concausa", value: stats.medicaGeralStatus.Concausa, color: THEME.intermediario }, { name: "Sem Nexo", value: stats.medicaGeralStatus["Sem Nexo"], color: THEME.neutro }].filter(d => d.value > 0);
  const mentalData = [{ name: "Causa", value: stats.mentalStatus.Causa, color: THEME.critico }, { name: "Concausa", value: stats.mentalStatus.Concausa, color: THEME.intermediario }, { name: "Sem Nexo", value: stats.mentalStatus["Sem Nexo"], color: THEME.neutro }].filter(d => d.value > 0);
  const insalubridadeData = [{ name: "Caracterizada", value: stats.insalubridadeStatus.Caracterizada, color: THEME.critico }, { name: "Não Caracterizada", value: stats.insalubridadeStatus["Não Caracterizada"], color: THEME.favoravel }].filter(d => d.value > 0);
  const periculosidadeData = [{ name: "Caracterizada", value: stats.periculosidadeStatus.Caracterizada, color: THEME.critico }, { name: "Não Caracterizada", value: stats.periculosidadeStatus["Não Caracterizada"], color: THEME.favoravel }].filter(d => d.value > 0);
  const ergonomiaData = [{ name: "Favorável", value: stats.ergonomiaStatus.Positivo, color: THEME.favoravel }, { name: "Desfavorável", value: stats.ergonomiaStatus.Negativo, color: THEME.critico }].filter(d => d.value > 0);

  const renderMiniPie = (dataArray: any[], title: string, subtitle: string) => (
    <Card className="border border-border shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-slate-800">{title}</CardTitle>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={dataArray} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={6} dataKey="value" stroke="none">
                {dataArray.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }} />
              <Legend 
                verticalAlign="bottom" 
                align="center" 
                iconType="circle" 
                formatter={(value: string, entry: any) => {
                   const item = dataArray.find(d => d.name === value);
                   const total = dataArray.reduce((acc, curr) => acc + curr.value, 0);
                   const pct = total > 0 ? ((item?.value || 0) / total * 100).toFixed(1) : 0;
                   return <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">{value} ({item?.value}) <span className="text-slate-300 font-medium">{pct}%</span></span>
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
        <KpiCard title="Total de Laudos" value={stats.total} icon={<FileText className="h-5 w-5 text-slate-600" />} subtext="Perícias analisadas" percentage="100%" />
        <KpiCard title="Favoráveis" value={stats.favoraveis} icon={<CheckCircle2 className="h-5 w-5 text-teal-600" />} subtext="Taxa de êxito" percentage={`${stats.total > 0 ? ((stats.favoraveis / stats.total) * 100).toFixed(1) : 0}%`} color="text-teal-600" />
        <KpiCard title="Desfavoráveis" value={stats.desfavoraveis} icon={<AlertCircle className="h-5 w-5 text-red-600" />} subtext="Taxa de risco" percentage={`${stats.total > 0 ? ((stats.desfavoraveis / stats.total) * 100).toFixed(1) : 0}%`} color="text-red-600" />
        <KpiCard title="Incapacidade Reconhecida" value={stats.incapacidadeCount} icon={<User className="h-5 w-5 text-blue-600" />} subtext="processos com incapacidade" percentage={`${stats.total > 0 ? ((stats.incapacidadeCount / stats.total) * 100).toFixed(1) : 0}%`} />
        <KpiCard title="Acidente de Trabalho" value={stats.acidenteTrabalhoCount} icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} subtext="reconhecidos" percentage={`${stats.total > 0 ? ((stats.acidenteTrabalhoCount / stats.total) * 100).toFixed(1) : 0}%`} color="text-amber-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {renderMiniPie(tiposData, "Natureza das Perícias", "Distribuição por especialidade técnica")}
        {renderMiniPie(medicaGeralData, "Doença Médica Geral", "Causa, Concausa e Sem Nexo")}
        
        {renderMiniPie(mentalData, "Doença Mental", "Causa, Concausa e Sem Nexo")}
        {renderMiniPie(insalubridadeData, "Insalubridade", "Caracterizada e Não Caracterizada")}
        
        {renderMiniPie(periculosidadeData, "Periculosidade", "Caracterizada e Não Caracterizada")}
        {renderMiniPie(ergonomiaData, "Ergonomia", "Riscos ergonômicos")}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">Matriz Médica Geral x Incapacidade</CardTitle>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cruzamento entre nexo médico geral e capacidade laboral</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Médico Geral</th>
                    <th className="p-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Capaz</th>
                    <th className="p-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Incapaz</th>
                    <th className="p-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {["CAUSA", "CONCAUSA", "SEM NEXO", "TOTAL"].map((row) => (
                    <tr key={row} className={row === "TOTAL" ? "bg-slate-50/50 font-black" : ""}>
                      <td className="p-4 text-xs font-black text-slate-600 border-b border-slate-100 uppercase tracking-tight">{row}</td>
                      {["CAPAZ", "INCAPAZ", "TOTAL"].map((col) => {
                        const val = stats.matrizNexoIncapacidade[row][col];
                        const intensity = Math.min(0.8, (val / (stats.matrizNexoIncapacidade["TOTAL"]["TOTAL"] || 1)) * 3);
                        const isTotal = row === "TOTAL" || col === "TOTAL";
                        return (
                          <td 
                            key={col} 
                            className={cn(
                              "p-4 text-center text-xs font-black border-b border-slate-100 transition-colors",
                              isTotal ? "text-slate-500" : "text-[#102A63]"
                            )}
                            style={{ 
                              backgroundColor: isTotal ? "transparent" : `rgba(16, 42, 99, ${intensity * 0.12})` 
                            }}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">Composição dos Laudos Desfavoráveis</CardTitle>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fatores de risco nos {stats.desfavoraveis} laudos críticos</p>
          </CardHeader>
          <CardContent className="pt-4">
             <div className="space-y-6">
                {Object.entries(stats.composicaoDesfavoraveis).map(([label, count]) => {
                   const pct = stats.desfavoraveis > 0 ? (count / stats.desfavoraveis) * 100 : 0;
                   return (
                      <div key={label} className="space-y-2">
                         <div className="flex justify-between items-end">
                            <span className="text-xs font-black text-slate-600">{label}</span>
                            <span className="text-xs font-black text-slate-800">{count} <span className="text-slate-400 ml-1 font-bold">({pct.toFixed(1)}%)</span></span>
                         </div>
                         <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
                         </div>
                      </div>
                   )
                })}
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Ranking de Peritos</CardTitle>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Amostragem por volume de desfavorabilidade</p>
              </div>
              <div className="flex flex-wrap gap-1">
                 {["Todos", "Médico", "Técnico", "Ergonômico"].map(f => (
                   <button
                      key={f}
                      onClick={() => setPeritoFilter(f)}
                      className={cn(
                        "px-3 py-1 text-[10px] font-black uppercase rounded-full border transition-all",
                        peritoFilter === f ? "bg-slate-800 text-white border-slate-800 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      )}
                   >
                      {f}
                   </button>
                 ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peritosData} layout="vertical" margin={{ right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fontWeight: 700, fill: "#1e293b" }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                  />
                  <Bar dataKey="Desfavorável" fill={THEME.critico} stackId="a" barSize={18} minPointSize={5}>
                    <LabelList dataKey="Desfavorável" position="center" fill="#fff" style={{ fontSize: '9px', fontWeight: 900 }} formatter={(v: any) => v > 2 ? v : ""} />
                  </Bar>
                  <Bar dataKey="Favorável" fill={THEME.favoravel} stackId="a" barSize={18} minPointSize={5}>
                    <LabelList dataKey="Favorável" position="center" fill="#fff" style={{ fontSize: '9px', fontWeight: 900 }} formatter={(v: any) => v > 2 ? v : ""} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Performance de Assistentes</CardTitle>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Ranking por volume de resultados positivos</p>
              </div>
              <div className="flex flex-wrap gap-1">
                 {["Médico", "Técnico"].map(f => (
                   <button
                      key={f}
                      onClick={() => setAssistenteFilter(f)}
                      className={cn(
                        "px-4 py-1.5 text-[10px] font-black uppercase rounded-full border transition-all",
                        assistenteFilter === f ? "bg-teal-600 text-white border-teal-600 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      )}
                   >
                      {f}
                   </button>
                 ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assistentesData} layout="vertical" margin={{ right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fontWeight: 700, fill: "#1e293b" }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                  />
                  <Bar dataKey="Favorável" fill={THEME.favoravel} stackId="a" barSize={18} minPointSize={5}>
                    <LabelList dataKey="Favorável" position="center" fill="#fff" style={{ fontSize: '9px', fontWeight: 900 }} formatter={(v: any) => v > 2 ? v : ""} />
                  </Bar>
                  <Bar dataKey="Desfavorável" fill={THEME.critico} stackId="a" barSize={18} minPointSize={5}>
                    <LabelList dataKey="Desfavorável" position="center" fill="#fff" style={{ fontSize: '9px', fontWeight: 900 }} formatter={(v: any) => v > 2 ? v : ""} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 pt-10 border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-5 bg-white border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Honorários Prévios</div>
            <div className="text-2xl font-black text-[#102A63] tracking-tight">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(honorariosData.totalHonorarios)}</div>
          </Card>
          <Card className="p-5 bg-[#183B8C] text-white flex flex-col items-center justify-center">
            <div className="text-xl font-black tracking-tight">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(honorariosData.ticketMedio)}</div>
            <div className="text-[9px] font-black uppercase opacity-80 mt-0.5 tracking-widest">Ticket Médio</div>
          </Card>
          <Card className="p-5 bg-[#102A63] text-white flex flex-col items-center justify-center">
            <div className="text-2xl font-black tracking-tight">{honorariosData.lista.length}</div>
            <div className="text-[9px] font-black uppercase opacity-80 mt-0.5 tracking-widest">Volume de Processos</div>
          </Card>
        </div>

        <Card className="border border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 p-5 flex flex-row items-center justify-between border-b border-slate-100">
            <CardTitle className="text-lg font-black text-slate-800">Listagem de Honorários</CardTitle>
            <Input 
              className="w-full md:w-[320px] h-10 rounded-lg text-sm bg-white" 
              placeholder="Buscar..." 
              value={honorariosSearch} 
              onChange={(e) => setHonorariosSearch(e.target.value)} 
            />
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex flex-col gap-3">
              {paginatedHonorarios.map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 transition-all hover:shadow-lg border-l-4 border-l-[#102A63]">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-0.5">
                      <div className="text-base font-black text-[#102A63] tracking-tight">{item.numero}</div>
                      <div className="text-sm font-black text-slate-700 uppercase leading-none">{item.reclamante}</div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <MapPin className="h-3 w-3" /> {item.vara} {item.comarca}
                      </div>
                    </div>
                    <div className="bg-slate-50/80 px-3 py-2 rounded-xl text-right border border-slate-100 shrink-0">
                      <div className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Valor Pago</div>
                      <div className="text-base font-black text-[#102A63] tracking-tighter">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.valor)}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Peritos Nomeados</div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.peritos.map((p: any, pIdx: number) => (
                        <div key={pIdx} className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-500 shadow-sm">
                          <strong className="text-blue-700 mr-1">{p.tipo}:</strong> {p.nome}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between items-center border-t border-slate-50 pt-4">
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 text-[10px] font-black uppercase rounded-lg"
                onClick={() => setHonorariosPage(p => Math.max(1, p - 1))} 
                disabled={honorariosPage === 1}
              >
                Anterior
              </Button>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Página {honorariosPage} de {totalPages}</span>
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 text-[10px] font-black uppercase rounded-lg"
                onClick={() => setHonorariosPage(p => Math.min(totalPages, p + 1))} 
                disabled={honorariosPage === totalPages}
              >
                Próximo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
